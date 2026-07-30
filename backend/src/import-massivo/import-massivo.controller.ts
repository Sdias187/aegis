import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import * as XLSX from 'xlsx';
import { ImportMassivoService } from './import-massivo.service';

@Controller('import-massivo')
export class ImportMassivoController {
  constructor(private readonly importService: ImportMassivoService) {}

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  async preview(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'Nenhum arquivo enviado' };
    }

    const sessionId = randomUUID();
    const rows = this.importService.parseFile(file.buffer, file.originalname, sessionId);

    const validRows = rows.filter((r) => !r.errors || r.errors.length === 0);
    const invalidRows = rows.filter((r) => r.errors && r.errors.length > 0);

    return {
      sessionId,
      totalRows: rows.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      preview: rows.slice(0, 50),
      invalidRows: invalidRows.slice(0, 20),
    };
  }

  @Post('execute/:sessionId')
  async execute(@Param('sessionId') sessionId: string) {
    const session = this.importService.getSession(sessionId);

    // Start import in background
    this.importService.executeImport(sessionId).catch(() => {
      // Error already handled inside service
    });

    return {
      message: 'Importação iniciada',
      sessionId,
    };
  }

  @Get('status/:sessionId')
  async status(@Param('sessionId') sessionId: string) {
    return this.importService.getStatus(sessionId);
  }

  @Get('modelo')
  async downloadModelo(
    @Query('formato') formato: string,
    @Res() res: Response,
  ) {
    if (formato && !['csv', 'xlsx'].includes(formato)) {
      return res.status(400).json({
        type: 'BAD_REQUEST',
        message: 'Formato inválido. Use "csv" ou "xlsx".',
      });
    }

    const headerRow = [
      'ATENDIMENTO_PARA',
      'SERVICO',
      'OFERTA_SERVICO',
      'DETALHE_FALHA',
      'CATEGORIA',
      'SUBCATEGORIA',
    ];

    const exampleRow = [
      'b2c',
      'EXEMPLO DE SERVICO',
      'EXEMPLO DE OFERTA',
      'EXEMPLO DE FALHA',
      'EXEMPLO CATEGORIA',
      'EXEMPLO SUBCATEGORIA',
    ];

    if (formato === 'xlsx') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);
      XLSX.utils.book_append_sheet(wb, ws, 'Modelo');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="modelo-importacao-fichas.xlsx"',
      });
      res.send(buffer);
    } else {
      // Default: CSV
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headerRow, exampleRow]);
      XLSX.utils.book_append_sheet(wb, ws, 'Modelo');

      const csv = XLSX.write(wb, { type: 'string', bookType: 'csv' });

      res.set({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="modelo-importacao-fichas.csv"',
      });
      res.send(csv);
    }
  }
}

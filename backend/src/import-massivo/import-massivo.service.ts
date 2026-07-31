import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import oracledb from 'oracledb';
import * as XLSX from 'xlsx';
import { DatabaseService } from '../database/database.service';

export interface ImportRow {
  rowNumber: number;
  atendimentoPara: string;
  servico: string;
  ofertaServico?: string;
  detalheFalha?: string;
  categoria?: string;
  subcategoria?: string;
  errors?: string[];
}

export interface ImportSession {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  rows: ImportRow[];
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
  createdAt: Date;
  updatedAt: Date;
  fileName: string;
}

const EXPECTED_HEADERS = [
  'ATENDIMENTO_PARA',
  'SERVICO',
  'OFERTA_SERVICO',
  'DETALHE_FALHA',
  'CATEGORIA',
  'SUBCATEGORIA',
];

@Injectable()
export class ImportMassivoService {
  private readonly logger = new Logger(ImportMassivoService.name);
  private sessions = new Map<string, ImportSession>();

  constructor(private readonly db: DatabaseService) {}

  parseFile(buffer: Buffer, fileName: string, sessionId: string): ImportRow[] {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException(
        'Arquivo vazio. Selecione um arquivo .csv ou .xlsx com os dados para importar.',
      );
    }

    const ext = fileName.split('.').pop()?.toLowerCase();

    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      throw new BadRequestException(
        `Formato inválido: "${ext ? '.' + ext : 'sem extensão'}". Apenas arquivos .csv e .xlsx são aceitos.`,
      );
    }
    let workbook: XLSX.WorkBook;

    try {
      if (ext === 'csv') {
        // CSV precisa ser lido como string para evitar detecção incorreta de formato
        const content = buffer.toString('utf-8');
        workbook = XLSX.read(content, { type: 'string', raw: true });
      } else if (ext === 'xlsx' || ext === 'xls') {
        workbook = XLSX.read(buffer, { type: 'buffer', raw: true });
      } else {
        throw new BadRequestException(`Formato não suportado: .${ext}. Use .csv ou .xlsx`);
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Falha ao ler arquivo ${fileName}: ${(err as Error).message}`);
      throw new BadRequestException(
        'Não foi possível ler o arquivo. Verifique se é um CSV ou XLSX válido.',
      );
    }
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new BadRequestException('Arquivo vazio ou sem planilha válida');
    }

    const rawData = XLSX.utils.sheet_to_json<Record<string, string>>(workbook.Sheets[sheetName], { defval: '' });

    if (!rawData || rawData.length === 0) {
      throw new BadRequestException(
        'Arquivo contém apenas cabeçalho, sem dados para importar. ' +
        'Preencha as linhas com os registros desejados.',
      );
    }

    // Validate headers
    const headers = Object.keys(rawData[0]).map((h) => h.toUpperCase().trim());
    const missingHeaders = EXPECTED_HEADERS.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Colunas obrigatórias não encontradas: ${missingHeaders.join(', ')}. ` +
        `Use o modelo disponível para download.`,
      );
    }

    const rows: ImportRow[] = rawData.map((raw, i) => {
      const row: ImportRow = {
        rowNumber: i + 1,
        atendimentoPara: this.normalizeAtendimentoPara(raw.ATENDIMENTO_PARA ?? raw.atendimentoPara ?? '') || '',
        servico: this.normalizeText(raw.SERVICO ?? raw.servico ?? '') || '',
        ofertaServico: this.normalizeText(raw.OFERTA_SERVICO ?? raw.ofertaServico ?? '') || undefined,
        detalheFalha: this.normalizeText(raw.DETALHE_FALHA ?? raw.detalheFalha ?? '') || undefined,
        categoria: this.normalizeText(raw.CATEGORIA ?? raw.categoria ?? '') || undefined,
        subcategoria: this.normalizeText(raw.SUBCATEGORIA ?? raw.subcategoria ?? '') || undefined,
        errors: [],
      };

      const rowErrors: string[] = [];

      if (!row.atendimentoPara) {
        rowErrors.push('ATENDIMENTO_PARA é obrigatório');
      } else if (!['b2c', 'b2b', 'interno'].includes(row.atendimentoPara)) {
        rowErrors.push(`ATENDIMENTO_PARA inválido: "${raw.ATENDIMENTO_PARA ?? raw.atendimentoPara}". Use b2c, b2b ou interno`);
      }

      if (!row.servico) {
        rowErrors.push('SERVICO é obrigatório');
      }

      row.errors = rowErrors;

      return row;
    });

    // Create session
    const session: ImportSession = {
      id: sessionId,
      status: 'pending',
      rows,
      totalRows: rows.length,
      processedRows: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      fileName,
    };

    this.sessions.set(sessionId, session);

    return rows;
  }

  getSession(sessionId: string): ImportSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new NotFoundException('Sessão de importação não encontrada ou expirada');
    }
    return session;
  }

  getStatus(sessionId: string): Partial<ImportSession> {
    const session = this.getSession(sessionId);
    return {
      id: session.id,
      status: session.status,
      totalRows: session.totalRows,
      processedRows: session.processedRows,
      successCount: session.successCount,
      errorCount: session.errorCount,
      errors: session.errors,
      updatedAt: session.updatedAt,
      fileName: session.fileName,
    };
  }

  async executeImport(sessionId: string): Promise<ImportSession> {
    const session = this.getSession(sessionId);

    if (session.status === 'running') {
      throw new BadRequestException('Importação já está em execução');
    }

    // Retry: reset failed rows, keep successes
    if (session.status === 'failed' || session.status === 'completed') {
      // Keep only rows that haven't been successfully processed
      const remainingRows = session.rows.slice(session.processedRows);
      session.rows = remainingRows;
      session.totalRows = remainingRows.length;
      session.processedRows = 0;
      session.successCount = 0;
      session.errorCount = 0;
      session.errors = [];
    }

    session.status = 'running';
    session.updatedAt = new Date();

    const BATCH_SIZE = 10;

    try {
      for (let i = 0; i < session.rows.length; i += BATCH_SIZE) {
        const batch = session.rows.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map((row) => this.insertRow(row));

        const results = await Promise.allSettled(batchPromises);

        results.forEach((result, idx) => {
          const row = batch[idx];
          if (result.status === 'fulfilled') {
            session.successCount++;
          } else {
            session.errorCount++;
            session.errors.push({
              row: row.rowNumber,
              message: result.reason?.message || 'Erro desconhecido',
            });
          }
        });

        session.processedRows += batch.length;
        session.updatedAt = new Date();
      }

      session.status = session.errorCount > 0 ? 'completed' : 'completed';
      session.updatedAt = new Date();
      this.logger.log(
        `Importação ${sessionId} concluída: ${session.successCount} sucessos, ${session.errorCount} erros em ${session.totalRows} linhas`,
      );
    } catch (err) {
      session.status = 'failed';
      session.updatedAt = new Date();
      this.logger.error(`Importação ${sessionId} falhou: ${(err as Error).message}`);
    }

    return session;
  }

  private async insertRow(row: ImportRow): Promise<void> {
    const categoria = row.categoria?.trim() || 'N/A';
    const subcategoria = row.subcategoria?.trim() || 'N/A';

    const result = await this.db.executeQuery(
      `INSERT INTO AEGIS_FICHAS (ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
       VALUES (:atendimentoPara, :servico, :ofertaServico, :detalheFalha, :categoria, :subcategoria)
       RETURNING ID INTO :id`,
      {
        atendimentoPara: row.atendimentoPara,
        servico: row.servico,
        ofertaServico: row.ofertaServico ?? null,
        detalheFalha: row.detalheFalha ?? null,
        categoria,
        subcategoria,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
    );

    if (typeof result.outBinds?.id !== 'number') {
      throw new Error('Não foi possível obter o ID da ficha importada');
    }
  }

  private normalizeAtendimentoPara(value: string): string {
    return value.trim().toLowerCase();
  }

  private normalizeText(value: string): string {
    return value.trim().toUpperCase();
  }
}

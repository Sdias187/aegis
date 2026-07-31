import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FichasService } from './fichas.service';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import type { CreateFichaDto, PaginationParams, UpdateFichaDto } from '../common/interfaces';

@Controller('fichas')
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Get()
  async list(@Query(PaginationPipe) params: PaginationParams) {
    return this.fichasService.list(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.fichasService.getById(id);
    if (!result) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Ficha não encontrada' });
    }
    return result;
  }

  @Post()
  async create(@Body() data: CreateFichaDto) {
    return this.fichasService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateFichaDto) {
    return this.fichasService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.fichasService.remove(id);
  }
}

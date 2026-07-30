import { Controller, Get, Post, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import type { PaginationParams, CreateFichaDto } from '../common/interfaces';

@Controller('fichas')
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Get()
  async list(@Query(PaginationPipe) params: PaginationParams) {
    return this.fichasService.list(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const numericId = Number(id);
    const result = await this.fichasService.getById(numericId);
    if (!result) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Ficha não encontrada' });
    }
    return result;
  }

  @Post()
  async create(@Body() data: CreateFichaDto) {
    return this.fichasService.create(data);
  }
}

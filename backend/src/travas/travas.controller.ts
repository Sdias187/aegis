import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { TravasService } from './travas.service';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import type { PaginationParams } from '../common/interfaces';

@Controller('travas')
export class TravasController {
  constructor(private readonly travasService: TravasService) {}

  @Get()
  async list(@Query(PaginationPipe) params: PaginationParams) {
    return this.travasService.list(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const numericId = Number(id);
    const result = await this.travasService.getById(numericId);
    if (!result) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Trava não encontrada' });
    }
    return result;
  }
}

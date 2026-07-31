import { Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
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
  async getById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.travasService.getById(id);
    if (!result) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Trava não encontrada' });
    }
    return result;
  }

  @Post(':id/disable')
  async disable(@Param('id', ParseIntPipe) id: number) {
    return this.travasService.disable(id);
  }
}

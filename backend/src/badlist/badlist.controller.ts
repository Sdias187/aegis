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
import { BadlistService } from './badlist.service';
import { CreateBadlistDto } from '../common/dto/create-badlist.dto';
import { UpdateBadlistDto } from '../common/dto/update-badlist.dto';
import { PaginationPipe } from '../common/pipes/pagination.pipe';
import type { PaginationParams } from '../common/interfaces';

@Controller('badlist')
export class BadlistController {
  constructor(private readonly badlistService: BadlistService) {}

  @Get()
  async list(@Query(PaginationPipe) params: PaginationParams) {
    return this.badlistService.list(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.badlistService.getById(id);
    if (!result) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Badlist não encontrada' });
    }
    return result;
  }

  @Post()
  async create(@Body() data: CreateBadlistDto) {
    return this.badlistService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateBadlistDto) {
    return this.badlistService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.badlistService.remove(id);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { MonitoringService, type MonitoringQueryParams } from './monitoring.service';

@Controller('monitoring/logs')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  async list(@Query() query: Record<string, string>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const params: MonitoringQueryParams = {
      page,
      limit,
      search: query.search,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      durationMin: query.durationMin ? Number(query.durationMin) : undefined,
      durationMax: query.durationMax ? Number(query.durationMax) : undefined,
      sortBy: query.sortBy,
      sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    return this.monitoringService.list(params);
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ExecutionLogsService, type LogsQueryParams } from './execution-logs.service';

@Controller('logs/execucao')
export class ExecutionLogsController {
  constructor(private readonly logsService: ExecutionLogsService) {}

  @Get()
  async list(@Query() query: Record<string, string>) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const params: LogsQueryParams = {
      page,
      limit,
      search: query.search,
      endpoint: query.endpoint,
      validationName: query.validationName,
      status: query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      executionTimeMin: query.executionTimeMin ? Number(query.executionTimeMin) : undefined,
      executionTimeMax: query.executionTimeMax ? Number(query.executionTimeMax) : undefined,
      sortBy: query.sortBy,
      sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    return this.logsService.list(params);
  }
}

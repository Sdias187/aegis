import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async summary() {
    return this.dashboardService.getSummary();
  }

  @Get('recent-activity')
  async recentActivity() {
    return this.dashboardService.getRecentActivity();
  }

  @Get('health')
  async health() {
    return this.dashboardService.getHealth();
  }
}

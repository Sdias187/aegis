import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  health() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
    };
  }
}

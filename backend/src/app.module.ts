import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { FichasModule } from './fichas/fichas.module';
import { TravasModule } from './travas/travas.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ImportMassivoModule } from './import-massivo/import-massivo.module';
import { ExecutionLogsModule } from './execution-logs/execution-logs.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AppController } from './app.controller';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    DatabaseModule,
    FichasModule,
    TravasModule,
    DashboardModule,
    ImportMassivoModule,
    ExecutionLogsModule,
    MonitoringModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

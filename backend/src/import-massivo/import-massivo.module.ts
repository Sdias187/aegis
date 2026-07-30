import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImportMassivoController } from './import-massivo.controller';
import { ImportMassivoService } from './import-massivo.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [ImportMassivoController],
  providers: [ImportMassivoService],
})
export class ImportMassivoModule {}

import { Module } from '@nestjs/common';
import { TravasController } from './travas.controller';
import { TravasService } from './travas.service';

@Module({
  controllers: [TravasController],
  providers: [TravasService],
})
export class TravasModule {}

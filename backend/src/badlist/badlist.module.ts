import { Module } from '@nestjs/common';
import { BadlistController } from './badlist.controller';
import { BadlistService } from './badlist.service';

@Module({
  controllers: [BadlistController],
  providers: [BadlistService],
})
export class BadlistModule {}

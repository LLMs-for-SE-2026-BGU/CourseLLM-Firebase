import { Module } from '@nestjs/common';
import { MemoriesController } from './memories.controller';
import { MemoriesService } from './memories.service';
import { Mem0Service } from './mem0.service';

@Module({
  controllers: [MemoriesController],
  providers: [MemoriesService, Mem0Service],
  exports: [MemoriesService, Mem0Service],
})
export class MemoriesModule {}

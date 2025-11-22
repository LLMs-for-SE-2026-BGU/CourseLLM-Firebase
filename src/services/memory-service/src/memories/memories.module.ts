import { Module } from "@nestjs/common";
import { MemoriesController } from "./memories.controller";
import { MemoriesService } from "./memories.service";
import { Mem0Service } from "./mem0.service";
import { PrismaChatService, PrismaUserService, PrismaMessageService } from "../common/implementations";

@Module({
  controllers: [MemoriesController],
  providers: [
    MemoriesService,
    Mem0Service,
    {
      provide: 'IChatService',
      useClass: PrismaChatService,
    },
    {
      provide: 'IUserService',
      useClass: PrismaUserService,
    },
    {
      provide: 'IMessageService',
      useClass: PrismaMessageService,
    },
  ],
  exports: [MemoriesService, Mem0Service],
})
export class MemoriesModule {}

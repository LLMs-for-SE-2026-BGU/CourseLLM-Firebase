import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { UsersModule } from "./users/users.module";
import { ChatsModule } from "./chats/chats.module";
import { MessagesModule } from "./messages/messages.module";
import { MemoriesModule } from "./memories/memories.module";
import { LoggerModule } from "./common/logger/logger.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    HealthModule,
    DatabaseModule,
    UsersModule,
    ChatsModule,
    MessagesModule,
    MemoriesModule,
  ],
})
export class AppModule {}

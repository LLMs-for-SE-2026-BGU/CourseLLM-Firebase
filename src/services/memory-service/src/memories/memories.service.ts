import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { Mem0Service } from "./mem0.service";
import { SynthesizeMemoriesDto } from "./dto/synthesize-memories.dto";
import { CustomLoggerService } from "../common/logger/logger.service";

@Injectable()
export class MemoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mem0Service: Mem0Service,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext("MemoriesService");
  }

  async synthesizeMemories(dto: SynthesizeMemoriesDto) {
    const startTime = Date.now();
    this.logger.info(
      `Starting memory synthesis for chat ${dto.chatID}${dto.query ? ` with query: ${dto.query}` : ""}`,
    );

    try {
      // Get chat and verify it exists
      this.logger.debug(`Fetching chat ${dto.chatID} from database`);
      const chat = await this.prisma.chat.findUnique({
        where: { id: dto.chatID },
        include: {
          messages: {
            orderBy: { sequenceNumber: "asc" },
            select: {
              content: true,
              sender: true,
            },
          },
        },
      });

      if (!chat) {
        this.logger.warn(`Chat ${dto.chatID} not found`);
        throw new NotFoundException(`Chat ${dto.chatID} not found`);
      }

      this.logger.debug(
        `Retrieved chat ${dto.chatID} with ${chat.messages.length} messages for user ${chat.userId}`,
      );

      if (chat.messages.length === 0) {
        this.logger.info(
          `Chat ${dto.chatID} has no messages, skipping synthesis`,
        );
        return {
          success: true,
          memoriesCreated: 0,
          memories: [],
        };
      }

      // Convert messages to mem0.ai format
      const mem0Messages = chat.messages.map((msg) => ({
        role: msg.sender as "user" | "assistant" | "system",
        content: msg.content,
      }));
      this.logger.debug(
        `Converted ${mem0Messages.length} messages to mem0 format`,
      );

      // Call mem0.ai to synthesize memories
      const metadata = {
        chat_id: dto.chatID,
        query: dto.query,
        timestamp: new Date().toISOString(),
      };

      this.logger.debug(`Calling mem0 service to synthesize memories`);
      const synthesizedMemories = await this.mem0Service.addMemories(
        mem0Messages,
        chat.userId,
        metadata,
      );

      // Store memory metadata in PostgreSQL
      this.logger.debug(
        `Storing ${synthesizedMemories.length} memories in database`,
      );
      const memoryRecords = await Promise.all(
        synthesizedMemories.map((mem) =>
          this.prisma.memory.create({
            data: {
              userId: chat.userId,
              content: mem.memory,
              mem0MemoryId: mem.id,
              sourceChatIds: [dto.chatID],
            },
          }),
        ),
      );

      const processingTime = Date.now() - startTime;
      this.logger.info(
        `Successfully synthesized ${memoryRecords.length} memories for chat ${dto.chatID} in ${processingTime}ms`,
      );

      return {
        success: true,
        memoriesCreated: memoryRecords.length,
        memories: memoryRecords.map((m) => m.content),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Failed to synthesize memories for chat ${dto.chatID} after ${processingTime}ms: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        memoriesCreated: 0,
        memories: [],
        error: error.message,
      };
    }
  }

  async getUserMemories(userId: string) {
    this.logger.info(`Retrieving memories for user ${userId}`);

    try {
      // Verify user exists
      this.logger.debug(`Verifying user ${userId} exists`);
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn(`User ${userId} not found`);
        throw new NotFoundException(`User ${userId} not found`);
      }

      // Get memories from PostgreSQL
      this.logger.debug(`Fetching memories for user ${userId} from database`);
      const memories = await this.prisma.memory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          sourceChatIds: true,
        },
      });

      this.logger.info(
        `Successfully retrieved ${memories.length} memories for user ${userId}`,
      );

      return {
        memories: memories.map((mem) => ({
          memoryID: mem.id,
          content: mem.content,
          createdAt: mem.createdAt.toISOString(),
          relatedChats: mem.sourceChatIds,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve memories for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to retrieve memories: ${error.message}`);
    }
  }
}

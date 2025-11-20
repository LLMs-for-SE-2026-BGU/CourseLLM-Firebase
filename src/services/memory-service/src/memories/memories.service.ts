import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Mem0Service } from './mem0.service';
import { SynthesizeMemoriesDto } from './dto/synthesize-memories.dto';

@Injectable()
export class MemoriesService {
  private readonly logger = new Logger(MemoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mem0Service: Mem0Service,
  ) {}

  async synthesizeMemories(dto: SynthesizeMemoriesDto) {
    const startTime = Date.now();

    try {
      // Get chat and verify it exists
      const chat = await this.prisma.chat.findUnique({
        where: { id: dto.chatID },
        include: {
          messages: {
            orderBy: { sequenceNumber: 'asc' },
            select: {
              content: true,
              sender: true,
            },
          },
        },
      });

      if (!chat) {
        throw new NotFoundException(`Chat ${dto.chatID} not found`);
      }

      if (chat.messages.length === 0) {
        return {
          success: true,
          memoriesCreated: 0,
          memories: [],
        };
      }

      // Convert messages to mem0.ai format
      const mem0Messages = chat.messages.map((msg) => ({
        role: msg.sender as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      // Call mem0.ai to synthesize memories
      const metadata = {
        chat_id: dto.chatID,
        query: dto.query,
        timestamp: new Date().toISOString(),
      };

      const synthesizedMemories = await this.mem0Service.addMemories(
        mem0Messages,
        chat.userId,
        metadata,
      );

      // Store memory metadata in PostgreSQL
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
      this.logger.log(
        `Synthesized ${memoryRecords.length} memories for chat ${dto.chatID} in ${processingTime}ms`,
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
      this.logger.error(
        `Error synthesizing memories: ${error.message}`,
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
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      // Get memories from PostgreSQL
      const memories = await this.prisma.memory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          sourceChatIds: true,
        },
      });

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
        `Error retrieving memories: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to retrieve memories: ${error.message}`);
    }
  }
}

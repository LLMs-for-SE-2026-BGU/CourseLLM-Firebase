import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getConversation(chatId: string, page: number = 1, pageSize: number = 20) {
    try {
      // Verify chat exists
      const chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        throw new NotFoundException(`Chat ${chatId} not found`);
      }

      // Get total message count
      const totalMessages = await this.prisma.message.count({
        where: { chatId },
      });

      const totalPages = Math.ceil(totalMessages / pageSize);
      const skip = (page - 1) * pageSize;

      // Get messages (newest first)
      const messages = await this.prisma.message.findMany({
        where: { chatId },
        orderBy: { sequenceNumber: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          content: true,
          sender: true,
          createdAt: true,
        },
      });

      return {
        messages: messages.map((msg) => ({
          messageID: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.createdAt.toISOString(),
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error retrieving conversation: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to retrieve conversation: ${error.message}`);
    }
  }

  async getUserConversations(userId: string, limit?: number) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }

      // Get conversations ordered by last updated (most recent first)
      const conversations = await this.prisma.chat.findMany({
        where: { userId },
        orderBy: { lastUpdatedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          title: true,
          createdAt: true,
          lastUpdatedAt: true,
          messageCount: true,
        },
      });

      return {
        conversations: conversations.map((chat) => ({
          chatID: chat.id,
          title: chat.title || 'Untitled Conversation',
          createdAt: chat.createdAt.toISOString(),
          lastUpdatedAt: chat.lastUpdatedAt.toISOString(),
          messageCount: chat.messageCount,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error retrieving user conversations: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to retrieve conversations: ${error.message}`);
    }
  }
}

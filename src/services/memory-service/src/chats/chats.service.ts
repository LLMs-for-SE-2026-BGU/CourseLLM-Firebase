import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { CustomLoggerService } from "../common/logger/logger.service";

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext("ChatsService");
  }

  async getConversation(
    chatId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    this.logger.info(
      `Retrieving conversation ${chatId} (page ${page}, pageSize ${pageSize})`,
    );

    try {
      // Verify chat exists
      this.logger.debug(`Verifying chat ${chatId} exists`);
      const chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        this.logger.warn(`Chat ${chatId} not found`);
        throw new NotFoundException(`Chat ${chatId} not found`);
      }

      // Get total message count
      this.logger.debug(`Counting messages in chat ${chatId}`);
      const totalMessages = await this.prisma.message.count({
        where: { chatId },
      });

      const totalPages = Math.ceil(totalMessages / pageSize);
      const skip = (page - 1) * pageSize;

      this.logger.debug(
        `Fetching messages ${skip + 1}-${skip + pageSize} of ${totalMessages} total`,
      );

      // Get messages (newest first)
      const messages = await this.prisma.message.findMany({
        where: { chatId },
        orderBy: { sequenceNumber: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          content: true,
          sender: true,
          createdAt: true,
        },
      });

      this.logger.info(
        `Successfully retrieved ${messages.length} messages from chat ${chatId} (page ${page}/${totalPages})`,
      );

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
        `Failed to retrieve conversation ${chatId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to retrieve conversation: ${error.message}`);
    }
  }

  async getUserConversations(userId: string, limit?: number) {
    this.logger.info(
      `Retrieving conversations for user ${userId}${limit ? ` (limit: ${limit})` : ""}`,
    );

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

      // Get conversations ordered by last updated (most recent first)
      this.logger.debug(
        `Fetching conversations for user ${userId} ordered by last update`,
      );
      const conversations = await this.prisma.chat.findMany({
        where: { userId },
        orderBy: { lastUpdatedAt: "desc" },
        take: limit,
        select: {
          id: true,
          title: true,
          createdAt: true,
          lastUpdatedAt: true,
          messageCount: true,
        },
      });

      this.logger.info(
        `Successfully retrieved ${conversations.length} conversations for user ${userId}`,
      );

      return {
        conversations: conversations.map((chat) => ({
          chatID: chat.id,
          title: chat.title || "Untitled Conversation",
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
        `Failed to retrieve conversations for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to retrieve conversations: ${error.message}`);
    }
  }
}

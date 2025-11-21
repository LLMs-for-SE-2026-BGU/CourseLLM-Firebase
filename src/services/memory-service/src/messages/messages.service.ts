import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { SaveMessageDto } from "./dto/save-message.dto";
import { CustomLoggerService } from "../common/logger/logger.service";

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext("MessagesService");
  }

  async saveMessage(dto: SaveMessageDto) {
    this.logger.info(
      `Saving message from ${dto.sender} to chat ${dto.chatID || "new conversation"}`,
    );

    try {
      let chatId = dto.chatID;

      // If no chatID provided, create new conversation
      if (!chatId) {
        if (!dto.userID) {
          this.logger.warn(
            "Attempted to create new conversation without userID",
          );
          throw new BadRequestException(
            "userID is required when creating a new conversation",
          );
        }

        // Verify user exists
        this.logger.debug(`Verifying user ${dto.userID} exists`);
        const user = await this.prisma.user.findUnique({
          where: { id: dto.userID },
        });

        if (!user) {
          this.logger.warn(`User ${dto.userID} not found`);
          throw new NotFoundException(`User ${dto.userID} not found`);
        }

        // Create new chat with auto-generated title
        const title = this.generateTitleFromContent(dto.content);
        this.logger.debug(
          `Creating new chat for user ${dto.userID} with title: "${title}"`,
        );
        const newChat = await this.prisma.chat.create({
          data: {
            userId: dto.userID,
            title,
          },
        });
        chatId = newChat.id;
        this.logger.info(
          `Created new chat ${chatId} for user ${dto.userID} with title: "${title}"`,
        );
      } else {
        // Verify chat exists
        this.logger.debug(`Verifying chat ${chatId} exists`);
        const chat = await this.prisma.chat.findUnique({
          where: { id: chatId },
        });

        if (!chat) {
          this.logger.warn(`Chat ${chatId} not found`);
          throw new NotFoundException(`Chat ${chatId} not found`);
        }
        this.logger.debug(
          `Chat ${chatId} verified, belongs to user ${chat.userId}`,
        );
      }

      // Save message
      this.logger.debug(
        `Saving ${dto.sender} message to chat ${chatId} (content length: ${dto.content.length})`,
      );
      const message = await this.prisma.message.create({
        data: {
          chatId,
          content: dto.content,
          sender: dto.sender,
          metadata: dto.metadata || {},
        },
      });

      // Update chat's last_updated_at and message_count
      this.logger.debug(`Updating chat ${chatId} metadata`);
      await this.prisma.chat.update({
        where: { id: chatId },
        data: {
          lastUpdatedAt: new Date(),
          messageCount: { increment: 1 },
        },
      });

      this.logger.info(
        `Successfully saved message ${message.id} to chat ${chatId} (seq: ${message.sequenceNumber})`,
      );

      return {
        success: true,
        chatID: chatId,
        messageID: message.id,
        timestamp: message.createdAt.toISOString(),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to save message: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  private generateTitleFromContent(content: string): string {
    // Generate title from first message (truncate to 50 chars)
    const maxLength = 50;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + "...";
  }
}

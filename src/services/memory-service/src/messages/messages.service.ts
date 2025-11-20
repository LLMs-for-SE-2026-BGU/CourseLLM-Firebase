import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SaveMessageDto } from './dto/save-message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(dto: SaveMessageDto) {
    try {
      let chatId = dto.chatID;

      // If no chatID provided, create new conversation
      if (!chatId) {
        if (!dto.userID) {
          throw new BadRequestException(
            'userID is required when creating a new conversation',
          );
        }

        // Verify user exists
        const user = await this.prisma.user.findUnique({
          where: { id: dto.userID },
        });

        if (!user) {
          throw new NotFoundException(`User ${dto.userID} not found`);
        }

        // Create new chat with auto-generated title
        const newChat = await this.prisma.chat.create({
          data: {
            userId: dto.userID,
            title: this.generateTitleFromContent(dto.content),
          },
        });
        chatId = newChat.id;
        this.logger.log(`Created new chat ${chatId} for user ${dto.userID}`);
      } else {
        // Verify chat exists
        const chat = await this.prisma.chat.findUnique({
          where: { id: chatId },
        });

        if (!chat) {
          throw new NotFoundException(`Chat ${chatId} not found`);
        }
      }

      // Save message
      const message = await this.prisma.message.create({
        data: {
          chatId,
          content: dto.content,
          sender: dto.sender,
          metadata: dto.metadata || {},
        },
      });

      // Update chat's last_updated_at and message_count
      await this.prisma.chat.update({
        where: { id: chatId },
        data: {
          lastUpdatedAt: new Date(),
          messageCount: { increment: 1 },
        },
      });

      this.logger.log(`Message ${message.id} saved to chat ${chatId}`);

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
      this.logger.error(`Error saving message: ${error.message}`, error.stack);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  private generateTitleFromContent(content: string): string {
    // Generate title from first message (truncate to 50 chars)
    const maxLength = 50;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + '...';
  }
}

import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { IMessageService, SaveMessageRequest, SaveMessageResponse } from "../interfaces";
import { PrismaService } from "../../database/prisma.service";
import { MessageSender } from "@prisma/client";

@Injectable()
export class PrismaMessageService implements IMessageService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessage(request: SaveMessageRequest): Promise<SaveMessageResponse> {
    let chatId = request.chatID;

    // If no chatID provided, create new conversation
    if (!chatId) {
      if (!request.userID) {
        throw new BadRequestException(
          "userID is required when creating a new conversation",
        );
      }

      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: request.userID },
      });

      if (!user) {
        throw new NotFoundException(`User ${request.userID} not found`);
      }

      // Create new chat with auto-generated title
      const title = this.generateTitleFromContent(request.content);
      const newChat = await this.prisma.chat.create({
        data: {
          userId: request.userID,
          title,
        },
      });
      chatId = newChat.id;
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
        content: request.content,
        sender: request.sender as MessageSender,
        metadata: request.metadata || {},
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

    return {
      success: true,
      chatID: chatId,
      messageID: message.id,
      timestamp: message.createdAt.toISOString(),
    };
  }

  private generateTitleFromContent(content: string): string {
    const maxLength = 50;
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength).trim() + "...";
  }
}

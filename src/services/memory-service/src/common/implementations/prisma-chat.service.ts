import { Injectable } from "@nestjs/common";
import { IChatService, ChatWithMessages } from "../interfaces";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PrismaChatService implements IChatService {
  constructor(private readonly prisma: PrismaService) {}

  async findChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
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
      return null;
    }

    return {
      id: chat.id,
      userId: chat.userId,
      title: chat.title,
      messages: chat.messages.map((msg) => ({
        content: msg.content,
        sender: msg.sender,
      })),
    };
  }
}

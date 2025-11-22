import { Injectable } from "@nestjs/common";
import { IChatService, ChatWithMessages } from "../interfaces";

@Injectable()
export class MockChatService implements IChatService {
  private chats: Map<string, ChatWithMessages> = new Map();

  async findChatWithMessages(chatId: string): Promise<ChatWithMessages | null> {
    return this.chats.get(chatId) || null;
  }

  // Helper methods for testing
  addMockChat(chat: ChatWithMessages): void {
    this.chats.set(chat.id, chat);
  }

  clearMockData(): void {
    this.chats.clear();
  }
}

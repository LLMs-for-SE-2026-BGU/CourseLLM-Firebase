import { Injectable } from "@nestjs/common";
import { IUserService, User } from "../interfaces";

@Injectable()
export class MockUserService implements IUserService {
  private users: Map<string, User> = new Map();

  async findUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  // Helper methods for testing
  addMockUser(user: User): void {
    this.users.set(user.id, user);
  }

  clearMockData(): void {
    this.users.clear();
  }
}

import { Injectable } from "@nestjs/common";
import { IUserService, User } from "../interfaces";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PrismaUserService implements IUserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUser(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    return user;
  }
}

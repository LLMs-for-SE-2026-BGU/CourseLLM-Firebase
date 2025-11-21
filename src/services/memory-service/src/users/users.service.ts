import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import { RegisterUserDto } from "./dto/register-user.dto";
import { CustomLoggerService } from "../common/logger/logger.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext("UsersService");
  }

  async registerUser(dto: RegisterUserDto) {
    this.logger.info(
      `Attempting to register user ${dto.userID} with role ${dto.role}`,
    );

    try {
      // Check if user already exists (idempotent operation)
      this.logger.debug(`Checking if user ${dto.userID} already exists`);
      const existingUser = await this.prisma.user.findUnique({
        where: { id: dto.userID },
      });

      if (existingUser) {
        this.logger.info(
          `User ${dto.userID} already exists, returning idempotent success`,
        );
        return {
          success: true,
          message: "User already registered",
          userID: existingUser.id,
        };
      }

      // Create new user
      this.logger.debug(`Creating new user ${dto.userID} in database`);
      const user = await this.prisma.user.create({
        data: {
          id: dto.userID,
          name: dto.name,
          role: dto.role,
          userInfo: dto.userInfo || {},
        },
      });

      this.logger.info(
        `User ${user.id} (${user.name}) registered successfully with role ${user.role}`,
      );
      return {
        success: true,
        message: "User registered successfully",
        userID: user.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to register user ${dto.userID}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Failed to register user: ${error.message}`,
      };
    }
  }
}

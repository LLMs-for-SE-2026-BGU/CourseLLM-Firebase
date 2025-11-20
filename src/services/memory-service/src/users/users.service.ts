import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerUser(dto: RegisterUserDto) {
    try {
      // Check if user already exists (idempotent operation)
      const existingUser = await this.prisma.user.findUnique({
        where: { id: dto.userID },
      });

      if (existingUser) {
        this.logger.log(`User ${dto.userID} already exists, returning success`);
        return {
          success: true,
          message: 'User already registered',
          userID: existingUser.id,
        };
      }

      // Create new user
      const user = await this.prisma.user.create({
        data: {
          id: dto.userID,
          name: dto.name,
          role: dto.role,
          userInfo: dto.userInfo || {},
        },
      });

      this.logger.log(`User ${user.id} registered successfully`);
      return {
        success: true,
        message: 'User registered successfully',
        userID: user.id,
      };
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Failed to register user: ${error.message}`,
      };
    }
  }
}

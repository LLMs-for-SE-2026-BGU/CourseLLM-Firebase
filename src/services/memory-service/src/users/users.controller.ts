import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@ApiTags('users')
@Controller('api/v1/memory')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new user in the memory system' })
  @ApiResponse({
    status: 200,
    description: 'User registered successfully or already exists',
    schema: {
      example: {
        success: true,
        message: 'User registered successfully',
        userID: 'user_abc123xyz',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  async register(@Body() dto: RegisterUserDto) {
    return this.usersService.registerUser(dto);
  }
}

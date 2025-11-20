import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SaveMessageDto } from './dto/save-message.dto';

@ApiTags('messages')
@Controller('api/v1/memory')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save a message to a conversation' })
  @ApiResponse({
    status: 200,
    description: 'Message saved successfully',
    schema: {
      example: {
        success: true,
        chatID: 'chat_xyz789',
        messageID: 'msg_abc123',
        timestamp: '2025-11-20T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or missing required fields',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat or user not found',
  })
  async saveMessage(@Body() dto: SaveMessageDto) {
    return this.messagesService.saveMessage(dto);
  }
}

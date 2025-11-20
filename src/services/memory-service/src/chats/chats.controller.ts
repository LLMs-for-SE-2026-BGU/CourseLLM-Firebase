import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChatsService } from './chats.service';

@ApiTags('conversations')
@Controller('api/v1/memory')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('conversations/:chatID')
  @ApiOperation({ summary: 'Get paginated messages from a conversation' })
  @ApiParam({
    name: 'chatID',
    description: 'Conversation identifier',
    example: 'chat_xyz789',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1 = newest messages)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Messages per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    schema: {
      example: {
        messages: [
          {
            messageID: 'msg_abc123',
            content: 'Can you explain derivatives?',
            sender: 'user',
            timestamp: '2025-11-20T10:30:00.000Z',
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 3,
          totalMessages: 50,
          hasNext: true,
          hasPrevious: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chat not found',
  })
  async getConversation(
    @Param('chatID') chatID: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.chatsService.getConversation(chatID, page, pageSize);
  }

  @Get('users/:userID/conversations')
  @ApiOperation({ summary: 'Get all conversations for a user' })
  @ApiParam({
    name: 'userID',
    description: 'User identifier',
    example: 'user_abc123',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum conversations to return',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
    schema: {
      example: {
        conversations: [
          {
            chatID: 'chat_xyz789',
            title: 'Understanding Derivatives',
            createdAt: '2025-11-20T09:00:00.000Z',
            lastUpdatedAt: '2025-11-20T10:30:00.000Z',
            messageCount: 15,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserConversations(
    @Param('userID') userID: string,
    @Query('limit', new DefaultValuePipe(undefined), ParseIntPipe)
    limit?: number,
  ) {
    return this.chatsService.getUserConversations(userID, limit);
  }
}

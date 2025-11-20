import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateIf,
} from 'class-validator';

export enum MessageSender {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export class SaveMessageDto {
  @ApiPropertyOptional({
    description: 'Existing conversation ID (null creates new conversation)',
    example: 'chat_xyz789',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  chatID?: string | null;

  @ApiProperty({
    description: 'User ID (required if chatID is null for new conversations)',
    example: 'user_abc123',
  })
  @ValidateIf((o) => !o.chatID)
  @IsString()
  @IsNotEmpty()
  userID?: string;

  @ApiProperty({
    description: 'Message plain text content',
    example: 'Can you explain derivatives to me?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Message sender type',
    enum: MessageSender,
    example: MessageSender.USER,
  })
  @IsEnum(MessageSender)
  @IsNotEmpty()
  sender: MessageSender;

  @ApiPropertyOptional({
    description: 'Additional context metadata',
    example: { courseID: 'calculus_101', topicID: 'derivatives' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

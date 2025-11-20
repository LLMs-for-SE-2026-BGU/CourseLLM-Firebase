import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export class RegisterUserDto {
  @ApiProperty({
    description: 'Unique identifier from authentication service',
    example: 'user_abc123xyz',
  })
  @IsString()
  @IsNotEmpty()
  userID: string;

  @ApiProperty({
    description: "User's display name",
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.STUDENT,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Additional user metadata',
    example: { grade: '10', school: 'XYZ High School' },
  })
  @IsOptional()
  @IsObject()
  userInfo?: Record<string, any>;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SyncGoogleUserDto {
  @ApiProperty({ description: "User's email address", example: 'alex@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: "User's full name", example: 'Alex Smith', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: "User's profile avatar URL", required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'Unique Google OAuth provider account identifier (sub)',
    example: '10982374982374',
  })
  @IsString()
  @IsNotEmpty()
  providerAccountId!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty({ example: 'user-management' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Chính sách quản lý người dùng' })
  @IsString()
  description?: string;

  @ApiProperty({ example: ['read', 'write'] })
  @IsArray()
  permissions: string[];
}

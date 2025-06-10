import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase().trim()) // Chuyển thành chữ thường
  name: string;
  @ApiProperty({ example: 'unknown' })
  @IsString()
  description: string;
}

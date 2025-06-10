import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class CreateFileDto {
  @ApiProperty({ example: 'filename.txt' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '663f1c6b498728c0789cb962' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiProperty({ example: '/uploads/filename.txt' })
  @IsString()
  path: string;

  @ApiProperty({ example: 'text/plain' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 1024 })
  @IsNumber()
  size: number;
}

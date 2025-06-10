import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({ example: 'unknown' })
  @IsString()
  name: string = 'unknown';
  @ApiPropertyOptional({ example: '67ff1c6b498728c0789cb962' })
  @IsOptional()
  @IsMongoId()
  parentId?: string;
}

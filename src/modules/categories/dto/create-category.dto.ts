import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Điện tử' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: null, required: false })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiProperty({ example: 'dien-tu', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'Danh mục điện tử', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({ example: 'icon-electronics', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    example: ['parentId1', 'parentId2'],
    required: false,
    description: 'Dạng graph: mảng các id cha',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  parentIds?: string[];
}

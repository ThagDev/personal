import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
class CreateMenuChildDto {
  @ApiProperty({ example: 'Thực phẩm chức năng con' })
  @IsNotEmpty()
  @IsString()
  name: string = '';

  @IsString()
  slug: string = '';

  @ApiProperty({ example: 'describe' })
  @IsString()
  description: string = '';
}

export class CreateMenuTreeDto {
  @ApiProperty({ example: 'Thực phẩm chức năng' })
  @IsNotEmpty()
  @IsString()
  name: string = '';

  @IsString()
  slug: string = '';

  @ApiProperty({ example: 'describe' })
  @IsString()
  description: string = '';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMenuChildDto)
  menuChildrens: CreateMenuChildDto[] = [];
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Thực phẩm chức năng con' })
  @IsNotEmpty()
  @IsString()
  name: string = '';

  @IsString()
  slug: string = '';

  @ApiProperty({ example: 'describe' })
  @IsString()
  description: string = '';
}

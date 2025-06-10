import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'unknown@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string = 'unknown@gmail.com';
  @ApiProperty({ example: 'unknown' })
  @IsString()
  username: string = 'unknown';
  @ApiProperty({ example: 'unknown' })
  @IsString()
  password: string = 'unknown';
}

export class UpdateUserDto {
  @ApiProperty({ example: 'unknown@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string = 'unknown@gmail.com';
  @ApiProperty({ example: 'unknown' })
  @IsNotEmpty()
  @IsString()
  username: string = 'unknown';

  @ApiProperty({ example: 'unknown' })
  @IsNotEmpty()
  @IsString()
  avatar: string = 'unknown';

  @ApiProperty({ example: ['user'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[] = ['user'];

  @ApiProperty({
    example: '0123456789',
    description: 'Số điện thoại người dùng',
  })
  @IsString()
  @IsOptional()
  phonenumber?: string;

  @ApiProperty({
    example: '123 Đường ABC, Quận 1, TP.HCM',
    description: 'Địa chỉ người dùng',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'male', description: 'Giới tính: male/female/other' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Ngày sinh (ISO 8601: yyyy-mm-dd)',
  })
  @IsDateString()
  @IsOptional()
  birthday?: string;
}

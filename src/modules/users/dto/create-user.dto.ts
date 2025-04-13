import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ProfileUserDto {
  @ApiProperty({ example: 'unknown' })
  @IsString()
  username: string = 'unknown';
  @ApiProperty({ example: 'unknown' })
  @IsString()
  phonenumber: string = 'unknown';
  @ApiProperty({ example: 'unknown' })
  @IsString()
  address: string = 'unknown';
  @ApiProperty({ default: 'unknown' })
  @IsString()
  gender: string = 'unknown';
}

export class CreateUserDto {
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
}

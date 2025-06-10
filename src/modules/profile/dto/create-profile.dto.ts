import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsOptional()
  @IsString()
  phonenumber?: string;

  @ApiProperty({ example: '123 Main St', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: 'male',
    enum: ['male', 'female', 'other'],
    required: false,
  })
  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @ApiProperty({
    example: '1990-01-01',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsString()
  birthday?: string;
}

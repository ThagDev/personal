import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email dùng để xác thực',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã xác thực gửi về email',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateMutipleAuthDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email đăng ký tài khoản',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    minLength: 6,
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

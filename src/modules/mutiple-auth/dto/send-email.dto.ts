import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email nhận mã xác thực',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

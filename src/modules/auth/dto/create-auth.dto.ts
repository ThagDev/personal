import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendSmsOtp {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  verificationId: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  otpCode: string;
}
export class SendEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
export class VerifyCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class AccessTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  accesstoken: string;
}

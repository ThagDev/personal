import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ collection: 'auth' })
export class MutipleAuth extends Document {
  @ApiProperty({
    example: '665f1b2c8e4b2c001e7e1a2b',
    description: 'ID người dùng (MongoDB ObjectId)',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    example: '665f1b2c8e4b2c001e7e1a2b',
    description: 'ID người dùng (MongoDB ObjectId)',
  })
  @Prop()
  username: string;
  @ApiProperty({
    example: 'user@email.com',
    description: 'Email người dùng',
  })
  @Prop({ required: false })
  password?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL ảnh đại diện người dùng',
  })
  @Prop()
  avatar?: string;
  @ApiProperty({
    example: ['user', 'admin'],
    description: 'Danh sách vai trò của người dùng',
  })
  @Prop({ type: [String], default: ['user'] })
  roles?: string[];

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access Token JWT',
  })
  @Prop()
  accessToken?: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token JWT',
  })
  @Prop()
  refreshToken?: string;

  @ApiProperty({
    example: true,
    description: 'Trạng thái xác thực email',
  })
  @Prop({ default: false })
  verified?: boolean;

  @ApiProperty({
    example: '2025-05-21T10:00:00.000Z',
    description: 'Ngày tạo tài khoản',
  })
  @Prop({ default: Date.now })
  createdAt?: Date;

  @ApiProperty({
    example: '2025-05-21T10:00:00.000Z',
    description: 'Ngày cập nhật cuối cùng',
  })
  @Prop({ default: Date.now })
  updatedAt?: Date;

  @ApiProperty({
    example: '123456',
    description: 'Mã xác thực gửi về email',
  })
  @Prop()
  code?: string;

  @ApiProperty({
    example: '2025-05-21T10:05:00.000Z',
    description: 'Thời gian hết hạn mã xác thực',
  })
  @Prop()
  codeExpiresAt?: Date;

  @ApiProperty({
    example: '0123456789',
    description: 'Số điện thoại người dùng',
  })
  @Prop()
  phonenumber?: string;

  @ApiProperty({
    example: '123 Đường ABC, Quận 1, TP.HCM',
    description: 'Địa chỉ người dùng',
  })
  @Prop()
  address?: string;

  @ApiProperty({ example: 'male', description: 'Giới tính: male/female/other' })
  @Prop()
  gender?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Ngày sinh (ISO 8601: yyyy-mm-dd)',
  })
  @Prop()
  birthday?: string;
}

export const MutipleAuthSchema = SchemaFactory.createForClass(MutipleAuth);

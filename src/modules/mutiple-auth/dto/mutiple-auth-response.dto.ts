import { ApiProperty } from '@nestjs/swagger';

export class MutipleAuthResponseDto {
  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'https://example.com/avatar.png' })
  avatar: string;

  @ApiProperty({ example: ['user'] })
  roles: string[];

  @ApiProperty({ example: 'username' })
  username: string;

  @ApiProperty({ example: { $date: '2025-05-21T10:00:00.000Z' } })
  updatedAt: any;

  @ApiProperty({ example: false })
  verified: boolean;
}

export class MutipleAuthMessageDto {
  @ApiProperty({ example: 'Logout successful' })
  message: string;
}

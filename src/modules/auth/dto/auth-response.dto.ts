import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'user@email.com' })
  email: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'https://example.com/avatar.png', required: false })
  avatar?: string;

  @ApiProperty({ example: ['user'], required: false })
  roles?: string[];

  @ApiProperty({ example: 'username', required: false })
  username?: string;

  @ApiProperty({ example: true, required: false })
  verified?: boolean;

  @ApiProperty({ example: '2025-05-21T10:00:00.000Z', required: false })
  updatedAt?: string;
}

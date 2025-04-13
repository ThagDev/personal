// src/auth/token.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
  // Hàm sinh access token
  generateAccessToken(
    _id: string,
    email: string,
    username: string,
    avatar: string,
    roles: string[],
  ) {
    return jwt.sign(
      { _id, email, username, avatar, roles },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '30m', // Thời gian hết hạn là 15 phút
      },
    );
  }

  // Hàm sinh refresh token
  generateRefreshToken(_id: string, email: string) {
    return jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d', // Thời gian hết hạn là 7 ngày
    });
  }

  // Hàm xác thực access token
  async verifyAccessToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      return decoded;
    } catch (err) {
      console.log('halo');
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }

  // Hàm xác thực refresh token
  async verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new Error('Refresh token is invalid or expired');
    }
  }
}

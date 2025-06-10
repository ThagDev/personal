import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Db } from 'mongodb';
import { TokenService } from '../../modules/auth/token.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private reflector: Reflector,
    @Inject('MONGO_DB_CONNECTION') private db: Db,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException({ message: 'UnAuthorization' });
    }
    // Sử dụng verifyAccessToken để xác thực token và lấy thông tin user
    try {
      const decoded = await this.tokenService.verifyAccessToken(token);
      request.user = decoded; // Lưu thông tin user vào request để các middleware/controller sau dùng
      request.accessToken = token;
      return true; // Token hợp lệ, cho phép truy cập
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid or expired token',
      });
    }
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { TokenService } from '../../modules/auth/token.service';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'jsonwebtoken';
import { Db } from 'mongodb';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private reflector: Reflector,
    @Inject('MONGO_DB_CONNECTION') private db: Db,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Nếu không có vai trò nào yêu cầu, cho phép truy cập
    }

    //
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException({ message: 'UnAuthorization' });
    }

    // Giải mã access token để lấy thông tin người dùng (bao gồm _id)
    const decoded = await this.tokenService.verifyAccessToken(token);
    const getUser = await this.db.collection('auth').findOne({
      email: (decoded as JwtPayload).email,
    });
    const userRoles = getUser.roles;

    // Lưu thông tin người dùng vào request (có thể là _id, email, roles, v.v.)
    // Kiểm tra xem người dùng có vai trò phù hợp không
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }
    request.user = decoded;
    return true; // Token hợp lệ, cho phép truy cập
  }
}

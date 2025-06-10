import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class Oauth2Guard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException({ message: 'UnAuthorization' });
    }
    // Đã loại bỏ log token và headers để tránh lộ thông tin nhạy cảm
    try {
      // Nếu muốn xác thực token, inject TokenService và sử dụng verifyAccessToken như AuthorizationGuard
      // Ví dụ:
      // const decoded = await this.tokenService.verifyAccessToken(token);
      // request.user = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid or expired token',
      });
    }
  }
}

/*
Chú thích:
- Đã loại bỏ console.log để tránh lộ thông tin nhạy cảm.
- Nếu muốn xác thực token, nên inject TokenService và xác thực như AuthorizationGuard.
*/

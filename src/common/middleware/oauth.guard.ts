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
    console.log(request.headers);
    const token = request.headers.authorization?.split(' ')[1];
    console.log(token);
    if (!token) {
      throw new UnauthorizedException({ message: 'UnAuthorization' });
    }
    try {
      // Giải mã access token để lấy thông tin người dùng (bao gồm _id)
      // const decoded = await this.tokenService.verifyAccessToken(token);

      // Lưu thông tin người dùng vào request (có thể là _id, email, roles, v.v.)
      // request.user = decoded;
      console.log(token);
      return true;
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid or expired token',
      });
    }
  }
}

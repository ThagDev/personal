import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Lấy userId từ JWT payload (ưu tiên _id, fallback sub)
 * Sử dụng: @CurrentUserId() userId: string
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?._id || request.user?.sub;
  },
);

/**
 * Lấy email từ JWT payload
 * Sử dụng: @CurrentUserEmail() email: string
 */
export const CurrentUserEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.email;
  },
);

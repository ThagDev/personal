import { HttpStatus } from '@nestjs/common';
import { success } from './base-response';

/**
 * Base Controller - Cung cấp các method chung cho tất cả controllers
 */
export abstract class BaseController {
  /**
   * Trả về response thành công với data
   */
  protected successResponse(data: any, message?: string) {
    return success(data, message);
  }

  /**
   * Trả về response thành công không có data
   */
  protected successNoData(message: string = 'Success') {
    return success(null, message);
  }

  /**
   * Parse query parameters để chuẩn hóa
   */
  protected parseQuery(query: any) {
    return {
      ...query,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };
  }
}

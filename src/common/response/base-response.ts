export class BaseResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
  constructor(options: {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
  }) {
    this.success = options.success;
    this.data = options.data;
    this.message = options.message;
    this.error = options.error;
  }
}

export function success<T>(data: T, message?: string): BaseResponse<T> {
  return new BaseResponse({ success: true, data, message });
}

export function fail(message: string, error?: any): BaseResponse<null> {
  return new BaseResponse({ success: false, message, error });
}

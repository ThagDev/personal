import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = 500;
    let message: any = 'Internal server error';

    // Custom: handle invalid JSON body error
    if (
      exception instanceof SyntaxError &&
      'message' in exception &&
      (exception as SyntaxError).message.includes('JSON')
    ) {
      status = 400;
      message = {
        message:
          'Request body không phải là JSON hợp lệ. Vui lòng kiểm tra lại cú pháp!',
        error: 'Bad Request',
        statusCode: 400,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    }

    // Log toàn bộ exception để debug
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('AllExceptionsFilter caught exception:', exception);
    }

    const errorResponse: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.path = request.url;
    }
    response.status(status).json(errorResponse);
  }
}

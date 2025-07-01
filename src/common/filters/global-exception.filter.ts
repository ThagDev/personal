import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

/**
 * Global Exception Filter với advanced error handling
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, code } = this.getErrorInfo(exception);

    // Log error with context
    this.logError(exception, request, status);

    // Enhanced error response
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(code && { code }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
        details: this.getErrorDetails(exception),
      }),
      // Request info for debugging
      requestId: this.generateRequestId(),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorInfo(exception: unknown): {
    status: number;
    message: string;
    code?: string;
  } {
    // NestJS HTTP Exception
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: exception.message,
      };
    }

    // MongoDB Errors
    if (this.isMongoError(exception)) {
      return this.handleMongoError(exception);
    }

    // JWT Errors
    if (exception instanceof Error && exception.name.includes('JsonWebToken')) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid or expired token',
        code: 'TOKEN_ERROR',
      };
    }

    // Validation Errors
    if (
      exception instanceof Error &&
      exception.message.includes('validation')
    ) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    // Default error
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }

  private isMongoError(exception: unknown): exception is MongoError {
    return exception instanceof Error && 'code' in exception;
  }

  private handleMongoError(error: MongoError): {
    status: number;
    message: string;
    code: string;
  } {
    switch (error.code) {
      case 11000: // Duplicate key
        return {
          status: HttpStatus.CONFLICT,
          message: 'Duplicate entry - resource already exists',
          code: 'DUPLICATE_KEY',
        };
      case 121: // Document validation failed
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Document validation failed',
          code: 'VALIDATION_FAILED',
        };
      case 50: // Exceeded time limit
        return {
          status: HttpStatus.REQUEST_TIMEOUT,
          message: 'Database query timeout',
          code: 'QUERY_TIMEOUT',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
          code: 'DATABASE_ERROR',
        };
    }
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    const logContext = {
      url: request.url,
      method: request.method,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      body: this.sanitizeRequestBody(request.body),
      query: request.query,
      params: request.params,
    };

    if (status >= 500) {
      this.logger.error(`${message}`, stack, JSON.stringify(logContext));
    } else if (status >= 400) {
      this.logger.warn(`${message}`, JSON.stringify(logContext));
    }
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = [
      'password',
      'token',
      'refreshToken',
      'accessToken',
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private getErrorDetails(exception: unknown): any {
    if (exception instanceof HttpException) {
      return exception.getResponse();
    }

    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
      };
    }

    return exception;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

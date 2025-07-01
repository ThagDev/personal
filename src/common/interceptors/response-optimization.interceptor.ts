import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Response Optimization Interceptor
 * - Removes sensitive fields
 * - Optimizes response size
 * - Adds performance metrics
 */
@Injectable()
export class ResponseOptimizationInterceptor implements NestInterceptor {
  private readonly sensitiveFields = ['password', 'refreshToken', 'accessToken', 'code'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        const responseTime = Date.now() - start;
        
        // Remove sensitive fields
        const cleanData = this.removeSensitiveFields(data);
        
        // Add performance metadata
        const optimizedResponse = {
          ...cleanData,
          _meta: {
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            ...(process.env.NODE_ENV === 'development' && {
              memory: process.memoryUsage(),
            }),
          },
        };

        return optimizedResponse;
      }),
    );
  }

  private removeSensitiveFields(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeSensitiveFields(item));
    }

    const cleaned = { ...obj };
    
    for (const field of this.sensitiveFields) {
      if (field in cleaned) {
        delete cleaned[field];
      }
    }

    // Recursively clean nested objects
    for (const key in cleaned) {
      if (cleaned[key] && typeof cleaned[key] === 'object') {
        cleaned[key] = this.removeSensitiveFields(cleaned[key]);
      }
    }

    return cleaned;
  }
}

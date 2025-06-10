import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);
  use(req: any, res: any, next: () => void) {
    const { method, originalUrl, body, query } = req;
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      this.logger.log(`${method} ${originalUrl} ${res.statusCode} - ${ms}ms | query: ${JSON.stringify(query)} | body: ${JSON.stringify(body)} | user: ${JSON.stringify(req.user || null)}`);
    });
    next();
  }
}

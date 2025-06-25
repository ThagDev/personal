import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './configs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { connect } from '@ngrok/ngrok';
// import * as cookieParser from 'cookie-parser';
import cookieParser = require('cookie-parser');
import * as dotenv from 'dotenv';
// import * as path from 'path';
// import * as express from 'express';
dotenv.config(); // Load environment variables from .env file
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // CORS configuration for ngrok
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      /^https:\/\/.*\.ngrok\.io$/, // Allow all ngrok subdomains
      /^https:\/\/.*\.ngrok-free\.app$/, // Allow new ngrok domains
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Trust proxy for ngrok
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // Log the environment
  const environment = process.env.NODE_ENV || 'development';
  Logger.log(`-------------------${environment}-----------------------`);
  // swagger start
  setupSwagger(app);
  // swagger end

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(8888);
  Logger.log(`Application is running on: http://localhost:8888`);

  // Start ngrok tunnel for remote testing (only in development)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const listener = await connect({
        addr: 8888,
        domain: 'cat-arriving-martin.ngrok-free.app',
        authtoken: '2xWDn98hTl7hIS5FxNnm64kLeRY_4fLe3jn7Xe7eXnBtuzW6j',
      });

      const ngrokUrl = listener.url();
      Logger.log(`🌍 Ngrok tunnel established at: ${ngrokUrl}`);
      Logger.log(`🚀 Public API URL: ${ngrokUrl}`);
    } catch (err) {
      Logger.error(`❌ Failed to establish ngrok tunnel: ${err.message}`);
      Logger.log(
        `💡 Server is still running locally at: http://localhost:8888`,
      );
    }
  } else {
    Logger.log(
      `🚀 Production server running at: ${process.env.PRODUCTION_URL || 'https://your-domain.com'}`,
    );
    Logger.log(
      `📖 Production Swagger docs: ${process.env.PRODUCTION_URL || 'https://your-domain.com'}/api`,
    );
  }
}
bootstrap();

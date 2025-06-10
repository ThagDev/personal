import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './configs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
// import * as cookieParser from 'cookie-parser';
import cookieParser = require('cookie-parser');
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as express from 'express';
dotenv.config(); // Load environment variables from .env file
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // Serve favicon.ico nếu có file favicon trong public/
  app.use(
    '/favicon.ico',
    express.static(path.join(__dirname, '..', 'public', 'favicon-32x32.png')),
  );

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
  Logger.log(`Application is running on: ${process.env.HOST}`);
}
bootstrap();

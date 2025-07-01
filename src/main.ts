import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './configs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import cookieParser = require('cookie-parser');
import * as dotenv from 'dotenv';

dotenv.config();

// Global type declaration for Vercel serverless
declare global {
  // eslint-disable-next-line no-var
  var app: any;
}

// Vercel serverless handler
export default async function handler(req: any, res: any) {
  if (!global.app) {
    const app = await NestFactory.create(AppModule);

    // Configure CORS for production
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://localhost:3000',
        /^https:\/\/.*\.vercel\.app$/,
        /^https:\/\/.*\.ngrok\.io$/,
        /^https:\/\/.*\.ngrok-free\.app$/,
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });

    app.use(cookieParser());

    // Setup Swagger for production
    setupSwagger(app);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
    global.app = app.getHttpAdapter().getInstance();
  }

  return global.app(req, res);
}

// Development bootstrap function
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // CORS configuration for development
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      /^https:\/\/.*\.ngrok\.io$/,
      /^https:\/\/.*\.ngrok-free\.app$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Trust proxy for ngrok
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const environment = process.env.NODE_ENV || 'development';
  Logger.log(`-------------------${environment}-----------------------`);

  setupSwagger(app);

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
  if (process.env.NODE_ENV === 'development') {
    try {
      // Dynamic import for ngrok to avoid bundling in production
      const { connect } = await import('@ngrok/ngrok');

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
    Logger.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  }
}

// Only run bootstrap in development/local environment
// Vercel sẽ sử dụng handler function, không chạy bootstrap
if (process.env.VERCEL !== '1' && require.main === module) {
  bootstrap().catch((error) => {
    Logger.error('Failed to start application:', error);
    process.exit(1);
  });
}

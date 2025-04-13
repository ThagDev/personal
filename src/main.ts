import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Log the environment
  const environment = process.env.NODE_ENV || 'development';
  Logger.log(`-------------------${environment}-----------------------`);
  // swagger start
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: ['OPTIONS', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('API Documentation Pharmacy')
    .setDescription('API description')
    .setVersion('v1')
    .addSecurityRequirements('bearer')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document, {
    jsonDocumentUrl: 'https://api-pharmacy.vercel.app/swagger/v1/swagger.json',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.8/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.8/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.8/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.20.8/swagger-ui.css',
    ],
    swaggerOptions: {
      oauth2RedirectUrl: process.env.GOOGLE_REDIRECT_URI,
      oauth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        scopes: ['email', 'profile'], // Các scopes mà bạn đã xác định
      },
    },
  });
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
}
bootstrap();

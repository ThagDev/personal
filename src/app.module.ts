import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';
import { MongoDBModule } from './databases/mongodb.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { UploadModule } from './modules/uploads/upload.module';
import { UsersModule } from './modules/manageusers/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { FileModule } from './modules/drive/file/file.module';
import { FolderModule } from './modules/drive/folder/folder.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { MutipleAuthModule } from './modules/mutiple-auth/mutiple-auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { DriveModule } from './modules/drive/drive.module';
import { PerformanceModule } from './modules/performance/performance.module';

// Performance & Optimization Services
import { DatabaseIndexService } from './common/services/database-index.service';
import { PerformanceMonitoringService } from './common/services/performance-monitoring.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseOptimizationInterceptor } from './common/interceptors/response-optimization.interceptor';
import { PaginationService } from './common/pagination/pagination.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.production'],
      isGlobal: true,
    }),
    MutipleAuthModule,
    AuthModule,
    ProfileModule,
    MailModule,
    UploadModule,
    UsersModule,
    MongoDBModule.forRoot(
      process.env.MONGO_URI,
      'personal',
      'MONGO_DB_CONNECTION',
    ),
    MongooseModule.forRoot(process.env.MONGO_URI, { dbName: 'personal' }),
    RolesModule,
    PermissionsModule,
    PoliciesModule,
    FileModule,
    FolderModule,
    DriveModule,
    CategoriesModule,
    PerformanceModule,
  ],
  providers: [
    // Global services
    PaginationService,
    DatabaseIndexService,
    PerformanceMonitoringService,
    
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    
    // Global response optimization interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseOptimizationInterceptor,
    },
  ],
  exports: [PaginationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes();
  }
}

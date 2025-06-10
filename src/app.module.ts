import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.production'],
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
  ],
  // Không export PaginationService vì không nằm trong providers của AppModule
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes();
  }
}

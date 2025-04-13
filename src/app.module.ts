import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger/logger.middleware';

import { MongoDBModule } from './databases/mongodb.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { TokenService } from './modules/auth/token.service';
import { MailService } from './modules/mail/mail.service';
import { MailModule } from './modules/mail/mail.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { UsersService } from './modules/users/users.service';
import { UsersController } from './modules/users/users.controller';
import { PaginationService } from './common/pagination/pagination.service';
import { RolesModule } from './modules/roles/roles.module';
import { MenuTreesModule } from './modules/menu-trees/menu-trees.module';
import { RolesGuard } from './common/middleware/roles.guard';
import { Oauth2Guard } from './common/middleware/oauth.guard';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.development', '.env.production'],
    }),
    AuthModule,
    MailModule,
    UploadModule,
    UsersModule,
    MongoDBModule.forRoot(
      process.env.MONGO_URI,
      'pharmacy',
      'MONGO_DB_CONNECTION',
    ),
    RolesModule,
    MenuTreesModule,
  ],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    TokenService,
    MailService,
    UsersService,
    PaginationService,
    RolesGuard,
    Oauth2Guard,
  ],
  exports: [PaginationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes('songs'); // option 1
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: 'songs', method: RequestMethod.POST }); // option 2
    consumer.apply(LoggerMiddleware).forRoutes(); // option 3
  }
}

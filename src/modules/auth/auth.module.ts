import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { TokenService } from './token.service';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { Oauth2Guard } from '../../common/middleware/oauth.guard';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, MailService, Oauth2Guard],
  exports: [TokenService],
})
export class AuthModule {}

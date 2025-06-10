import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MutipleAuthService } from './mutiple-auth.service';
import { MutipleAuthController } from './mutiple-auth.controller';
import { MutipleAuth, MutipleAuthSchema } from './entities/mutiple-auth.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MutipleAuth.name, schema: MutipleAuthSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.ACCESS_TOKEN_SECRET,
        signOptions: { expiresIn: '30m' },
      }),
    }),
    MailModule,
  ],
  controllers: [MutipleAuthController],
  providers: [MutipleAuthService, LocalStrategy, JwtStrategy],
})
export class MutipleAuthModule {}

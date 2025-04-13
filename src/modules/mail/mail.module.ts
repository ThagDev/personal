import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailController } from './mail.controller';
import getMailConfig from './mail.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => await getMailConfig(), // Sử dụng hàm bất đồng bộ để lấy cấu hình
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

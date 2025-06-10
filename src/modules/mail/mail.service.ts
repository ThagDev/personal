import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async SendEmailNodemailer(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      from: 'pharmacy@gmail.com',
      to: email,
      subject: 'Verify code',
      text: 'Hello, this is an Pharmacy@email.com',
      template: 'welcome',
      context: {
        email: email,
        code: code,
      },
    });
  }

  async sendCreateUserInfo({
    fullName,
    email,
    password,
    loginUrl,
  }: {
    fullName: string;
    email: string;
    password: string;
    loginUrl: string;
  }) {
    try {
      await this.mailerService.sendMail({
        from: 'pharmacy@gmail.com',
        to: email,
        subject: 'Thông tin tài khoản mới',
        template: 'CreateUserSendEmail',
        context: {
          fullName,
          email,
          password,
          loginUrl,
        },
      });
      // console.log('[MailService] Email sent to', email);
    } catch (error) {
      console.error('[MailService] Error sending email:', error);
      throw error;
    }
  }
}

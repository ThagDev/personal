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
}

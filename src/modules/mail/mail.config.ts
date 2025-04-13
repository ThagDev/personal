import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { google } from 'googleapis';
import { MailerOptions } from '@nestjs-modules/mailer';
import { join } from 'path';

async function getMailConfig(): Promise<MailerOptions> {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URL,
  );
  oAuth2Client.setCredentials({
    access_token: process.env.OAUTH2CLIENT,
  });
  // Lấy access token
  const accessToken = await oAuth2Client.getAccessToken();

  return {
    transport: {
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USERNAME, // Email người gửi
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN_OAUTH2,
        accessToken: accessToken.token,
      },
    },
    defaults: {
      from: 'pharmacy@gmail.com',
    },
    template: {
      dir: join(process.cwd(), 'src/modules/mail/templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
}

export default getMailConfig; // Xuất hàm này để sử dụng trong MailModule

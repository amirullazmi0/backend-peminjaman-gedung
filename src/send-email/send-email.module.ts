import { Module } from '@nestjs/common';
import { SendEmailService } from './send-email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { SendEmailController } from './send-email.controller';

const SMTP_EMAIL = process.env.SMTP_EMAIL
const SMTP_PASS = process.env.SMTP_PASSWORD

@Module({
  providers: [SendEmailService],
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: SMTP_EMAIL,
          pass: SMTP_PASS, // Gunakan App Password
        },
      },
      defaults: {
        from: `noreply_${SMTP_EMAIL}`,
      },
    }),
  ],
  controllers: [SendEmailController]
})
export class SendEmailModule { }

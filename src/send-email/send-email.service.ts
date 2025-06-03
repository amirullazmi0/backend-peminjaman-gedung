import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { sendEmailRequest } from './sendEmailDto';

@Injectable()
export class SendEmailService {
  constructor(private readonly mailerService: MailerService) { }

  async sendEmail(
    req: sendEmailRequest
  ): Promise<boolean> {
    try {
      const templatePath = join(process.cwd(), 'src', 'send-email', 'templates', `${req.type}.ejs`);
      const templateString = readFileSync(templatePath, 'utf-8');

      const html = await ejs.render(templateString, req.context);

      const sendMail = await this.mailerService.sendMail({
        to: req.to,
        subject: req.subject,
        html,
      });

      console.log('');
      console.log(`\x1b[32mSend email success:\x1b[0m
        Type     : ${req.type}
        To       : ${req.to}
        Subject  : ${req.subject}
        Accepted : ${sendMail.accepted.join(', ') || 'none'}
        Rejected : ${sendMail.rejected.join(', ') || 'none'}
        MessageId: ${sendMail.messageId}
      `);
      console.log('');

      return true;
    } catch (error) {
      console.error('Send email error:', error);
      return false;
    }
  }

}

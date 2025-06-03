import { Controller, Get, Query } from '@nestjs/common';
import { SendEmailService } from './send-email.service';

@Controller('send-email')
export class SendEmailController {
  constructor(
    private sendEmailService: SendEmailService
  ) { }
  @Get('test')
  async testEmail() {
    return await this.sendEmailService.sendEmail({
      context: {
        name: 'Amirull Azmi',
        resetLink: "google.com"
      },
      subject: 'forget password',
      to: 'amirullazmi0@gmail.com',
      type: 'forget-password'
    });
  }
}

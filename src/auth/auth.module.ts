import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SendEmailService } from 'src/send-email/send-email.service';

@Module({
  providers: [AuthService, PrismaService, SendEmailService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }

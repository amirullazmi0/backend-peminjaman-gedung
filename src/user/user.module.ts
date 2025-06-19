import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttachmentService } from 'src/attachment/attachment.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, AttachmentService]
})
export class UserModule { }

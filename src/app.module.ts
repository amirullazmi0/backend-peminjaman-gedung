import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { BuildingModule } from './building/building.module';
import { UserModule } from './user/user.module';
import { RentBuildingModule } from './rent-building/rent-building.module';
import { CommonModule } from './common/common.module';
import { SendEmailService } from './send-email/send-email.service';
import { SendEmailModule } from './send-email/send-email.module';
import { AttachmentModule } from './attachment/attachment.module';

@Module({
  imports: [
    AuthModule,
    BuildingModule,
    UserModule,
    RentBuildingModule,
    CommonModule,
    SendEmailModule,
    AttachmentModule
  ],
  controllers: [],
  providers: [SendEmailService],
})
export class AppModule { }

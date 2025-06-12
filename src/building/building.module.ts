import { Module } from '@nestjs/common';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AttachmentService } from 'src/attachment/attachment.service';

@Module({
  controllers: [BuildingController],
  providers: [BuildingService, PrismaService, AttachmentService]
})
export class BuildingModule { }

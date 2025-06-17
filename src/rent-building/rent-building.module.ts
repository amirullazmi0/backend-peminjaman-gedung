import { Module } from '@nestjs/common';
import { RentBuildingController } from './rent-building.controller';
import { RentBuildingService } from './rent-building.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvoiceService } from 'src/invoice/invoice.service';
import { AttachmentService } from 'src/attachment/attachment.service';

@Module({
  controllers: [RentBuildingController],
  providers: [RentBuildingService, PrismaService, InvoiceService, AttachmentService]
})
export class RentBuildingModule { }

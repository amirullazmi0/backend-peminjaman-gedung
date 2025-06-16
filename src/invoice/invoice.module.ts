import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [InvoiceService, PrismaService]
})
export class InvoiceModule { }

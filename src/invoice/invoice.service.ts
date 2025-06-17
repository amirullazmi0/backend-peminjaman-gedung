import { Injectable } from '@nestjs/common';
import { Invoice } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInvoiceDto } from './invoice.dto';
import { WebResponse } from 'src/DTO/globalsResponse';
import { AttachmentService } from 'src/attachment/attachment.service';
import { generateInvoicePdf } from './invoice.generator';
import * as streamifier from 'streamifier';

@Injectable()
export class InvoiceService {
  constructor(
    private prismaService: PrismaService,
    private attachmentService: AttachmentService
  ) { }

  async getLatestInvoice(): Promise<Invoice> {
    const invoice = await this.prismaService.invoice.findFirst({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!invoice) {
      return null
    }

    return invoice
  }
  async generateInvoice(req: CreateInvoiceDto): Promise<WebResponse<{
    customId: string,
    invoiceUrl: string,
  }>> {
    const latestInvoice = await this.getLatestInvoice()

    // Generate custom ID
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const latestNumber = latestInvoice?.customId?.split('-')[2] ?? '0000';
    const nextNumber = String(parseInt(latestNumber) + 1).padStart(4, '0');
    const customId = `INV-${dateStr}-${nextNumber}`;

    // Generate PDF
    const pdfBuffer = await generateInvoicePdf(req, customId);

    // Convert Buffer to fake Express.Multer.File for ImageKit
    const file: Express.Multer.File = {
      buffer: pdfBuffer,
      fieldname: 'file',
      originalname: `${customId}.pdf`,
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: pdfBuffer.length,
      stream: streamifier.createReadStream(pdfBuffer),
      destination: '',
      filename: '',
      path: '',
    };

    // Upload to ImageKit
    const uploaded = await this.attachmentService.saveDocumentImageKit({
      file,
      folder: `/invoice`,
    });

    return {
      success: true,
      message: 'create invoice success',
      data: {
        customId: customId,
        invoiceUrl: uploaded.path
      }
    }
  }

}

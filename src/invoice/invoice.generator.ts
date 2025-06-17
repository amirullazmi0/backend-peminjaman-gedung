import { join } from 'path';
import * as ejs from 'ejs';
import * as puppeteer from 'puppeteer';
import dayjs from 'dayjs';
import { CreateInvoiceDto } from './invoice.dto';

export async function generateInvoicePdf(invoice: CreateInvoiceDto, customId: string): Promise<Buffer> {
  const templatePath = join(process.cwd(), 'src', 'invoice', 'templates', 'invoice.ejs');

  // Format tanggal ke 'DD MMM YYYY'
  const formattedInvoice = {
    ...invoice,
    startDate: dayjs(invoice.startDate).format('DD MMM YYYY'),
    endDate: dayjs(invoice.endDate).format('DD MMM YYYY'),
  };

  const html = await ejs.renderFile(templatePath, {
    invoice: formattedInvoice,
    customId,
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return Buffer.from(pdf);
}

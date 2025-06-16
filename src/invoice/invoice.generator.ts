import * as path from 'path';
import * as ejs from 'ejs';
import * as puppeteer from 'puppeteer';
import { CreateInvoiceDto } from './invoice.dto';

export async function generateInvoicePdf(invoice: CreateInvoiceDto): Promise<Buffer> {
  const templatePath = path.join(__dirname, 'templates', 'invoice.ejs');
  const html = await ejs.renderFile(templatePath, { invoice });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return Buffer.from(pdf); // ✅ Fix: konversi ke Buffer
}


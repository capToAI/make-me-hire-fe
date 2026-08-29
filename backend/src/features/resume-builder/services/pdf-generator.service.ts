import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

/**
 * Service that manages a headless Chromium browser via Puppeteer
 * to render HTML templates into text-selectable, ATS-friendly vector PDFs.
 */
@Injectable()
export class PdfGeneratorService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private browser: Browser | null = null;

  /**
   * Retrieves or launches the shared headless Chromium instance.
   * Auto-recovers if the previous browser instance disconnected or crashed.
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser || !this.browser.connected) {
      this.logger.log('Launching headless Chromium browser instance...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--font-render-hinting=medium',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });
      this.logger.log('Headless Chromium browser launched successfully.');
    }
    return this.browser;
  }

  /**
   * Generates a vector PDF with real selectable text from HTML.
   *
   * @param {string} html - Self-contained HTML string with inline or embedded CSS.
   * @param {'letter' | 'a4'} format - Target paper format ('letter' or 'a4').
   * @returns {Promise<Buffer>} Binary PDF buffer.
   */
  async generatePdf(
    html: string,
    format: 'letter' | 'a4' = 'letter',
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport matching standard target paper dimensions (96 DPI)
      const isLetter = format === 'letter';
      await page.setViewport({
        width: isLetter ? 816 : 794,
        height: isLetter ? 1056 : 1123,
        deviceScaleFactor: 1,
      });

      // Load HTML content and wait for DOM and font loads to settle
      await page.setContent(html, {
        waitUntil: ['load', 'domcontentloaded'],
        timeout: 30000,
      });

      // Force evaluate any pending font loads to guarantee clean vector glyphs
      await page.evaluateHandle('document.fonts.ready');

      const pdfUint8Array = await page.pdf({
        format: isLetter ? 'Letter' : 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
      });

      return Buffer.from(pdfUint8Array);
    } catch (error) {
      this.logger.error('Failed to generate vector PDF from HTML:', error);
      throw error;
    } finally {
      await page.close().catch((err) => {
        this.logger.warn('Error closing page tab:', err);
      });
    }
  }

  /**
   * Clean up browser process when the NestJS application shuts down.
   */
  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      this.logger.log('Closing headless Chromium browser...');
      await this.browser.close().catch((err) => {
        this.logger.warn('Error while closing browser:', err);
      });
      this.browser = null;
    }
  }
}

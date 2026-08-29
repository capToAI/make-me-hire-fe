import { BadRequestException, Injectable } from '@nestjs/common';
import * as pdfParse from 'pdf-parse';

interface PdfTextItem {
  str: string;
  transform: number[]; // [scaleX, skewY, skewX, scaleY, transX, transY]
  width?: number;
  height?: number;
}

interface PdfPageData {
  getTextContent: (options?: { normalizeWhitespace?: boolean }) => Promise<{
    items: PdfTextItem[];
  }>;
}

/**
 * Custom PDF page renderer that sorts text items spatially (top-to-bottom, left-to-right).
 * This reconstructs the true visual reading order for multi-column and layered resume layouts.
 */
function renderPageWithSpatialLayout(pageData: PdfPageData): Promise<string> {
  return pageData.getTextContent({ normalizeWhitespace: true }).then((textContent) => {
    const items = (textContent.items || []).map((item) => ({
      str: item.str,
      x: item.transform ? item.transform[4] : 0,
      y: item.transform ? item.transform[5] : 0,
    }));

    // In PDF coordinate space, Y=0 is bottom of page.
    // Higher Y is closer to the top of the page.
    // Sort descending by Y (top to bottom). If items are on approximately the same line (<= 4pt diff), sort left to right (ascending X).
    items.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > 4) {
        return yDiff;
      }
      return a.x - b.x;
    });

    let lastY: number | null = null;
    let text = '';

    for (const item of items) {
      if (!item.str || item.str.trim() === '') continue;

      if (lastY === null) {
        text += item.str;
        lastY = item.y;
      } else if (Math.abs(lastY - item.y) <= 4) {
        // Same line
        text += (text.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
      } else {
        // New line
        text += '\n' + item.str;
        lastY = item.y;
      }
    }

    return text;
  });
}

/**
 * Service responsible for extracting text content from PDF buffers.
 */
@Injectable()
export class PdfExtractorService {
  /**
   * Extracts raw text from an uploaded PDF file buffer in visual reading order.
   *
   * @param {Buffer} pdfBuffer - Buffer of the uploaded PDF file.
   * @returns {Promise<string>} Extracted and trimmed text content.
   * @throws {BadRequestException} When PDF is unreadable or contains no extractable text.
   */
  async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new BadRequestException('Uploaded PDF buffer is empty or missing.');
    }

    try {
      const data = await pdfParse(pdfBuffer, {
        pagerender: renderPageWithSpatialLayout,
      });
      const text = data.text ? data.text.trim() : '';

      if (!text || text.length === 0) {
        throw new BadRequestException(
          'PDF contains no extractable text content. Scanned images or password-protected documents are not supported.',
        );
      }

      return text;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to parse PDF file: ${error instanceof Error ? error.message : 'Unknown parsing error'}`,
      );
    }
  }
}


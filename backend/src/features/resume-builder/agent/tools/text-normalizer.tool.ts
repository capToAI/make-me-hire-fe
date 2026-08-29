import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

const textNormalizerSchema = z.object({
  text: z.string().describe('The raw text or bullet point to normalize'),
});

/**
 * Tool for cleaning and normalizing bullet points, dates, and whitespace.
 */
export const textNormalizerTool: DynamicStructuredTool<any, any, any, any> =
  new DynamicStructuredTool({
  name: 'normalize_resume_text',
  description:
    'Cleans up raw text, removes unwanted line breaks, bullet artifacts, and normalizes date ranges.',
  schema: textNormalizerSchema,
  func: async ({ text }: { text: string }): Promise<string> => {
    if (!text) return '';

    // Remove leading bullet symbols (•, -, *, ⁃) and clean whitespace
    const cleaned = text
      .replace(/^[\s•\-\*⁃–—\d\.\)]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned;
  },
});


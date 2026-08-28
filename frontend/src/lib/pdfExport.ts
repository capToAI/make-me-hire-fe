import { generatePdfFromServer } from "./api";

/**
 * Collects all active CSS rules from document stylesheets to ensure
 * Tailwind classes and typography are fully preserved in server-rendered HTML.
 */
function collectDocumentStyles(): string {
  const styles: string[] = [];

  // Gather rules from all loaded stylesheets
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (let j = 0; j < rules.length; j++) {
        styles.push(rules[j].cssText);
      }
    } catch {
      // Ignore security errors for cross-origin sheets (if any)
    }
  }

  // Fallback / addition: inline <style> tags
  document.querySelectorAll("style").forEach((styleEl) => {
    if (styleEl.textContent && !styles.includes(styleEl.textContent)) {
      styles.push(styleEl.textContent);
    }
  });

  return styles.join("\n");
}

/**
 * Builds a clean, self-contained HTML document containing the resume pages
 * and print-specific layout rules.
 */
function buildResumeHtml(
  pages: HTMLElement[],
  pageFormat: "letter" | "a4",
  fileName: string
): string {
  const collectedStyles = collectDocumentStyles();

  // Clone each page element and remove on-screen-only elements (.no-print)
  const pagesHtml = pages
    .map((pageEl) => {
      const clone = pageEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".no-print").forEach((el) => el.remove());
      return clone.outerHTML;
    })
    .join("\n");

  const isLetter = pageFormat === "letter";
  const pageWidth = isLetter ? "8.5in" : "210mm";
  const pageHeight = isLetter ? "11in" : "297mm";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fileName}</title>
  <style>
    ${collectedStyles}

    @page {
      size: ${pageWidth} ${pageHeight};
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .no-print {
      display: none !important;
    }

    .resume-page {
      width: ${pageWidth} !important;
      height: ${pageHeight} !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0.65in !important;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
      box-shadow: none !important;
      border: none !important;
      background-color: #ffffff !important;
      overflow: hidden !important;
      position: relative;
    }

    .resume-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

/**
 * Triggers a client-side file download given a Blob and suggested file name.
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const safeFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = safeFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Exports the currently displayed resume to a 100% text-selectable, ATS-friendly vector PDF
 * using server-side Puppeteer (Chromium).
 *
 * If the backend is unavailable, it gracefully falls back to native browser print preview.
 */
export async function exportResumeToPdf(
  pageFormat: "letter" | "a4" = "letter",
  fileName: string = "Resume.pdf"
): Promise<void> {
  // Query all rendered pages inside the preview area
  const pageElements = document.querySelectorAll<HTMLElement>(
    ".preview-scale .resume-page"
  );

  const elementsToCapture =
    pageElements.length > 0
      ? Array.from(pageElements)
      : [document.getElementById("resume-page") as HTMLElement].filter(Boolean);

  if (!elementsToCapture || elementsToCapture.length === 0) {
    throw new Error("No resume preview found to export.");
  }

  // Auto-detect format from the rendered DOM elements if available
  const isA4 = elementsToCapture[0]?.classList.contains("resume-page-a4");
  const actualFormat: "letter" | "a4" = isA4 ? "a4" : pageFormat;

  const safeFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

  // Assemble full HTML document with embedded styles
  const fullHtml = buildResumeHtml(elementsToCapture, actualFormat, safeFileName);

  try {
    // Request server-side vector PDF from NestJS Puppeteer engine
    const pdfBlob = await generatePdfFromServer({
      html: fullHtml,
      format: actualFormat,
      fileName: safeFileName,
    });

    downloadBlob(pdfBlob, safeFileName);
  } catch (error) {
    console.warn(
      "Server vector PDF generation failed. Falling back to native browser print:",
      error
    );
    // Graceful fallback to browser print dialog (which also produces a vector PDF)
    window.print();
  }
}

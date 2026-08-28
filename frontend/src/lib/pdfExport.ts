import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

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

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: actualFormat === "letter" ? "in" : "mm",
    format: actualFormat === "letter" ? "letter" : "a4",
  });

  const pdfWidth = actualFormat === "letter" ? 8.5 : 210;
  const pdfHeight = actualFormat === "letter" ? 11 : 297;

  for (let i = 0; i < elementsToCapture.length; i++) {
    const pageEl = elementsToCapture[i];
    if (!pageEl) continue;

    if (i > 0) {
      pdf.addPage(actualFormat === "letter" ? "letter" : "a4", "portrait");
    }

    // Capture using html-to-image with high pixelRatio for crisp vector-like text
    const imgDataUrl = await toPng(pageEl, {
      pixelRatio: 2.5,
      quality: 0.98,
      backgroundColor: "#ffffff",
      filter: (node: HTMLElement) => {
        // Exclude on-screen helper badges if any
        if (node.classList && node.classList.contains("no-print")) {
          return false;
        }
        return true;
      },
    });

    pdf.addImage(
      imgDataUrl,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight,
      undefined,
      "FAST"
    );
  }

  pdf.save(fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
}

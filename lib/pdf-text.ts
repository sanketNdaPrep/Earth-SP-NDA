import type { TextItem } from "./pdf-questions";

/** Biggest question PDF the browser will read. */
export const QUESTION_PDF_MAX_BYTES = 50 * 1024 * 1024;

export function questionPdfProblem(file: Pick<File, "type" | "name" | "size">): string | null {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) return "Choose a PDF file.";
  if (file.size > QUESTION_PDF_MAX_BYTES) return `This PDF is ${(file.size / 1024 / 1024).toFixed(0)} MB. The most allowed is ${QUESTION_PDF_MAX_BYTES / 1024 / 1024} MB.`;
  if (file.size === 0) return "This PDF is empty.";
  return null;
}

/**
 * Reads every piece of text in a PDF with its position. pdf.js is loaded only when an admin picks a PDF.
 * Throws a plain-words message when the file cannot be opened.
 */
export async function readPdfText(file: File): Promise<{ items: TextItem[]; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const doc = await task.promise;
    const items: TextItem[] = [];
    for (let number = 1; number <= doc.numPages; number += 1) {
      const page = await doc.getPage(number);
      const view = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      for (const item of content.items) {
        if (!("str" in item) || !item.str) continue;
        items.push({ page: number, x: item.transform[4], y: view.height - item.transform[5], w: item.width, pageHeight: view.height, str: item.str });
      }
      page.cleanup();
    }
    return { items, pages: doc.numPages };
  } catch (error) {
    const name = (error as { name?: string })?.name;
    if (name === "PasswordException") throw new Error("This PDF is locked with a password. Remove the password and try again.");
    throw new Error("This PDF could not be opened. It may be damaged.");
  } finally {
    await task.destroy();
  }
}

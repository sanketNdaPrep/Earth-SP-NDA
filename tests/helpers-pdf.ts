import fs from "node:fs";
import { readPdfDocument } from "../lib/pdf-text";
import { parseQuestionPdf } from "../lib/pdf-questions";

/** Reads a PDF from disk the way the browser does, for tests. */
export async function parseFixture(path: string) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(path)), useSystemFonts: true }).promise;
  const items = await readPdfDocument(doc as never, pdfjs.OPS as never);
  return { items, result: parseQuestionPdf(items) };
}

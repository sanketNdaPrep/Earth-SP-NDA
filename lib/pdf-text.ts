import type { TextItem } from "./pdf-questions";
import { mathify, type Rule } from "./pdf-math";

/** Biggest question PDF the browser will read. */
export const QUESTION_PDF_MAX_BYTES = 50 * 1024 * 1024;

export function questionPdfProblem(file: Pick<File, "type" | "name" | "size">): string | null {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) return "Choose a PDF file.";
  if (file.size > QUESTION_PDF_MAX_BYTES) return `This PDF is ${(file.size / 1024 / 1024).toFixed(0)} MB. The most allowed is ${QUESTION_PDF_MAX_BYTES / 1024 / 1024} MB.`;
  if (file.size === 0) return "This PDF is empty.";
  return null;
}

interface PdfPageLike {
  getViewport(o: { scale: number }): { height: number };
  getTextContent(): Promise<{ items: unknown[] }>;
  getOperatorList(): Promise<{ fnArray: number[]; argsArray: unknown[] }>;
  cleanup(): void;
}
interface PdfDocLike {
  numPages: number;
  getPage(n: number): Promise<PdfPageLike>;
}

/** Horizontal lines on a page: fraction bars and the tops of square roots. y counts down from the top. */
async function readRules(page: PdfPageLike, ops: Record<string, number>, number: number, height: number): Promise<Rule[]> {
  const list = await page.getOperatorList();
  const rules: Rule[] = [];
  let m = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];
  const mul = (a: number[], b: number[]) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
  for (let i = 0; i < list.fnArray.length; i += 1) {
    const fn = list.fnArray[i];
    const args = list.argsArray[i] as unknown[];
    if (fn === ops.save) stack.push(m);
    else if (fn === ops.restore) m = stack.pop() ?? m;
    else if (fn === ops.transform) m = mul(m, args as number[]);
    else if (fn === ops.constructPath && args && !Array.isArray(args[0]) && args[1]) {
      // Newer pdf.js: [paint operator, flat numbers, bounds]. 0 move, 1 line, 2 curve, 3 quad, 4 close.
      if (args[0] === ops.endPath) continue;
      const raw = args[1] as unknown[];
      const flat = raw.length === 1 && raw[0] !== null && typeof raw[0] === "object" ? (raw[0] as ArrayLike<number>) : (raw as unknown as ArrayLike<number>);
      const d = Array.from(flat);
      const subpaths: { x: number; y: number }[][] = [];
      let k = 0;
      while (k < d.length) {
        const op = d[k++];
        if (op === 0) subpaths.push([{ x: d[k++], y: d[k++] }]);
        else if (op === 1) {
          const last = subpaths[subpaths.length - 1];
          if (last) last.push({ x: d[k++], y: d[k++] });
          else k += 2;
        } else if (op === 2) k += 6;
        else if (op === 3) k += 4;
      }
      for (const sp of subpaths) {
        const pts = sp.map((p) => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5] }));
        if (pts.length < 2 || pts.length > 5) continue;
        const xs = pts.map((p) => p.x);
        const ys = pts.map((p) => p.y);
        const w = Math.max(...xs) - Math.min(...xs);
        const h = Math.max(...ys) - Math.min(...ys);
        if (w >= 2.5 && h <= 1.6) rules.push({ page: number, x0: Math.min(...xs), x1: Math.max(...xs), y: height - (Math.max(...ys) + Math.min(...ys)) / 2 });
      }
    }
  }
  return rules;
}

/** Reads the text and drawn lines of an open PDF and rebuilds the maths in it. */
export async function readPdfDocument(doc: PdfDocLike, ops: Record<string, number>): Promise<TextItem[]> {
  const items: TextItem[] = [];
  const rules: Rule[] = [];
  for (let number = 1; number <= doc.numPages; number += 1) {
    const page = await doc.getPage(number);
    const view = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    for (const item of content.items as { str?: string; transform: number[]; width: number }[]) {
      if (!item.str) continue;
      items.push({ page: number, x: item.transform[4], y: view.height - item.transform[5], w: item.width, pageHeight: view.height, str: item.str, size: Math.abs(item.transform[3]) || Math.hypot(item.transform[0], item.transform[1]) });
    }
    try {
      rules.push(...(await readRules(page, ops, number, view.height)));
    } catch {
      // Without the lines, fractions are still found from the positions of the numbers.
    }
    page.cleanup();
  }
  return mathify(items, rules);
}

/**
 * Reads every piece of text in a PDF with its position. pdf.js is loaded only when an admin picks a PDF.
 * Maths (fractions, powers, roots) comes back as LaTeX between dollar signs.
 * Throws a plain-words message when the file cannot be opened.
 */
export async function readPdfText(file: File): Promise<{ items: TextItem[]; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const doc = await task.promise;
    const items = await readPdfDocument(doc as unknown as PdfDocLike, pdfjs.OPS as unknown as Record<string, number>);
    return { items, pages: doc.numPages };
  } catch (error) {
    const name = (error as { name?: string })?.name;
    if (name === "PasswordException") throw new Error("This PDF is locked with a password. Remove the password and try again.");
    throw new Error("This PDF could not be opened. It may be damaged.");
  } finally {
    await task.destroy();
  }
}

import { PAGE_LONG_SIDE, pictureSize } from "./pdf-upload";

export interface OpenPdf {
  numPages: number;
  /** One page as a JPEG picture. */
  renderPage: (page: number) => Promise<Blob>;
  /** One strip of a page (fractions of its height) as a sharp JPEG, for showing the original of a question. */
  renderStrip: (page: number, top: number, bottom: number) => Promise<Blob>;
  close: () => Promise<void>;
}

/** The first and last columns of a picture that are not white, with a little room around them. */
function inkColumns(data: ImageData | undefined): { left: number; right: number } {
  if (!data) return { left: 0, right: 1 };
  const { width, height, data: px } = data;
  let left = width;
  let right = 0;
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      if (px[(y * width + x) * 4] < 200) {
        if (x < left) left = x;
        if (x > right) right = x;
        break;
      }
    }
  }
  if (right <= left) return { left: 0, right: width };
  const pad = 12;
  return { left: Math.max(0, left - pad), right: Math.min(width, right + pad) };
}

/** Width of a strip picture in pixels. Wide enough to read small powers and fraction bars. */
export const STRIP_WIDTH = 1700;

/** Opens a PDF in the browser. pdf.js is loaded only when an admin picks a PDF, never for students. */
export async function openPdf(file: File): Promise<OpenPdf> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const doc = await task.promise;
  return {
    numPages: doc.numPages,
    async renderPage(number) {
      const page = await doc.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const size = pictureSize(base.width, base.height, PAGE_LONG_SIDE);
      const viewport = page.getViewport({ scale: size.width / base.width });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("This browser cannot turn the PDF into pictures.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      page.cleanup();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      canvas.width = 0;
      if (!blob) throw new Error(`Page ${number} could not be converted.`);
      return blob;
    },
    async renderStrip(number, top, bottom) {
      const page = await doc.getPage(number);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: STRIP_WIDTH / base.width });
      const full = document.createElement("canvas");
      full.width = Math.round(viewport.width);
      full.height = Math.round(viewport.height);
      const ctx = full.getContext("2d");
      if (!ctx) throw new Error("This browser cannot turn the PDF into pictures.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, full.width, full.height);
      await page.render({ canvas: full, canvasContext: ctx, viewport }).promise;
      page.cleanup();
      const y = Math.max(0, Math.floor(top * full.height));
      const h = Math.max(1, Math.min(full.height - y, Math.ceil((bottom - top) * full.height)));
      const strip = document.createElement("canvas");
      // Cut the empty margins away so the question fills the picture.
      const { left, right } = inkColumns(full.getContext("2d")?.getImageData(0, y, full.width, h));
      const w = Math.max(1, right - left);
      strip.width = w;
      strip.height = h;
      strip.getContext("2d")?.drawImage(full, left, y, w, h, 0, 0, w, h);
      full.width = 0;
      const blob = await new Promise<Blob | null>((resolve) => strip.toBlob(resolve, "image/jpeg", 0.88));
      strip.width = 0;
      if (!blob) throw new Error(`Page ${number} could not be converted.`);
      return blob;
    },
    close: () => task.destroy(),
  };
}

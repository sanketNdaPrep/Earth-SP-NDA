import { PAGE_LONG_SIDE, pictureSize } from "./pdf-upload";

export interface OpenPdf {
  numPages: number;
  /** One page as a JPEG picture. */
  renderPage: (page: number) => Promise<Blob>;
  close: () => Promise<void>;
}

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
    close: () => task.destroy(),
  };
}

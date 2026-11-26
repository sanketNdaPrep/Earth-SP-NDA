import { pictureUrl } from "@/components/flashcards/picture-url";
import { pageSize } from "@/lib/flashcard-download";
import type { FlashcardImage } from "@/lib/flashcard-images";

/** Saves a blob through a temporary link. */
function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function fetchBlob(path: string): Promise<Blob> {
  const res = await fetch(pictureUrl(path));
  if (!res.ok) throw new Error("A picture could not be fetched.");
  return res.blob();
}

/** Downloads one picture as it was uploaded. */
export async function downloadPicture(item: Pick<FlashcardImage, "image_path">, filename: string): Promise<void> {
  save(await fetchBlob(item.image_path), filename);
}

/** Downloads the original PDF a flashcard page came from. */
export async function downloadSourcePdf(item: Pick<FlashcardImage, "source_pdf">, filename: string): Promise<void> {
  if (!item.source_pdf) throw new Error("This flashcard has no PDF.");
  save(await fetchBlob(item.source_pdf), filename);
}

/** Draws any picture type (PNG, JPG, WebP) onto a canvas and returns it as JPEG bytes. */
async function toJpeg(blob: Blob): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot build the PDF.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  bitmap.close();
  if (!out) throw new Error("A picture could not be converted.");
  return { bytes: new Uint8Array(await out.arrayBuffer()), width: canvas.width, height: canvas.height };
}

/** Builds one PDF with a page per picture, in the order given. */
export async function buildChapterPdf(items: readonly Pick<FlashcardImage, "image_path">[]): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  for (const item of items) {
    const { bytes, width, height } = await toJpeg(await fetchBlob(item.image_path));
    const image = await doc.embedJpg(bytes);
    const size = pageSize(width, height);
    const page = doc.addPage([size.width, size.height]);
    page.drawImage(image, { x: 0, y: 0, width: size.width, height: size.height });
  }
  const pdf = await doc.save();
  return new Blob([pdf as BlobPart], { type: "application/pdf" });
}

/** Builds the chapter PDF and downloads it. */
export async function downloadChapterPdf(items: readonly Pick<FlashcardImage, "image_path">[], filename: string): Promise<void> {
  save(await buildChapterPdf(items), filename);
}

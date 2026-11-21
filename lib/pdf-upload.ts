/** Rules and names for PDF uploads. Pure, so they can be tested. */

/** Supabase's free plan stops files above 50 MB. */
export const PDF_MAX_BYTES = 50 * 1024 * 1024;
/** Every page becomes a picture in the browser, so very long PDFs are split by the admin first. */
export const PDF_MAX_PAGES = 80;
/** Longest side of a page picture, in pixels. Sharp on a phone without being heavy. */
export const PAGE_LONG_SIDE = 1600;

export function isPdf(file: Pick<File, "type" | "name">): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function mb(bytes: number): string {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

/** Returns why a PDF cannot be uploaded, or null. */
export function pdfProblem(file: Pick<File, "type" | "size" | "name">): string | null {
  const name = file.name || "That PDF";
  if (!isPdf(file)) return `${name} is not a PDF.`;
  if (file.size === 0) return `${name} is empty.`;
  if (file.size > PDF_MAX_BYTES) return `${name} is ${mb(file.size)}. The limit is ${mb(PDF_MAX_BYTES)}. Split it into smaller PDFs and upload them one by one.`;
  return null;
}

/** Returns why a PDF has too many pages, or null. */
export function pageCountProblem(name: string, pages: number): string | null {
  if (pages < 1) return `${name} has no pages.`;
  if (pages > PDF_MAX_PAGES) return `${name} has ${pages} pages. The limit is ${PDF_MAX_PAGES} pages at a time. Split it into smaller PDFs and upload them one by one.`;
  return null;
}

function slug(name: string): string {
  return (
    name
      .replace(/\.[^.]*$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "file"
  );
}

/** Where the original PDF lives in the flashcard bucket. */
export function sourcePdfPath(id: string, fileName: string): string {
  return `pdfs/${id}-${slug(fileName)}.pdf`;
}

/** Where one page picture lives in the flashcard bucket. */
export function pagePicturePath(id: string, page: number): string {
  return `cards/${id}-page-${page}.jpg`;
}

/**
 * The list shows the newest first, so page 1 gets the newest time and the pages then read in order.
 * One second apart keeps the order stable.
 */
export function pageCreatedAt(baseMs: number, page: number): string {
  return new Date(baseMs - (page - 1) * 1000).toISOString();
}

/** Size of a page picture: the longest side is `longSide`, the shape is kept. */
export function pictureSize(width: number, height: number, longSide: number = PAGE_LONG_SIDE): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: Math.round(longSide * 0.7), height: longSide };
  const scale = longSide / Math.max(width, height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** A safe name for the downloaded PDF, always ending in .pdf. */
export function pdfDownloadName(sourceName: string | null | undefined, fallback = "flashcards"): string {
  return `${slug(sourceName || fallback)}.pdf`;
}

/** File name for a syllabus: "NDA" -> "nda-syllabus.pdf". */
export function syllabusDownloadName(exam: string): string {
  return `${slug(exam)}-syllabus.pdf`;
}

/** Where an exam's syllabus lives in the study-materials bucket. */
export function syllabusPath(id: string): string {
  return `syllabus/${id}.pdf`;
}

/** File names for flashcard downloads. Pure, so they can be tested. */

/** Lowercase, dashes between words, safe in any file system. */
export function fileSlug(text: string, fallback = "flashcards"): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || fallback;
}

/** "Mathematics" + "Trigonometry" -> "mathematics-trigonometry-flashcards.pdf". */
export function chapterPdfName(subject: string, chapter: string): string {
  return `${fileSlug(`${subject} ${chapter}`)}-flashcards.pdf`;
}

/** "mathematics-trigonometry-card-3.png": the extension follows the stored picture. */
export function pictureFileName(subject: string, chapter: string | null, position: number, imagePath: string): string {
  const ext = /\.([a-z0-9]{2,4})$/i.exec(imagePath)?.[1]?.toLowerCase() ?? "jpg";
  return `${fileSlug([subject, chapter].filter(Boolean).join(" "))}-card-${position}.${ext}`;
}

/** The longest side of a PDF page, in points (A4 is 842). Pages follow each picture's own shape. */
export const PDF_LONG_SIDE = 842;

/** Page size for a picture, keeping its shape and capping the longest side. */
export function pageSize(width: number, height: number): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 595, height: PDF_LONG_SIDE };
  const scale = PDF_LONG_SIDE / Math.max(width, height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

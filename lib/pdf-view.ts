/** Zoom steps of the PDF viewer, as a share of "fit the screen width". */
export const ZOOM_STEPS = [0.6, 0.8, 1, 1.25, 1.5, 2, 3] as const;
export const DEFAULT_ZOOM = 1;

/** The next zoom step in a direction, staying inside the list. */
export function stepZoom(current: number, direction: 1 | -1): number {
  const index = ZOOM_STEPS.findIndex((z) => z >= current - 0.001);
  const from = index === -1 ? ZOOM_STEPS.length - 1 : index;
  const next = Math.min(ZOOM_STEPS.length - 1, Math.max(0, from + direction));
  return ZOOM_STEPS[next];
}

/** Which page is under a line `offset` pixels from the top of the scrolled list. Heights are page heights plus the gap. */
export function pageAtOffset(offset: number, heights: readonly number[], gap: number): number {
  let top = 0;
  for (let i = 0; i < heights.length; i += 1) {
    const bottom = top + heights[i] + gap;
    if (offset < bottom) return i + 1;
    top = bottom;
  }
  return Math.max(1, heights.length);
}

/** Height of a page shown `width` pixels wide, from its size in PDF points. */
export function pageHeightFor(width: number, pageWidth: number, pageHeight: number): number {
  if (pageWidth <= 0) return width * 1.414;
  return Math.round((width * pageHeight) / pageWidth);
}

/** A readable file name for a download: the title with unsafe characters removed, ending in .pdf. */
export function pdfFileName(title: string): string {
  const base = title.replace(/\.pdf$/i, "").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim();
  return `${base || "document"}.pdf`;
}

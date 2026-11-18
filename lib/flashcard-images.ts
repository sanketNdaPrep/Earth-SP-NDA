/** Picture flashcards: images an admin uploads, filed under a subject and chapter. */

export const FLASHCARD_BUCKET = "flashcard-images";

/** How many pictures the "Recently added" strip shows. */
export const RECENT_COUNT = 4;

export const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** The value for the file picker's accept attribute. */
export const IMAGE_ACCEPT = ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp";

export interface FlashcardImage {
  id: string;
  subject_id: string;
  chapter_id: string | null;
  image_path: string;
  caption: string | null;
  created_at: string;
}

export const IMAGE_COLUMNS = "id, subject_id, chapter_id, image_path, caption, created_at";

/** Returns why a file cannot be uploaded, or null. There is no size limit. */
export function imageProblem(file: Pick<File, "type" | "size" | "name">): string | null {
  if (!IMAGE_TYPES[file.type]) return `${file.name || "That file"} is not a PNG, JPG or WebP picture.`;
  if (file.size === 0) return `${file.name || "That file"} is empty.`;
  return null;
}

/** A unique path inside the bucket. The extension comes from the file type, never from the name. */
export function imagePath(file: Pick<File, "type" | "name">, id: string): string {
  const base = file.name
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `cards/${id}-${base || "card"}.${IMAGE_TYPES[file.type] ?? "jpg"}`;
}

/** The newest pictures first, at most `count`. Ties keep their original order. */
export function recentPictures<T extends Pick<FlashcardImage, "created_at">>(items: readonly T[], count: number = RECENT_COUNT): T[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => Date.parse(b.item.created_at) - Date.parse(a.item.created_at) || a.index - b.index)
    .slice(0, count)
    .map((x) => x.item);
}

/** Position after moving `by` steps, wrapping around the ends of a list of `length` items. */
export function stepIndex(current: number, by: number, length: number): number {
  if (length <= 0) return 0;
  return (((current + by) % length) + length) % length;
}

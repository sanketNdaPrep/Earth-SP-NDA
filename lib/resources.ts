/** Shared settings and helpers for study material uploads. */

export const RESOURCE_BUCKET = "study-materials";

/** Matches the 20 MB limit set on the bucket. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ACCEPTED_TYPES: Record<string, { label: string; kind: ResourceKind }> = {
  "application/pdf": { label: "PDF", kind: "pdf" },
  "image/png": { label: "PNG image", kind: "image" },
  "image/jpeg": { label: "JPG image", kind: "image" },
  "image/webp": { label: "WebP image", kind: "image" },
};

/** The value for the file picker's accept attribute. */
export const ACCEPT_ATTRIBUTE = ".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp";

export type ResourceKind = "pdf" | "image";

/** Suggestions for the category box. An admin can type any other category. */
export const RESOURCE_CATEGORIES = [
  "Maths Notes",
  "Physics Notes",
  "Chemistry Notes",
  "English Notes",
  "General Studies Notes",
  "Flashcards",
  "Formula Sheet",
  "Previous Year Paper",
  "Practice Sheet",
  "Planner",
];

export const MAX_DESCRIPTION = 300;
export const MAX_CATEGORY = 60;

export const RESOURCE_EXAMS = ["NDA", "CDS", "AFCAT", "NDA, CDS and AFCAT"];

/** A row of the resources table as the admin page reads it. */
export interface StoredResource {
  id: string;
  title: string;
  category: string | null;
  size: string | null;
  recommended_for: string | null;
  download_url: string;
  file_path: string | null;
  file_type: string | null;
  description: string | null;
  downloads: number;
  created_at: string;
}

export const RESOURCE_COLUMNS =
  "id, title, description, category, size, recommended_for, download_url, file_path, file_type, downloads, created_at";

/** "2.4 MB", "310 KB". */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Number((bytes / (1024 * 1024)).toFixed(1))} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Returns an error message when the file cannot be uploaded, otherwise null. */
export function checkFile(file: File): string | null {
  if (!ACCEPTED_TYPES[file.type]) return "Only PDF, PNG, JPG and WebP files can be uploaded.";
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_UPLOAD_BYTES) return `That file is ${formatSize(file.size)}. The limit is ${formatSize(MAX_UPLOAD_BYTES)}.`;
  return null;
}

const EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * A safe, unique path inside the bucket: a random id plus a tidy version of the
 * file name. The extension comes from the file type, never from the name.
 */
export function storagePath(file: File): string {
  const base = file.name
    .replace(/\.[^.]*$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `uploads/${crypto.randomUUID()}-${base || "file"}.${EXTENSIONS[file.type]}`;
}

/**
 * Whether a stored resource is a PDF or an image. Uses the saved type, then the
 * link's file extension, and falls back to PDF (older rows are all PDFs).
 */
export function resourceKind(resource: { file_type?: string | null; download_url?: string | null }): ResourceKind {
  if (resource.file_type === "image" || resource.file_type === "pdf") return resource.file_type;
  const path = (resource.download_url ?? "").split(/[?#]/)[0].toLowerCase();
  return /\.(png|jpe?g|webp)$/.test(path) ? "image" : "pdf";
}

/**
 * Lesson attachment rules, shared by the browser (early feedback) and the
 * server (the source of truth).
 */

/** Extension → MIME type. The MIME type sent to R2 is derived from this. */
export const ATTACHMENT_TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
} as const;

export type AttachmentExtension = keyof typeof ATTACHMENT_TYPES;
export type AttachmentMimeType = (typeof ATTACHMENT_TYPES)[AttachmentExtension];

export const ALLOWED_ATTACHMENT_EXTENSIONS = Object.keys(
  ATTACHMENT_TYPES,
) as AttachmentExtension[];

export const ALLOWED_ATTACHMENT_MIME_TYPES = Object.values(
  ATTACHMENT_TYPES,
) as AttachmentMimeType[];

/** For `<input accept>`. */
export const ATTACHMENT_ACCEPT = ALLOWED_ATTACHMENT_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");

export const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const MAX_ATTACHMENTS_PER_LESSON = 20;

/** Lifetime of presigned upload and download URLs. */
export const PRESIGNED_URL_EXPIRY_SECONDS = 5 * 60;

export function getAttachmentExtension(
  filename: string,
): AttachmentExtension | null {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";

  return extension in ATTACHMENT_TYPES
    ? (extension as AttachmentExtension)
    : null;
}

/** MIME type for a file name, or null if the type isn't allowed. */
export function getAttachmentMimeType(
  filename: string,
): AttachmentMimeType | null {
  const extension = getAttachmentExtension(filename);

  return extension ? ATTACHMENT_TYPES[extension] : null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

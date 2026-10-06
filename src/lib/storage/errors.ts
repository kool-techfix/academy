import { MAX_ATTACHMENTS_PER_LESSON } from "./constants";

/** Error messages the attachment routes map to HTTP statuses. */
export const ATTACHMENT_ERRORS = {
  invalid: "Invalid attachment",
  typeNotAllowed: "Only PDF, DOC, DOCX and TXT files are allowed",
  tooLarge: "Files must be 25 MB or smaller",
  tooMany: `A lesson can have at most ${MAX_ATTACHMENTS_PER_LESSON} attachments`,
  notFound: "Attachment not found",
  forbidden: "You do not have access to this attachment",
} as const;

const BAD_REQUEST = new Set<string>([
  ATTACHMENT_ERRORS.invalid,
  ATTACHMENT_ERRORS.typeNotAllowed,
  ATTACHMENT_ERRORS.tooLarge,
  ATTACHMENT_ERRORS.tooMany,
  "Lesson title is required",
  "YouTube video Link is required",
]);

const FORBIDDEN = new Set<string>([
  "Forbidden",
  "Instructor account is not approved",
  "You do not have permission to manage this lesson",
  ATTACHMENT_ERRORS.forbidden,
]);

const NOT_FOUND = new Set<string>([
  "Lesson not found",
  "Module not found",
  ATTACHMENT_ERRORS.notFound,
]);

/** HTTP status for an error thrown by the lesson/attachment routes. */
export function lessonErrorStatus(message: string) {
  if (message === "Unauthorized") return 401;
  if (FORBIDDEN.has(message)) return 403;
  if (NOT_FOUND.has(message)) return 404;
  if (BAD_REQUEST.has(message)) return 400;
  if (message === "File storage is not configured") return 503;

  return 500;
}

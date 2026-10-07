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

/** Failures talking to R2, shown to the user instead of raw SDK errors. */
export const STORAGE_ERRORS = {
  denied:
    "File storage refused the request. Please try again later, and contact support if it keeps happening.",
  unavailable: "File storage is unavailable right now. Please try again.",
} as const;

export const MODULE_LESSON_LIMIT =
  "This module already has a lesson. Each module can only have one lesson.";

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
  "You do not have permission to manage this quiz",
  "You do not have permission to view this course",
  ATTACHMENT_ERRORS.forbidden,
]);

const NOT_FOUND = new Set<string>([
  "Course not found",
  "Quiz not found",
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
  if (message === MODULE_LESSON_LIMIT) return 409;
  if (message === "File storage is not configured") return 503;
  if (message === STORAGE_ERRORS.denied || message === STORAGE_ERRORS.unavailable) {
    return 502;
  }

  return 500;
}

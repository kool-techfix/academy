import { z } from "zod";

import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_LESSON,
  type AttachmentMimeType,
} from "@/lib/storage/constants";

const mimeTypeSchema = z.enum(
  ALLOWED_ATTACHMENT_MIME_TYPES as [AttachmentMimeType, ...AttachmentMimeType[]],
  { message: "Only PDF, DOC, DOCX and TXT files are allowed" },
);

const sizeSchema = z
  .number()
  .int()
  .positive("File is empty")
  .max(MAX_ATTACHMENT_SIZE_BYTES, "Files must be 25 MB or smaller");

const originalNameSchema = z
  .string()
  .trim()
  .min(1, "File name is required")
  .max(255, "File name is too long");

export const attachmentUploadUrlSchema = z.object({
  filename: originalNameSchema,
  contentType: mimeTypeSchema,
  size: sizeSchema,
  lessonId: z.string().min(1).optional(),
});

export type AttachmentUploadUrlInput = z.infer<
  typeof attachmentUploadUrlSchema
>;

export const lessonAttachmentPayloadSchema = z.object({
  key: z.string().min(1, "Attachment key is required").max(512),
  originalName: originalNameSchema,
  mimeType: mimeTypeSchema,
  size: sizeSchema,
});

export type LessonAttachmentPayload = z.infer<
  typeof lessonAttachmentPayloadSchema
>;

/** `attachments` field on lesson create/update bodies. */
export const lessonAttachmentsSchema = z
  .array(lessonAttachmentPayloadSchema)
  .max(
    MAX_ATTACHMENTS_PER_LESSON,
    `A lesson can have at most ${MAX_ATTACHMENTS_PER_LESSON} attachments`,
  )
  .optional();

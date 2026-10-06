import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Modal } from "./modal";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/academy-ui";
import { FileText, FileUp, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  ATTACHMENT_ACCEPT,
  formatFileSize,
  getAttachmentMimeType,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_LESSON,
} from "@/lib/storage/constants";
import { lessonAttachmentPayloadSchema } from "@/Schemas/lesson-attachment.schema";
import { useUploadLessonAttachment } from "@/hooks/instructor/use-upload-lesson-attachment";
import type { Lesson, LessonAttachmentInput } from "@/Services/lesson.service";

const attachmentRowSchema = z.object({
  rowId: z.string(),
  name: z.string(),
  size: z.number(),
  /** existing = already saved on the lesson; the rest are new uploads. */
  status: z.enum(["existing", "uploading", "uploaded", "failed"]),
  progress: z.number(),
  attachmentId: z.string().optional(),
  upload: lessonAttachmentPayloadSchema.optional(),
});

type AttachmentRow = z.infer<typeof attachmentRowSchema>;

const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  youtubeVideoLink: z
    .string()
    .url("Must be a valid URL")
    .refine((val) => val.includes("youtube.com") || val.includes("youtu.be"), {
      message: "Must be a YouTube link",
    }),
  attachments: z.array(attachmentRowSchema).superRefine((rows, context) => {
    if (rows.some((row) => row.status === "uploading")) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wait for uploads to finish before saving",
      });
    } else if (rows.some((row) => row.status === "failed")) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remove failed uploads before saving",
      });
    }
  }),
  /** Saved attachments the instructor removed; deleted when the lesson is saved. */
  removedAttachmentIds: z.array(z.string()),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export type LessonFormSaveData = {
  title: string;
  youtubeVideoLink: string;
  notesFileUrl: string | null;
  attachments: LessonAttachmentInput[];
  removedAttachmentIds: string[];
};

function validateFile(file: File) {
  if (!getAttachmentMimeType(file.name)) {
    return "Only PDF, DOC, DOCX and TXT files are allowed";
  }

  if (file.size === 0) {
    return "File is empty";
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return "Files must be 25 MB or smaller";
  }

  return null;
}

const STATUS_LABEL: Record<AttachmentRow["status"], string> = {
  existing: "Saved",
  uploading: "Uploading",
  uploaded: "Uploaded",
  failed: "Failed",
};

export function LessonFormModal({
  courseId,
  lesson,
  onClose,
  onSave,
  isSaving,
}: {
  courseId: string;
  lesson?: Lesson;
  onClose: () => void;
  onSave: (data: LessonFormSaveData) => void;
  isSaving: boolean;
}) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || "",
      youtubeVideoLink: lesson?.youtubeVideoLink || "",
      attachments: (lesson?.attachments ?? []).map((attachment) => ({
        rowId: attachment.id,
        name: attachment.originalName,
        size: attachment.size,
        status: "existing" as const,
        progress: 100,
        attachmentId: attachment.id,
      })),
      removedAttachmentIds: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "attachments",
    keyName: "fieldKey",
  });

  const rows = useWatch({ control, name: "attachments" });
  const isUploading = rows.some((row) => row.status === "uploading");

  const uploadAttachment = useUploadLessonAttachment();
  const [isDragging, setIsDragging] = useState(false);

  /** Patch a row by id; it may have been removed while uploading. */
  const patchRow = (rowId: string, patch: Partial<AttachmentRow>) => {
    const current = getValues("attachments");
    const index = current.findIndex((row) => row.rowId === rowId);

    if (index !== -1) {
      update(index, { ...current[index], ...patch });
    }
  };

  const addFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    let slots = MAX_ATTACHMENTS_PER_LESSON - getValues("attachments").length;

    for (const file of files) {
      const error = validateFile(file);

      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      if (slots <= 0) {
        toast.error(
          `A lesson can have at most ${MAX_ATTACHMENTS_PER_LESSON} attachments`,
        );
        break;
      }

      slots -= 1;

      const rowId = crypto.randomUUID();

      append({
        rowId,
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
      });

      uploadAttachment
        .mutateAsync({
          courseId,
          lessonId: lesson?.id,
          file,
          onProgress: (progress) => patchRow(rowId, { progress }),
        })
        .then((upload) =>
          patchRow(rowId, { status: "uploaded", progress: 100, upload }),
        )
        .catch((uploadError: unknown) => {
          patchRow(rowId, { status: "failed" });
          toast.error(
            `${file.name}: ${getApiErrorMessage(uploadError, "Upload failed")}`,
          );
        });
    }
  };

  const removeRow = (index: number) => {
    const row = getValues("attachments")[index];

    if (row?.attachmentId) {
      setValue("removedAttachmentIds", [
        ...getValues("removedAttachmentIds"),
        row.attachmentId,
      ]);
    }

    remove(index);
  };

  const onSubmit = (data: LessonFormData) => {
    onSave({
      title: data.title,
      youtubeVideoLink: data.youtubeVideoLink,
      // Legacy single-notes field; kept as-is (no longer edited here).
      notesFileUrl: lesson?.notesFileUrl ?? null,
      attachments: data.attachments.flatMap((row) =>
        row.status === "uploaded" && row.upload ? [row.upload] : [],
      ),
      removedAttachmentIds: data.removedAttachmentIds,
    });
  };

  return (
    <Modal title={lesson ? "Edit Lesson" : "Add Lesson"} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="stack">
        <FormField
          label="Lesson Title"
          name="title"
          register={register}
          error={errors.title?.message as string}
          placeholder="e.g. Capacitor Testing"
        />
        <FormField
          label="YouTube Link"
          name="youtubeVideoLink"
          register={register}
          error={errors.youtubeVideoLink?.message as string}
          placeholder="https://youtube.com/watch?v=..."
        />

        <div className="form-field" style={{ marginTop: 12 }}>
          <label htmlFor="lesson-attachments">Attachments (Optional)</label>
          <label
            className={`attachment-dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              addFiles(event.dataTransfer.files);
            }}
            data-testid="dropzone-lesson-attachments"
          >
            <FileUp size={18} style={{ color: "var(--brand-text-muted)" }} />
            <span>
              Drop files here or <strong>choose files</strong>
              <small>PDF, DOC, DOCX or TXT · up to 25 MB each</small>
            </span>
            <input
              id="lesson-attachments"
              type="file"
              className="sr-only"
              accept={ATTACHMENT_ACCEPT}
              multiple
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
              data-testid="input-lesson-attachments"
            />
          </label>

          {fields.length > 0 && (
            <ul className="attachment-list" data-testid="list-lesson-attachments">
              {fields.map((field, index) => {
                const row = rows[index] ?? field;

                return (
                  <li
                    key={field.fieldKey}
                    className={`attachment-row ${row.status}`}
                    data-testid={`row-attachment-${index}`}
                  >
                    <FileText size={16} style={{ color: "var(--brand-text-muted)" }} />
                    <div className="attachment-info">
                      <span className="attachment-name">{row.name}</span>
                      <span className="attachment-meta">
                        {formatFileSize(row.size)} ·{" "}
                        <span className={`attachment-status ${row.status}`}>
                          {row.status === "uploading"
                            ? `Uploading ${row.progress}%`
                            : STATUS_LABEL[row.status]}
                        </span>
                      </span>
                      {row.status === "uploading" && (
                        <span className="attachment-progress" aria-hidden="true">
                          <span style={{ width: `${row.progress}%` }} />
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => removeRow(index)}
                      aria-label={`Remove ${row.name}`}
                      data-testid={`button-remove-attachment-${index}`}
                    >
                      <X size={16} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {errors.attachments?.root?.message && (
            <div className="field-error" role="alert">
              {errors.attachments.root.message}
            </div>
          )}
        </div>

        <div
          className="row"
          style={{ justifyContent: "flex-end", marginTop: 12 }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || isUploading}>
            {isSaving
              ? "Saving..."
              : isUploading
                ? "Uploading..."
                : "Save Lesson"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

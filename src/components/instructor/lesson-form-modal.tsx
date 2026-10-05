import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "./modal";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/academy-ui";
import { FileUp, FileText, X } from "lucide-react";
import { CreateLessonPayload, UpdateLessonPayload } from "@/Services/lesson.service";

const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  youtubeVideoLink: z
    .string()
    .url("Must be a valid URL")
    .refine((val) => val.includes("youtube.com") || val.includes("youtu.be"), {
      message: "Must be a YouTube link",
    }),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export function LessonFormModal({
  lesson,
  onClose,
  onSave,
  isSaving,
}: {
  lesson?: CreateLessonPayload | UpdateLessonPayload;
  onClose: () => void;
  onSave: (data: LessonFormData & { notesFileUrl: string | null }) => void;
  isSaving: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || "",
      youtubeVideoLink: lesson?.youtubeVideoLink || "",
    },
  });

  const [filename, setFilename] = useState<string | null>(
    lesson?.notesFileUrl || null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilename(file.name);
    }
  };

  const onSubmit = (data: LessonFormData) => {
    onSave({ ...data, notesFileUrl: filename });
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
          <label>Supplementary Notes (Optional)</label>
          <div
            className="row card"
            style={{
              padding: "12px 16px",
              background: "var(--brand-gray-light)",
              border: "1px dashed var(--brand-gray)",
            }}
          >
            {filename ? (
              <>
                <FileText size={18} style={{ color: "var(--brand-text-muted)" }} />
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--brand-black)",
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {filename}
                </span>
                <label
                  className="button button-ghost"
                  style={{
                    minHeight: 32,
                    fontSize: 12,
                    padding: "0 12px",
                    cursor: "pointer",
                  }}
                >
                  Change file
                  <input
                    type="file"
                    style={{ display: "none" }}
                    accept=".doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setFilename(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--brand-text-muted)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <FileUp size={18} style={{ color: "var(--brand-text-muted)" }} />
                <span style={{ fontSize: 13, color: "var(--brand-text-muted)", flex: 1 }}>
                  Upload .doc, .docx, .txt
                </span>
                <label
                  className="button button-secondary"
                  style={{
                    minHeight: 32,
                    fontSize: 12,
                    padding: "0 12px",
                    cursor: "pointer",
                  }}
                >
                  Choose file
                  <input
                    type="file"
                    style={{ display: "none" }}
                    accept=".doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div
          className="row"
          style={{ justifyContent: "flex-end", marginTop: 12 }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Lesson"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useState } from "react";
import { useUpdateModule } from "@/hooks/instructor/use-modules";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Video,
  FileText,
} from "lucide-react";
import { Button } from "@/components/academy-ui";
import { toast } from "sonner";
import { LessonFormModal, type LessonFormSaveData } from "./lesson-form-modal";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { QuizFormData, QuizFormModal } from "./quiz-form-modal";
import { ModuleFormModal } from "./module-form-modal";
import {
  InstructorCourseDetail,
  Module,
} from "@/Services/course.service";
import {
  useCreateLesson,
  useDeleteLessonAttachment,
  useModuleLessons,
  useUpdateLesson,
} from "@/hooks/instructor/use-lessons";
import {
  useModuleQuiz,
  useCreateModuleQuiz,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/instructor/use-quizzes";
import type { Quiz } from "@/Services/quiz.service";
import { Lesson } from "@/Services/lesson.service";

export function ModuleList({ course }: { course: InstructorCourseDetail }) {
  return (
    <div className="stack" style={{ gap: 16 }}>
      {course.modules.map((module) => (
        <ModuleItem
          key={module.id}
          courseId={course.id}
          module={module}
          existingModules={course.modules}
        />
      ))}
    </div>
  );
}

function ModuleItem({
  courseId,
  module,
  existingModules,
}: {
  courseId: string;
  module: Module;
  existingModules: Module[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingModule, setEditingModule] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [managingQuiz, setManagingQuiz] = useState(false);

  const updateModule = useUpdateModule();

  const {
    data: lessons = [],
    isLoading: lessonsLoading,
    isError: lessonsError,
  } = useModuleLessons(courseId, module.id);

  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLessonAttachment = useDeleteLessonAttachment();

  const { data: quiz, isLoading: quizLoading } = useModuleQuiz(
    module.id,
    courseId,
  );

  const createModuleQuiz = useCreateModuleQuiz();

  const createQuestion = useCreateQuestion();

  const updateQuestion = useUpdateQuestion();

  const deleteQuestion = useDeleteQuestion();

  const handleSaveLesson = async (data: LessonFormSaveData) => {
    try {
      await createLesson.mutateAsync({
        moduleId: module.id,
        courseId,
        data: {
          youtubeVideoLink: data.youtubeVideoLink,
          notes: data.notes,
          notesFileUrl: data.notesFileUrl,
          attachments: data.attachments,
        },
      });

      setAddingLesson(false);
    } catch (error) {
      console.error("Failed to create lesson:", error);
      toast.error(getApiErrorMessage(error, "Failed to create lesson"));
    }
  };

  const handleEditLesson = async (data: LessonFormSaveData) => {
    if (!editingLesson) return;

    try {
      await updateLesson.mutateAsync({
        lessonId: editingLesson.id,
        courseId: module.courseId,
        moduleId: module.id,
        data: {
          youtubeVideoLink: data.youtubeVideoLink,
          notes: data.notes,
          notesFileUrl: data.notesFileUrl,
          attachments: data.attachments,
        },
      });

      // Removals are applied only once the rest of the edit has saved.
      await Promise.all(
        data.removedAttachmentIds.map((attachmentId) =>
          deleteLessonAttachment.mutateAsync({
            courseId: module.courseId,
            moduleId: module.id,
            lessonId: editingLesson.id,
            attachmentId,
          }),
        ),
      );

      setEditingLesson(null);
    } catch (error) {
      console.error("Failed to update lesson:", error);
      toast.error(getApiErrorMessage(error, "Failed to update lesson"));
    }
  };

  const handleSaveQuiz = async (questions: QuizFormData["questions"]) => {
    let activeQuiz: Quiz;

    /**
     * 1. Create the quiz if it doesn't exist.
     */
    if (!quiz) {
      activeQuiz = await createModuleQuiz.mutateAsync({
        moduleId: module.id,
        courseId: courseId,

        data: {
          type: "MODULE",

          questions: questions.map((question) => ({
            questionText: question.questionText,

            options: question.options,

            correctAnswer: question.options[question.correctOptionIndex],
          })),
        },
      });

      setManagingQuiz(false);

      return;
    }

    activeQuiz = quiz;

    /**
     * IDs currently existing
     * in the backend.
     */
    const existingQuestionIds = new Set(
      activeQuiz.questions.map((question) => question.id),
    );

    /**
     * IDs submitted by the form.
     */
    const submittedQuestionIds = new Set(
      questions
        .filter((question) => question.id)
        .map((question) => question.id),
    );

    /**
     * 2. Delete removed questions.
     */
    const deletedQuestions = activeQuiz.questions.filter(
      (question) => !submittedQuestionIds.has(question.id),
    );

    await Promise.all(
      deletedQuestions.map((question) =>
        deleteQuestion.mutateAsync({
          questionId: question.id,
          context: {
            type: "MODULE",
            moduleId: module.id,
            courseId,
          },
        }),
      ),
    );

    /**
     * 3. Create or update questions.
     */
    await Promise.all(
      questions.map(async (question) => {
        const payload = {
          questionText: question.questionText,

          options: question.options,

          correctAnswer: question.options[question.correctOptionIndex],
        };

        /**
         * Existing question → UPDATE
         */
        if (question.id && existingQuestionIds.has(question.id)) {
          return updateQuestion.mutateAsync({
            questionId: question.id,
            data: payload,
            context: {
              type: "MODULE",
              moduleId: module.id,
              courseId,
            },
          });
        }

        /**
         * New question → CREATE
         */
        return createQuestion.mutateAsync({
          quizId: activeQuiz.id,
          data: payload,
          context: {
            type: "MODULE",
            moduleId: module.id,
            courseId,
          },
        });
      }),
    );

    setManagingQuiz(false);
  };

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div
        className="row"
        style={{
          padding: "16px 20px",
          background: "var(--brand-white)",
          borderBottom: expanded ? "1px solid var(--brand-gray)" : "none",
        }}
      >
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`module-content-${module.id}`}
          onClick={() => setExpanded(!expanded)}
          className="row"
          style={{
            flex: 1,
            background: "none",
            border: "none",
            textAlign: "left",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              color: "var(--brand-text-muted)",
              marginRight: 12,
            }}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
          <div className="module-row-title">
            <span>Module {module.order}</span>
            <strong>{module.title}</strong>
          </div>
        </button>
        <button
          className="button button-ghost"
          onClick={() => setEditingModule(true)}
          aria-label={`Edit Module ${module.order}`}
        >
          Edit
        </button>
      </div>

      {expanded && (
        <div
          id={`module-content-${module.id}`}
          style={{ padding: "24px 20px" }}
        >
          <div className="stack" style={{ gap: 24 }}>
            <div>
              <div
                className="row"
                style={{ justifyContent: "space-between", marginBottom: 12 }}
              >
                <h4 style={{ margin: 0, fontSize: 15, color: "var(--brand-black)" }}>
                  Lesson
                </h4>
                {/* One lesson per module: offer "Add Lesson" only when empty. */}
                {!lessonsLoading && !lessonsError && lessons.length === 0 && (
                  <button
                    className="button button-secondary"
                    onClick={() => setAddingLesson(true)}
                    style={{ minHeight: 32, fontSize: 12, padding: "0 12px" }}
                    data-testid={`button-add-lesson-${module.id}`}
                  >
                    <Plus size={14} style={{ marginRight: 4 }} /> Add Lesson
                  </button>
                )}
              </div>
              {lessonsLoading ? (
                <div
                  style={{
                    padding: 16,
                    background: "var(--brand-gray-light)",
                    borderRadius: 6,
                    color: "var(--brand-text-muted)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Loading lessons...
                </div>
              ) : lessonsError ? (
                <div
                  style={{
                    padding: 16,
                    background: "var(--brand-gray-light)",
                    borderRadius: 6,
                    color: "var(--brand-text-muted)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Failed to load lessons.
                </div>
              ) : lessons.length === 0 ? (
                <div
                  style={{
                    padding: 16,
                    background: "var(--brand-gray-light)",
                    borderRadius: 6,
                    color: "var(--brand-text-muted)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  No lesson yet.
                </div>
              ) : (
                <div className="stack" style={{ gap: 8 }}>
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="row card"
                      style={{
                        padding: "12px 16px",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="row">
                        <Video size={16} style={{ color: "var(--brand-text-muted)" }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          Video lesson
                        </span>
                        {lesson.notes && (
                          <div
                            className="badge badge-muted"
                            style={{ padding: "3px 6px", fontSize: 10 }}
                            data-testid={`badge-notes-${lesson.id}`}
                          >
                            <FileText size={10} style={{ marginRight: 4 }} />{" "}
                            Notes
                          </div>
                        )}
                        {lesson.notesFileUrl && (
                          <div
                            className="badge badge-muted"
                            style={{ padding: "3px 6px", fontSize: 10 }}
                          >
                            <FileText size={10} style={{ marginRight: 4 }} />{" "}
                            {lesson.notesFileUrl}
                          </div>
                        )}
                        {lesson.attachments?.length > 0 && (
                          <div
                            className="badge badge-muted"
                            style={{ padding: "3px 6px", fontSize: 10 }}
                            data-testid={`badge-attachments-${lesson.id}`}
                          >
                            <FileText size={10} style={{ marginRight: 4 }} />{" "}
                            {lesson.attachments.length}{" "}
                            {lesson.attachments.length === 1 ? "file" : "files"}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        style={{ width: 32, height: 32 }}
                        onClick={() => setEditingLesson(lesson)}
                        aria-label={`Edit the lesson for ${module.title}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--brand-gray)", paddingTop: 20 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: 15,
                      color: "var(--brand-black)",
                      marginBottom: 4,
                    }}
                  >
                    Module Quiz
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--brand-text-muted)" }}>
                    {quizLoading
                      ? "Loading quiz..."
                      : `${quiz?.questions.length ?? 0} questions configured.`}{" "}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setManagingQuiz(true)}>
                  Manage Quiz Questions
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingModule && (
        <ModuleFormModal
          module={module}
          existingModules={existingModules}
          onClose={() => setEditingModule(false)}
          onSave={async (data) => {
            try {
              await updateModule.mutateAsync({
                moduleId: module.id,
                data: {
                  title: data.title,
                  order: data.order,
                },
              });

              setEditingModule(false);
            } catch (error) {
              console.error("Failed to update module:", error);
            }
          }}
        />
      )}

      {(addingLesson || editingLesson) && (
        <LessonFormModal
          courseId={courseId}
          lesson={editingLesson || undefined}
          onClose={() => {
            setAddingLesson(false);
            setEditingLesson(null);
          }}
          onSave={async (data) => {
            if (editingLesson) {
              await handleEditLesson(data);
            } else {
              await handleSaveLesson(data);
            }
          }}
          isSaving={
            createLesson.isPending ||
            updateLesson.isPending ||
            deleteLessonAttachment.isPending
          }
        />
      )}

      {managingQuiz && (
        <QuizFormModal
          title={`Quiz: ${module.title}`}
          quiz={quiz}
          onClose={() => setManagingQuiz(false)}
          onSave={handleSaveQuiz}
        />
      )}
    </div>
  );
}

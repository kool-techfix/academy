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
import { LessonFormModal } from "./lesson-form-modal";
import { QuizFormData, QuizFormModal } from "./quiz-form-modal";
import { ModuleFormModal } from "./module-form-modal";
import {
  InstructorCourseDetail,
  Lesson,
  Module,
} from "@/Services/course.service";
import {
  useCreateLesson,
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

export function ModuleList({ course }: { course: InstructorCourseDetail }) {
  return (
    <div className="stack" style={{ gap: 16 }}>
      {course.modules.map((module) => (
        <ModuleItem
          key={module.id}
          module={module}
          existingModules={course.modules}
        />
      ))}
    </div>
  );
}

function ModuleItem({
  module,
  existingModules,
}: {
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
  } = useModuleLessons(module.id);

  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();

  const { data: quiz, isLoading: quizLoading } = useModuleQuiz(module.id);

  const createModuleQuiz = useCreateModuleQuiz();

  const createQuestion = useCreateQuestion();

  const updateQuestion = useUpdateQuestion();

  const deleteQuestion = useDeleteQuestion();

  const handleSaveLesson = async (data: {
    title: string;
    youtubeVideoId: string;
    notesFileUrl?: string | null;
    order?: number;
  }) => {
    try {
      await createLesson.mutateAsync({
        moduleId: module.id,
        data: {
          title: data.title,
          youtubeVideoId: data.youtubeVideoId,
          notesFileUrl: data.notesFileUrl ?? null,
          order: data.order,
        },
      });

      setAddingLesson(false);
    } catch (error) {
      console.error("Failed to create lesson:", error);
    }
  };

  const handleEditLesson = async (data: {
    title: string;
    youtubeVideoId: string;
    notesFileUrl?: string | null;
    order?: number;
  }) => {
    if (!editingLesson) return;

    try {
      await updateLesson.mutateAsync({
        lessonId: editingLesson.id,
        data: {
          title: data.title,
          youtubeVideoId: data.youtubeVideoId,
          notesFileUrl: data.notesFileUrl ?? null,
          order: data.order,
        },
      });

      setEditingLesson(null);
    } catch (error) {
      console.error("Failed to update lesson:", error);
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
        deleteQuestion.mutateAsync(question.id),
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
          });
        }

        /**
         * New question → CREATE
         */
        return createQuestion.mutateAsync({
          quizId: activeQuiz.id,
          data: payload,
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
          background: "#faf9f5",
          borderBottom: expanded ? "1px solid #ece9e1" : "none",
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
              color: "#68675f",
              marginRight: 12,
            }}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 700, color: "#77766f", fontSize: 13 }}>
              Module {module.order}
            </span>
            <strong style={{ fontSize: 16, color: "#2e2e2c" }}>
              {module.title}
            </strong>
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
                <h4 style={{ margin: 0, fontSize: 15, color: "#484741" }}>
                  Lessons
                </h4>
                <button
                  className="button button-secondary"
                  onClick={() => setAddingLesson(true)}
                  style={{ minHeight: 32, fontSize: 12, padding: "0 12px" }}
                >
                  <Plus size={14} style={{ marginRight: 4 }} /> Add Lesson
                </button>
              </div>
              {lessonsLoading ? (
                <div
                  style={{
                    padding: 16,
                    background: "#f5f4ef",
                    borderRadius: 6,
                    color: "#77766f",
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
                    background: "#f5f4ef",
                    borderRadius: 6,
                    color: "#77766f",
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
                    background: "#f5f4ef",
                    borderRadius: 6,
                    color: "#77766f",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  No lessons in this module.
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
                        <Video size={16} color="#8a887e" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          {lesson.title}
                        </span>
                        {lesson.notesFileUrl && (
                          <div
                            className="badge badge-muted"
                            style={{ padding: "3px 6px", fontSize: 10 }}
                          >
                            <FileText size={10} style={{ marginRight: 4 }} />{" "}
                            {lesson.notesFileUrl}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        style={{ width: 32, height: 32 }}
                        onClick={() => setEditingLesson(lesson)}
                        aria-label={`Edit lesson: ${lesson.title}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid #ece9e1", paddingTop: 20 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: 15,
                      color: "#484741",
                      marginBottom: 4,
                    }}
                  >
                    Module Quiz
                  </h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#85827a" }}>
                    {quizLoading
                      ? "Loading quiz..."
                      : `${quiz?.questions.length ?? 0} questions configured.`}{" "}
                    questions configured.
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

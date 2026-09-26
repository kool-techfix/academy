"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { BookOpen, FileText, PlayCircle } from "lucide-react";

import {
  AdminBackLink,
  AdminEmptyState,
  AdminLoading,
  AdminNotice,
  formatDate,
} from "@/components/admin/admin-page-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";
import {
  useAdminCourse,
  useFlagCourse,
  useRemoveCourse,
  useRestoreCourse,
} from "@/hooks/admin/use-admin-courses";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { AdminQuiz } from "@/Services/admin.service";

type Action = "flag" | "remove" | "restore";

/** Instructor-supplied links are only rendered if they are http(s). */
function safeUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function QuizReview({ title, quiz }: { title: string; quiz: AdminQuiz | null }) {
  if (!quiz) {
    return (
      <div className="admin-quiz">
        <h4>{title}</h4>
        <span className="admin-sub">No quiz added.</span>
      </div>
    );
  }

  return (
    <div className="admin-quiz">
      <h4>
        {title} · {quiz.questions.length}{" "}
        {quiz.questions.length === 1 ? "question" : "questions"} · pass {quiz.passScore}%
      </h4>
      {quiz.questions.length === 0 && (
        <span className="admin-sub">This quiz has no questions yet.</span>
      )}
      {quiz.questions.map((question, index) => (
        <div key={question.id} className="admin-question">
          <strong>
            {index + 1}. {question.questionText}
          </strong>
          <ol type="A">
            {(Array.isArray(question.options) ? question.options : []).map((option, optionIndex) => (
              <li
                key={optionIndex}
                className={option === question.correctAnswer ? "correct" : ""}
              >
                {option}
                {option === question.correctAnswer && " ✓"}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default function AdminCourseReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [action, setAction] = useState<Action | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: course, isLoading, isError, error } = useAdminCourse(id);
  const flag = useFlagCourse();
  const remove = useRemoveCourse();
  const restore = useRestoreCourse();

  const mutation = action === "flag" ? flag : action === "remove" ? remove : restore;

  const closeDialog = () => {
    flag.reset();
    remove.reset();
    restore.reset();
    setAction(null);
  };

  const runAction = async (reason?: string) => {
    if (action === "flag" && reason) {
      await flag.mutateAsync({ id, reason });
      setNotice("Course flagged. It stays available until you remove it.");
    } else if (action === "remove" && reason) {
      await remove.mutateAsync({ id, reason });
      setNotice("Course removed. New learners can no longer find or enroll in it.");
    } else if (action === "restore") {
      await restore.mutateAsync(id);
      setNotice("Moderation cleared. The course is back to normal.");
    }
    closeDialog();
  };

  if (isLoading) {
    return (
      <Page>
        <AdminBackLink href="/admin/courses" label="All courses" />
        <AdminLoading message="Loading course..." />
      </Page>
    );
  }

  if (isError || !course) {
    return (
      <Page>
        <AdminBackLink href="/admin/courses" label="All courses" />
        <AdminEmptyState
          icon={<BookOpen size={24} />}
          title="Unable to load course"
          message={getApiErrorMessage(error, "Course not found")}
        />
      </Page>
    );
  }

  const lessonCount = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  return (
    <Page>
      <AdminBackLink href="/admin/courses" label="All courses" />

      <div className="page-head">
        <div>
          <span className="eyebrow">Course review</span>
          <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>{course.title}</h1>
          <p>{course.description}</p>
        </div>
      </div>

      {notice && <AdminNotice message={notice} onDismiss={() => setNotice(null)} />}

      <div className="admin-review-layout">
        <div>
          <div className="section-head">
            <h2>Modules</h2>
            <span className="admin-sub">
              {course.modules.length} modules · {lessonCount} lessons
            </span>
          </div>

          {course.modules.length === 0 && (
            <AdminEmptyState
              icon={<BookOpen size={24} />}
              title="No modules"
              message="This course has no modules yet."
            />
          )}

          {course.modules.map((module) => (
            <section key={module.id} className="card admin-review-module">
              <span className="eyebrow">Module {module.order}</span>
              <h3>{module.title}</h3>

              {module.lessons.length === 0 && (
                <span className="admin-sub">No lessons in this module.</span>
              )}

              {module.lessons.map((lesson) => {
                const videoUrl = safeUrl(lesson.youtubeVideoLink);
                const notesUrl = safeUrl(lesson.notesFileUrl);

                return (
                  <div key={lesson.id} className="admin-lesson">
                    <span>
                      {lesson.order}. {lesson.title}
                    </span>
                    <span className="admin-lesson-links">
                      {videoUrl ? (
                        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                          <PlayCircle size={14} /> Video
                        </a>
                      ) : (
                        <span className="admin-sub">No valid video</span>
                      )}
                      {notesUrl ? (
                        <a href={notesUrl} target="_blank" rel="noopener noreferrer">
                          <FileText size={14} /> Notes
                        </a>
                      ) : (
                        <span className="admin-sub">No notes</span>
                      )}
                    </span>
                  </div>
                );
              })}

              <QuizReview title="Module quiz" quiz={module.quiz} />
            </section>
          ))}

          <div className="section-head" style={{ marginTop: 32 }}>
            <h2>Final assessment</h2>
          </div>
          <section className="card admin-review-module">
            <QuizReview title="Final assessment" quiz={course.finalQuiz} />
          </section>
        </div>

        <aside className="card side-card">
          <h3>Moderation</h3>

          <div className="stack" style={{ gap: 12, marginBottom: 20, fontSize: 14 }}>
            <div className="row" style={{ justifyContent: "space-between", background: "none" }}>
              <span className="admin-sub">Status</span>
              <StatusBadge status={course.status} />
            </div>
            <div className="row" style={{ justifyContent: "space-between", background: "none" }}>
              <span className="admin-sub">Moderation</span>
              {course.moderationStatus === "NONE" ? (
                <span className="admin-sub">None</span>
              ) : (
                <StatusBadge status={course.moderationStatus} />
              )}
            </div>
            {course.moderationReason && (
              <span className="admin-reason" style={{ maxWidth: "none" }}>
                {course.moderationReason}
                {course.moderatedAt && ` (${formatDate(course.moderatedAt)})`}
              </span>
            )}
            <div className="row" style={{ justifyContent: "space-between", background: "none" }}>
              <span className="admin-sub">Instructor</span>
              <span style={{ textAlign: "right" }}>
                {course.instructors.map((instructor) => (
                  <span key={instructor.id} style={{ display: "block" }}>
                    {instructor.name}
                    <span className="admin-sub">{instructor.email}</span>
                  </span>
                ))}
              </span>
            </div>
            <div className="row" style={{ justifyContent: "space-between", background: "none" }}>
              <span className="admin-sub">Learners enrolled</span>
              <span>{course._count.enrollments}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between", background: "none" }}>
              <span className="admin-sub">Created</span>
              <span>{formatDate(course.createdAt)}</span>
            </div>
          </div>

          <div className="admin-side-actions">
            {course.moderationStatus === "NONE" && (
              <Button variant="ghost" onClick={() => setAction("flag")} testId="button-flag-course">
                Flag course
              </Button>
            )}
            {course.moderationStatus !== "REMOVED" && (
              <Button
                variant="secondary"
                onClick={() => setAction("remove")}
                testId="button-remove-course"
              >
                Remove course
              </Button>
            )}
            {course.moderationStatus !== "NONE" && (
              <Button onClick={() => setAction("restore")} testId="button-restore-course">
                {course.moderationStatus === "FLAGGED" ? "Clear flag" : "Restore course"}
              </Button>
            )}
          </div>
        </aside>
      </div>

      {action === "flag" && (
        <ReasonDialog
          title="Flag course"
          description={`Flag "${course.title}" as possibly violating platform requirements? It stays available to learners until it is removed.`}
          confirmLabel="Flag course"
          isPending={mutation.isPending}
          error={mutation.isError ? getApiErrorMessage(mutation.error) : null}
          onCancel={closeDialog}
          onConfirm={(reason) => runAction(reason).catch(() => {})}
        />
      )}

      {action === "remove" && (
        <ReasonDialog
          title="Remove course?"
          description={`"${course.title}" will be hidden from the catalog and closed to new enrollments. Learners who are already enrolled keep their access and progress.`}
          confirmLabel="Remove course"
          isPending={mutation.isPending}
          error={mutation.isError ? getApiErrorMessage(mutation.error) : null}
          onCancel={closeDialog}
          onConfirm={(reason) => runAction(reason).catch(() => {})}
        />
      )}

      {action === "restore" && (
        <ConfirmDialog
          title={course.moderationStatus === "FLAGGED" ? "Clear flag" : "Restore course"}
          description={
            course.moderationStatus === "FLAGGED"
              ? `Clear the flag on "${course.title}"?`
              : `Restore "${course.title}"? If it is published, it will appear in the catalog again.`
          }
          confirmLabel={course.moderationStatus === "FLAGGED" ? "Clear flag" : "Restore"}
          isPending={mutation.isPending}
          error={mutation.isError ? getApiErrorMessage(mutation.error) : null}
          onCancel={closeDialog}
          onConfirm={() => runAction().catch(() => {})}
        />
      )}
    </Page>
  );
}

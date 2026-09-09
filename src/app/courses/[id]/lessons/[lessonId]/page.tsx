"use client";

import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  LockKeyhole,
  Play,
} from "lucide-react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";

import { usePublicCourse } from "@/hooks/use-public-courses";
import { useLearnerLesson } from "@/hooks/learner/use-lesson";
import {
  useCompleteLesson,
  useLearnerCourseProgress,
} from "@/hooks/learner/use-progress";

export default function LessonViewer() {
  const { id, lessonId } = useParams<{
    id: string;
    lessonId: string;
  }>();

  const [downloaded, setDownloaded] = useState(false);

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = usePublicCourse(id);

  const {
    data: lesson,
    isLoading: lessonLoading,
    isError: lessonError,
  } = useLearnerLesson(lessonId);

  const {
    data: progress,
    isLoading: progressLoading,
  } = useLearnerCourseProgress(id);

  const completeLesson = useCompleteLesson(id);

  const isLoading =
    courseLoading ||
    lessonLoading ||
    progressLoading;

  if (isLoading) {
    return (
      <Page>
        <div className="lesson-copy">
          <p>Loading lesson...</p>
        </div>
      </Page>
    );
  }

  if (
    courseError ||
    lessonError ||
    !course ||
    !lesson
  ) {
    return (
      <Page>
        <div className="lesson-copy">
          <h1>Unable to load lesson</h1>
          <p>
            The lesson could not be loaded. It may no
            longer be available or you may not have
            access to it.
          </p>

          <Link
            href={`/courses/${id}`}
            className="button button-primary"
          >
            <ArrowLeft size={15} />
            Back to course
          </Link>
        </div>
      </Page>
    );
  }

  const currentModule = course.modules.find(
    (module) => module.id === lesson.module.id,
  );

  const lessons = currentModule?.lessons ?? [];

  const lessonIndex = lessons.findIndex(
    (item) => item.id === lesson.id,
  );

  const currentLessonIndex =
    lessonIndex >= 0 ? lessonIndex : 0;

  const previousLesson =
    lessons[currentLessonIndex - 1];

  const nextLesson =
    lessons[currentLessonIndex + 1];

  const completedLessonIds =
    progress?.completedLessonIds ?? [];

  const isCompleted =
    completedLessonIds.includes(lesson.id);

  const handleComplete = () => {
    if (isCompleted || completeLesson.isPending) {
      return;
    }

    completeLesson.mutate(lesson.id);
  };

  const handleDownloadNotes = () => {
    if (!lesson.notesFileUrl) {
      return;
    }

    window.open(
      lesson.notesFileUrl,
      "_blank",
      "noopener,noreferrer",
    );

    setDownloaded(true);
  };

  return (
    <Page>
      <Link
        href={`/courses/${course.id}`}
        className="row"
        style={{
          color: "#77766f",
          fontSize: 13,
          marginBottom: 22,
        }}
        data-testid="link-back-course"
      >
        <ArrowLeft size={15} />
        {course.title}
      </Link>

      <div className="lesson-layout">
        <section>
          <div
            className="video-frame"
            data-testid="video-player"
          >
            <iframe
              src={lesson.youtubeVideoLink}
              title={`${lesson.title} lesson video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <div className="lesson-copy">
            <span className="eyebrow">
              Lesson {currentLessonIndex + 1} of{" "}
              {lessons.length}
            </span>

            <h1 style={{ marginTop: 10 }}>
              {lesson.title}
            </h1>

            <p>
              Work through the lesson carefully,
              follow the examples, and test what you
              learn as you go.
            </p>

            <div className="card notes">
              <div className="section-head">
                <h3>
                  <FileText
                    size={18}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 7,
                    }}
                  />
                  Lecture notes
                </h3>

                {lesson.notesFileUrl ? (
                  <Button
                    variant="ghost"
                    onClick={handleDownloadNotes}
                    testId="button-download-notes"
                  >
                    <Download size={15} />

                    {downloaded
                      ? "Opened"
                      : "Download notes"}
                  </Button>
                ) : (
                  <span
                    className="eyebrow"
                    style={{ color: "#77766f" }}
                  >
                    No notes available
                  </span>
                )}
              </div>
            </div>

            <div className="card">
              <div className="section-head">
                <h3>Lesson progress</h3>

                {isCompleted && (
                  <span
                    className="eyebrow"
                    style={{ color: "#696b39" }}
                  >
                    Completed
                  </span>
                )}
              </div>

              <Button
                variant={
                  isCompleted
                    ? "ghost"
                    : "primary"
                }
                onClick={handleComplete}
                disabled={
                  isCompleted ||
                  completeLesson.isPending
                }
                testId="button-complete-lesson"
              >
                <Check size={15} />

                {completeLesson.isPending
                  ? "Saving..."
                  : isCompleted
                    ? "Lesson completed"
                    : "Mark as complete"}
              </Button>
            </div>

            <div className="lesson-nav">
              {previousLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${previousLesson.id}`}
                  className="button button-ghost"
                  data-testid="link-previous-lesson"
                >
                  <ArrowLeft size={15} />
                  Previous
                </Link>
              ) : (
                <span />
              )}

              {nextLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                  className="button button-primary"
                  data-testid="link-next-lesson"
                >
                  Next lesson
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <Link
                  href={`/courses/${course.id}/quiz`}
                  className="button button-primary"
                  data-testid="link-course-quiz"
                >
                  Take the quiz
                  <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </section>

        <aside className="card lesson-side">
          <h3>In this course</h3>

          {course.modules.map((module) => {
            const moduleLessons =
              module.lessons;

            return (
              <div key={module.id}>
                <div
                  className="eyebrow"
                  style={{
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                  {module.title}
                </div>

                {moduleLessons.map(
                  (moduleLesson) => {
                    const completed =
                      completedLessonIds.includes(
                        moduleLesson.id,
                      );

                    const active =
                      moduleLesson.id ===
                      lesson.id;

                    return (
                      <Link
                        href={`/courses/${course.id}/lessons/${moduleLesson.id}`}
                        key={moduleLesson.id}
                        className={`lesson-side-row ${
                          active ? "active" : ""
                        }`}
                        data-testid={`link-lesson-sidebar-${moduleLesson.id}`}
                      >
                        {completed ? (
                          <Check size={14} />
                        ) : (
                          <Play size={14} />
                        )}

                        <span>
                          {moduleLesson.title}
                        </span>
                      </Link>
                    );
                  },
                )}
              </div>
            );
          })}
        </aside>
      </div>
    </Page>
  );
}
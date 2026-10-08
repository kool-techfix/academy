/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { LoadingScreen } from "@/components/Loader";

import { downloadTextFile, slugify } from "@/lib/downloads";
import { getYouTubeEmbedUrl } from "@/lib/getUrl";

import { useLearnerLesson } from "@/hooks/learner/use-lesson";
import { useAttachmentDownload } from "@/hooks/learner/use-attachment-download";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  formatFileSize,
  getAttachmentExtension,
} from "@/lib/storage/constants";
import type { LearnerLessonAttachment } from "@/Services/learner-lesson.service";
import { useLearnerCourseProgress } from "@/hooks/learner/use-progress";
import { useLearnerCourse } from "@/hooks/learner/use-course";

export default function LessonViewer() {
  const { id, lessonId } = useParams<{
    id: string;
    lessonId: string;
  }>();

  const { data: lesson, isLoading, isError } = useLearnerLesson(lessonId);

  const {
    data: course,
    isLoading: courseLoading,
    isError: courseError,
  } = useLearnerCourse(id);

  const { data: progress } = useLearnerCourseProgress(id);

  const [downloaded, setDownloaded] = useState(false);

  if (isLoading || courseLoading) {
    return (
      <Page>
        <LoadingScreen message="Loading lesson..." />
      </Page>
    );
  }

  if (isError || !lesson || courseError || !course) {
    return (
      <Page>
        <p>Unable to load this lesson.</p>
      </Page>
    );
  }

  const currentModuleIndex = course.modules.findIndex(
    (module) => module.id === lesson.module.id,
  );

  const currentModule = course.modules[currentModuleIndex];

  if (!currentModule) {
    return (
      <Page>
        <p>Unable to determine the current module.</p>
      </Page>
    );
  }

  const currentLessonIndex = currentModule.lessons.findIndex(
    (currentLesson) => currentLesson.id === lesson.id,
  );

  const currentModuleCompleted =
    progress?.completedModuleIds.includes(currentModule.id) ?? false;

  const previousLesson =
    currentLessonIndex > 0
      ? currentModule.lessons[currentLessonIndex - 1]
      : null;

  const nextLesson =
    currentLessonIndex < currentModule.lessons.length - 1
      ? currentModule.lessons[currentLessonIndex + 1]
      : null;

  const nextModule =
    currentModuleIndex < course.modules.length - 1
      ? course.modules[currentModuleIndex + 1]
      : null;

  const previousModule =
    currentModuleIndex > 0 ? course.modules[currentModuleIndex - 1] : null;

  const previousModuleLesson =
    previousModule?.lessons[previousModule.lessons.length - 1] ?? null;

  const nextModuleLesson = nextModule?.lessons[0] ?? null;

  const isLastLessonInModule = !nextLesson;

  const hasNextModule = Boolean(nextModuleLesson);

  const canTakeQuiz =
    isLastLessonInModule &&
    !currentModuleCompleted &&
    Boolean(currentModule.quiz);

  const canGoToNextModule =
    isLastLessonInModule && currentModuleCompleted && Boolean(nextModuleLesson);

  const courseId = lesson.module.courseId;
  const courseTitle = lesson.module.course.title;

  const downloadNotes = () => {
    downloadTextFile(
      `${slugify(lesson.title)}-notes.txt`,
      `${lesson.title}\n\nField notes from KoolTech Fix IT Academy.\n\nRemember: name the symptom, test one thing, record what changed.`,
    );

    setDownloaded(true);
  };

  const videoEmbedUrl = getYouTubeEmbedUrl(lesson.youtubeVideoLink);

  return (
    <Page>
      <Link
        href={`/courses/${courseId}`}
        className="row"
        style={{
          color: "var(--brand-text-muted)",
          fontSize: 13,
          marginBottom: 22,
        }}
        data-testid="link-back-course"
      >
        <ArrowLeft size={15} />
        {courseTitle}
      </Link>

      <div className="lesson-layout">
        <section>
          <div className="video-frame" data-testid="video-player">
            {videoEmbedUrl ? (
              <iframe
                src={videoEmbedUrl}
                title={`${lesson.module.title} lesson video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <p>Unable to load this lesson video.</p>
            )}
          </div>

          <div className="lesson-copy">
            <span className="eyebrow">Module {currentModuleIndex + 1}</span>

            {/* One lesson per module, so the lesson is named by its module. */}
            <h1 style={{ marginTop: 10 }}>{lesson.module.title}</h1>

            {lesson.notes && (
              <section
                className="card notes lesson-notes"
                data-testid="card-lecture-notes"
              >
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

                <div className="lesson-notes-text">{lesson.notes}</div>
              </section>
            )}

            {lesson.notesFileUrl && (
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

                  <a
                    href={lesson.notesFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-ghost"
                    data-testid="button-download-notes"
                    onClick={() => setDownloaded(true)}
                  >
                    <Download size={15} />
                    {downloaded ? "Downloaded" : "Download notes"}
                  </a>
                </div>
              </div>
            )}

            {lesson.attachments.length > 0 && (
              <LessonAttachments attachments={lesson.attachments} />
            )}

            <div className="lesson-nav">
              {previousLesson ? (
                <Link
                  href={`/courses/${courseId}/lessons/${previousLesson.id}`}
                  className="button button-ghost"
                  data-testid="link-previous-lesson"
                >
                  <ArrowLeft size={15} />
                  Previous
                </Link>
              ) : previousModuleLesson ? (
                <Link
                  href={`/courses/${courseId}/lessons/${previousModuleLesson.id}`}
                  className="button button-ghost"
                  data-testid="link-previous-lesson"
                >
                  <ArrowLeft size={15} />
                  Previous
                </Link>
              ) : (
                <span />
              )}

              {canTakeQuiz ? (
                <Link
                  href={`/courses/${courseId}/modules/${currentModule.id}/quiz`}
                  className="button button-primary"
                  data-testid="link-course-quiz"
                >
                  Take the Quiz
                  <ArrowRight size={15} />
                </Link>
              ) : nextLesson ? (
                <Link
                  href={`/courses/${courseId}/lessons/${nextLesson.id}`}
                  className="button button-primary"
                  data-testid="link-next-lesson"
                >
                  Next
                  <ArrowRight size={15} />
                </Link>
              ) : canGoToNextModule ? (
                <Link
                  href={`/courses/${courseId}/lessons/${nextModuleLesson!.id}`}
                  className="button button-primary"
                  data-testid="link-next-module"
                >
                  Next
                  <ArrowRight size={15} />
                </Link>
              ) : currentModuleCompleted && !hasNextModule ? (
                <Link
                  href={`/courses/${courseId}`}
                  className="button button-primary"
                  data-testid="link-course-complete"
                >
                  Back to course
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </section>

        <aside className="card lesson-side">
          <h3>In this course</h3>

          {course.modules.map((module, index) => {
            const moduleCompleted =
              progress?.completedModuleIds.includes(module.id) ?? false;

            const isCurrentModule = index === currentModuleIndex;

            const isModuleUnlocked =
              index === 0 ||
              progress?.completedModuleIds.includes(
                course.modules[index - 1].id,
              ) === true;

            const moduleLesson = module.lessons[0];

            if (!isModuleUnlocked || !moduleLesson) {
              return (
                <div
                  key={module.id}
                  className="lesson-side-row w-full"
                  data-testid={`link-lesson-sidebar-${module.id}`}
                >
                  <LockKeyhole size={14} />

                  <span>
                    {index + 1}. {module.title}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={module.id}
                href={`/courses/${courseId}/lessons/${moduleLesson.id}`}
                className={`lesson-side-row w-full ${
                  isCurrentModule ? "active" : ""
                }`}
                data-testid={`link-lesson-sidebar-${module.id}`}
              >
                {moduleCompleted ? (
                  <Check size={14} />
                ) : isCurrentModule ? (
                  <Play size={14} />
                ) : (
                  <Play size={14} />
                )}

                <span>
                  {index + 1}. {module.title}
                </span>
              </Link>
            );
          })}
        </aside>
      </div>
    </Page>
  );
}

function LessonAttachments({
  attachments,
}: {
  attachments: LearnerLessonAttachment[];
}) {
  const download = useAttachmentDownload();

  return (
    <div className="card notes" data-testid="card-lesson-attachments">
      <h3>
        <FileText
          size={18}
          style={{
            verticalAlign: "middle",
            marginRight: 7,
          }}
        />
        Attachments
      </h3>

      <ul className="attachment-list">
        {attachments.map((attachment) => {
          const isDownloading =
            download.isPending && download.variables === attachment.id;

          return (
            <li
              key={attachment.id}
              className="attachment-row"
              data-testid={`row-attachment-${attachment.id}`}
            >
              <span className="badge badge-muted attachment-type">
                {getAttachmentExtension(attachment.originalName)?.toUpperCase() ??
                  "FILE"}
              </span>
              <div className="attachment-info">
                <span className="attachment-name">{attachment.originalName}</span>
                <span className="attachment-meta">
                  {formatFileSize(attachment.size)}
                </span>
              </div>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => download.mutate(attachment.id)}
                disabled={isDownloading}
                data-testid={`button-download-attachment-${attachment.id}`}
              >
                <Download size={15} />
                {isDownloading ? "Preparing..." : "Download"}
              </button>
            </li>
          );
        })}
      </ul>

      {download.isError && (
        <div className="form-error" role="alert">
          {getApiErrorMessage(download.error, "Unable to download this file.")}
        </div>
      )}
    </div>
  );
}

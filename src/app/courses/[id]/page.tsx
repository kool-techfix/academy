"use client";

import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";

import { Badge, Button, ProgressBar } from "@/components/academy-ui";

import { Page } from "@/components/page-shell";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useLearnerCourse } from "@/hooks/learner/use-course";
import { useLearnerEnrollments } from "@/hooks/learner/use-enrollments";
import { useLearnerCourseProgress } from "@/hooks/learner/use-progress";
import { LoadingScreen } from "@/components/Loader";
import { CourseEnrollOverview } from "@/components/learner/course-enroll-overview";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();

  // The learner course/progress endpoints are enrollment-only (403
  // otherwise), so check enrollment first and show the overview if needed.
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useLearnerEnrollments();

  const isEnrolled =
    enrollments?.some((enrollment) => enrollment.courseId === id) ?? false;

  const { data: course, isLoading, isError } = useLearnerCourse(id, isEnrolled);

  const {
    data: progress,
    isLoading: progressLoading,
    isError: progressError,
  } = useLearnerCourseProgress(id, isEnrolled);

  const [saved, setSaved] = useState(false);

  if (enrollmentsLoading) {
    return (
      <Page>
        <LoadingScreen message="Loading course..." />
      </Page>
    );
  }

  if (enrollments && !isEnrolled) {
    return <CourseEnrollOverview courseId={id} />;
  }

  if (isLoading || progressLoading) {
    return (
      <Page>
        <LoadingScreen message="Loading course..." />
      </Page>
    );
  }

  if (isError || !course || progressError || !progress) {
    return (
      <Page>
        <p>Unable to load this course.</p>
      </Page>
    );
  }

  const completedModuleIds = progress.completedModuleIds;

  /*
   * Find the first module that:
   * - has not been completed
   * - is currently unlocked
   * - has at least one lesson
   */
  const nextModuleIndex = course.modules.findIndex(
    (module) => !completedModuleIds.includes(module.id),
  );

  const nextModule =
    nextModuleIndex >= 0 ? course.modules[nextModuleIndex] : null;

  const nextLesson = nextModule?.lessons[0] ?? null;

  const allModulesCompleted =
    course.modules.length > 0 &&
    course.modules.every((module) => completedModuleIds.includes(module.id));

  return (
    <Page>
      <Link
        href="/courses"
        className="row"
        style={{
          color: "var(--brand-text-muted)",
          fontSize: 13,
          marginBottom: 22,
        }}
        data-testid="link-back-catalog"
      >
        <ArrowLeft size={15} />
        Back to catalog
      </Link>

      <section className="detail-hero">
        <div className="detail-hero-copy">
          {/*
          <Badge
            tone={
              course.status === "complete"
                ? "coral"
                : "default"
            }
          >
            {course.category}
          </Badge>
          */}

          <h1 style={{ marginTop: 16 }}>{course.title}</h1>

          <p>{course.description}</p>

          {/*
          <div className="meta-row">
            <span>
              <Clock3 size={15} />
              {course.duration}
            </span>

            <span>
              <BookOpen size={15} />
              {course.moduleCount} modules
            </span>

            <span>
              <Users size={15} />
              {course.level}
            </span>
          </div>
          */}

          <div className="row" style={{ marginTop: 28 }}>
            {nextLesson ? (
              <Link
                href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                className="button button-primary"
                data-testid="link-course-primary-action"
              >
                {progress.completedModules > 0
                  ? "Continue learning"
                  : "Start course"}
                <ArrowRight size={16} />
              </Link>
            ) : allModulesCompleted && progress.certificateEligible ? (
              <Link
                href={`/courses/${course.id}/certificate`}
                className="button button-primary"
                data-testid="link-course-primary-action"
              >
                View your certificate
                <ArrowRight size={16} />
              </Link>
            ) : allModulesCompleted && progress.finalQuiz.exists ? (
              <Link
                href={`/courses/${course.id}/quiz`}
                className="button button-primary"
                data-testid="link-course-primary-action"
              >
                {progress.finalQuiz.attempted
                  ? "Retake the final assessment"
                  : "Take the final assessment"}
                <ArrowRight size={16} />
              </Link>
            ) : allModulesCompleted ? (
              <span
                className="button button-primary"
                aria-disabled="true"
                data-testid="link-course-primary-action"
              >
                Final assessment coming soon
              </span>
            ) : (
              <span
                className="button button-primary"
                data-testid="link-course-primary-action"
              >
                Course unavailable
              </span>
            )}

            <Button
              variant="ghost"
              onClick={() => setSaved(!saved)}
              testId="button-save-course"
            >
              {saved ? "Saved" : "Save for later"}
            </Button>
          </div>
        </div>

        <div className="detail-art">
          <span className="eyebrow">Kool TechFix I.T Academy</span>

          <span className="course-number">
            {course.modules.length}
            <span className="course-number-label">
              {course.modules.length === 1 ? "Module" : "Modules"}
            </span>
          </span>

          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {course.authors.length > 0
              ? `Taught by ${course.authors
                  .map((author) => author.name)
                  .join(", ")}`
              : "Kool TechFix I.T Academy"}
          </span>
        </div>
      </section>

      <div className="module-layout">
        <section className="card">
          <div className="panel" style={{ paddingBottom: 12 }}>
            <div className="section-head">
              <h2>Course modules</h2>

              <Badge tone="muted">
                {progress.completedModules}/{progress.totalModules} completed
              </Badge>
            </div>

            {progress.percentage > 0 && (
              <ProgressBar
                value={progress.percentage}
                label="Course progress"
              />
            )}
          </div>

          <div className="module-list">
            {course.modules.map((module, index) => {
              const isModuleCompleted = completedModuleIds.includes(module.id);

              const isNextModule = index === nextModuleIndex;

              const firstLesson = module.lessons[0];

              return (
                <div
                  className="module-row"
                  key={module.id}
                  data-testid={`module-row-${module.id}`}
                >
                  <div
                    className={`module-status ${
                      isModuleCompleted ? "complete" : ""
                    }`}
                  >
                    {isModuleCompleted ? (
                      <Check size={15} />
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                        }}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4>{module.title}</h4>

                    <p>
                      Module {index + 1} · {module.lessons.length}{" "}
                      {module.lessons.length === 1 ? "lesson" : "lessons"}
                    </p>
                  </div>

                  {isModuleCompleted ? (
                    firstLesson ? (
                      <Link
                        href={`/courses/${course.id}/lessons/${firstLesson.id}`}
                        className="button button-ghost module-action"
                        data-testid={`link-module-${module.id}`}
                      >
                        Review
                        <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <span
                        className="button button-ghost module-action"
                        aria-disabled="true"
                        data-testid={`module-review-unavailable-${module.id}`}
                      >
                        Review
                      </span>
                    )
                  ) : isNextModule ? (
                    firstLesson ? (
                      <Link
                        href={`/courses/${course.id}/lessons/${firstLesson.id}`}
                        className="button button-ghost module-action"
                        data-testid={`link-module-${module.id}`}
                      >
                        Start
                        <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <span
                        className="button button-ghost module-action"
                        aria-disabled="true"
                        data-testid={`module-start-unavailable-${module.id}`}
                      >
                        Start
                      </span>
                    )
                  ) : (
                    <span
                      className="button button-ghost module-action"
                      aria-disabled="true"
                      data-testid={`link-module-locked-${module.id}`}
                    >
                      <LockKeyhole size={14} />
                      Locked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="card side-card">
          <h3>Your instructor</h3>

          {course.authors.length > 0 ? (
            <div className="instructor">
              <div className="instructor-avatar">
                {course.authors[0].name
                  ? course.authors[0].name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                  : "KA"}
              </div>

              <div>
                <strong>{course.authors[0].name}</strong>

                <small>Instructor</small>
              </div>
            </div>
          ) : (
            <p
              style={{
                color: "var(--brand-text-muted)",
                fontSize: 13,
              }}
            >
              Kool TechFix I.T Academy
            </p>
          )}

          <p
            style={{
              color: "var(--brand-text-muted)",
              fontSize: 13,
            }}
          >
            “The best technical knowledge is the kind you can explain to someone
            else on a busy Tuesday.”
          </p>

          <div
            style={{
              borderTop: "1px solid var(--brand-gray)",
              marginTop: 20,
              paddingTop: 18,
            }}
          >
            <span className="eyebrow">What you will practise</span>

            <p
              style={{
                color: "var(--brand-text-muted)",
                fontSize: 13,
                marginBottom: 0,
              }}
            >
              Troubleshooting · Clear notes · Real decisions
            </p>
          </div>
        </aside>
      </div>
    </Page>
  );
}

"use client";

import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Badge, Button } from "@/components/academy-ui";
import { LoadingScreen } from "@/components/Loader";
import { Page } from "@/components/page-shell";
import { useEnrollInCourse } from "@/hooks/learner/use-enrollments";
import { usePublicCourse } from "@/hooks/use-public-courses";
import { getApiErrorMessage } from "@/lib/api/api-error";

/**
 * Course page for a learner who isn't enrolled yet: what the course covers,
 * plus "Enroll for free". Lesson content stays locked until they enroll.
 */
export function CourseEnrollOverview({ courseId }: { courseId: string }) {
  const { data: course, isLoading, isError } = usePublicCourse(courseId);
  const enroll = useEnrollInCourse();

  if (isLoading) {
    return (
      <Page>
        <LoadingScreen message="Loading course..." />
      </Page>
    );
  }

  if (isError || !course) {
    return (
      <Page>
        <div className="card panel" role="alert">
          <p style={{ margin: 0 }}>
            This course isn&apos;t available right now.{" "}
            <Link href="/courses" className="link-button">
              Back to the catalog
            </Link>
          </p>
        </div>
      </Page>
    );
  }

  const lessonCount = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

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
          <Badge tone="muted">Not enrolled</Badge>

          <h1 style={{ marginTop: 16 }}>{course.title}</h1>

          <p>{course.description}</p>

          <p className="enroll-meta">
            {course.modules.length}{" "}
            {course.modules.length === 1 ? "module" : "modules"} · {lessonCount}{" "}
            {lessonCount === 1 ? "lesson" : "lessons"} ·{" "}
            {course._count.enrollments}{" "}
            {course._count.enrollments === 1 ? "learner" : "learners"}
          </p>

          <div className="row" style={{ marginTop: 28 }}>
            <Button
              onClick={() => enroll.mutate(courseId)}
              disabled={enroll.isPending}
              testId="button-enroll"
            >
              {enroll.isPending ? (
                "Enrolling..."
              ) : (
                <>
                  Enroll for free <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>

          {enroll.isError && (
            <div className="form-error" role="alert" style={{ marginTop: 16 }}>
              {getApiErrorMessage(
                enroll.error,
                "We couldn't enroll you in this course. Please try again.",
              )}
            </div>
          )}
        </div>

        <div className="detail-art">
          <span className="eyebrow">Kool TechFix I.T Academy</span>

          <span className="course-number">
            {course.modules.length}
            <span className="course-number-label">
              {course.modules.length === 1 ? "Module" : "Modules"}
            </span>
          </span>

          <span style={{ fontSize: 13, fontWeight: 700 }}>
            {course.authors.length > 0
              ? `Taught by ${course.authors
                  .map((author) => author.name)
                  .join(", ")}`
              : "Kool TechFix I.T Academy"}
          </span>
        </div>
      </section>

      <section className="card">
        <div className="panel" style={{ paddingBottom: 12 }}>
          <div className="section-head">
            <h2>What you&apos;ll cover</h2>
          </div>
        </div>

        <div className="module-list">
          {course.modules.length === 0 ? (
            <p style={{ padding: "8px 0 20px", color: "var(--brand-text-muted)" }}>
              Modules for this course are coming soon.
            </p>
          ) : (
            course.modules.map((module, index) => (
              <div
                className="module-row"
                key={module.id}
                data-testid={`module-row-${module.id}`}
              >
                <div className="module-status">
                  <span style={{ fontSize: 12 }}>{index + 1}</span>
                </div>

                <div>
                  <h4>{module.title}</h4>
                  <p>
                    Module {index + 1} · {module.lessons.length}{" "}
                    {module.lessons.length === 1 ? "lesson" : "lessons"}
                    {module.quiz ? " · quiz" : ""}
                  </p>
                </div>

                <span className="module-action enroll-locked" aria-label="Locked until you enroll">
                  <LockKeyhole size={14} />
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </Page>
  );
}

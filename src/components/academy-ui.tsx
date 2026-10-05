import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PublicCourse } from "@/Services/public-course.service";
import { LearnerEnrollment } from "@/Services/enrollment.service";
import { LearnerCourseProgress } from "@/Services/progress.service";
import { getLearnerCourseStatus } from "@/lib/course-progress";

export function Button({
  children,
  variant = "primary",
  onClick,
  disabled,
  testId,
  type = "button",
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "muted" | "coral" | "dark";
}) {
  return (
    <span
      className={`badge badge-${tone}`}
      data-testid={`status-${String(children).toLowerCase().replaceAll(" ", "-")}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  label = "Progress",
}: {
  value: number;
  label?: string;
}) {
  return (
    <div data-testid={`progress-${label.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="progress-meta">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

const courseAccents = [
  "lime",
  "coral",
  "ink",
  "sand",
  "sage",
  "stone",
] as const;

export function CourseCard({
  course,
  index,
  mode = "grid",
}: {
  course: PublicCourse;
  index: number;
  mode?: "grid" | "list";
}) {
  const courseNumber = String(index + 1).padStart(2, "0");

  const accent = courseAccents[index % courseAccents.length];

  return (
    <article
      className="card course-card"
      data-testid={`card-course-${course.id}`}
    >
      <Link
        href={`/courses/${course.id}`}
        className="course-art"
        data-accent={accent}
        aria-label={`Open ${course.title}`}
      >
        <span
          className={`course-number ${
            courseNumber === "03" ? "text-white" : ""
          }`}
        >
          {courseNumber}
        </span>
      </Link>

      <div className="course-card-body">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <Badge tone="muted">Available</Badge>

          <span
            style={{
              fontSize: 12,
              color: "var(--brand-text-muted)",
            }}
          >
            {course.modules.length}{" "}
            {course.modules.length === 1 ? "module" : "modules"}
          </span>
        </div>

        <Link
          href={`/courses/${course.id}`}
          data-testid={`link-course-title-${course.id}`}
        >
          <h3>{course.title}</h3>
        </Link>

        <p>{course.description}</p>

        <div className="course-card-foot mt-3">
          <span>
            {course._count.enrollments}{" "}
            {course._count.enrollments === 1 ? "learner" : "learners"}
          </span>

          <Link
            href={`/courses/${course.id}`}
            className="button button-ghost"
            style={{
              minHeight: 33,
              padding: "0 10px",
            }}
            data-testid={`link-course-action-${course.id}`}
          >
            {mode === "list" ? (
              "View course"
            ) : (
              <ChevronRight size={16} aria-label="View course" />
            )}
          </Link>
        </div>
      </div>
    </article>
  );
}

type LearnerCourseCardProps = {
  enrollment: LearnerEnrollment;
  progress: LearnerCourseProgress | null;
  index: number;
};

export function LearnerCourseCard({
  enrollment,
  index,
  progress,
}: LearnerCourseCardProps) {
  const course = enrollment.course;

  const courseNumber = String(index + 1).padStart(2, "0");
  const accent = courseAccents[index % courseAccents.length];

  const status = getLearnerCourseStatus(progress);

  const statusLabel = {
    "not-started": "Not started",
    "in-progress": "In progress",
    completed: "Completed",
  }[status];

  const actionLabel = {
    "not-started": "Start course",
    "in-progress": "Continue learning",
    completed: "Review course",
  }[status];

  return (
    <article
      className="card course-card"
      data-testid={`card-enrolled-course-${course.id}`}
    >
      <Link
        href={`/courses/${course.id}`}
        className="course-art"
        data-accent={accent}
        aria-label={`Open ${course.title}`}
      >
        <span
          className={`course-number ${
            courseNumber === "03" ? "text-white" : ""
          }`}
        >
          {courseNumber}
        </span>
      </Link>

      <div className="course-card-body">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <Badge tone="muted">{statusLabel}</Badge>

          <span
            style={{
              fontSize: 12,
              color: "var(--brand-text-muted)",
            }}
          >
            {course.modules.length}{" "}
            {course.modules.length === 1 ? "module" : "modules"}
          </span>
        </div>

        <Link
          href={`/courses/${course.id}`}
          data-testid={`link-enrolled-course-title-${course.id}`}
        >
          <h3>{course.title}</h3>
        </Link>

        <p>{course.description}</p>

        {progress && (
          <div style={{ marginTop: 14 }}>
            <div
              className="row"
              style={{
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--brand-text-muted)",
                }}
              >
                Course progress
              </span>

              {/* <span
                style={{
                  fontSize: 12,
                  color: "var(--brand-green)",
                }}
              >
                {progress.percentage}%
              </span> */}
            </div>

            <ProgressBar value={progress.percentage} label="" />
          </div>
        )}

        <div className="course-card-foot mt-3">
          <span>
            {course.modules.reduce(
              (total, module) => total + module._count.lessons,
              0,
            )}{" "}
            lessons
          </span>

          <Link
            href={`/courses/${course.id}`}
            className="button button-ghost cursor-pointer"
            style={{
              minHeight: 33,
              padding: "0 10px",
            }}
            data-testid={`link-enrolled-course-action-${course.id}`}
          >
            {actionLabel}
            <ChevronRight size={16} aria-label={actionLabel} />
          </Link>
        </div>
      </div>
    </article>
  );
}

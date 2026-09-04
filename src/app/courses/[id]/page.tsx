"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  LockKeyhole,
  Users,
} from "lucide-react";
import { Badge, Button, ProgressBar } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";
import { courses, getCourse } from "@/lib/academy-data";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const course = getCourse(id);
  const [enrolled, setEnrolled] = useState(course.status !== "not-started");
  const [saved, setSaved] = useState(false);
  const firstOpen =
    course.modules.find((module) => module.state === "current") ??
    course.modules[0];
  const actionLabel =
    course.status === "complete"
      ? "Review course"
      : enrolled
        ? "Continue course"
        : "Enroll for free";

  return (
    <Page>
      <Link
        href="/catalog"
        className="row"
        style={{ color: "#77766f", fontSize: 13, marginBottom: 22 }}
        data-testid="link-back-catalog"
      >
        <ArrowLeft size={15} /> Back to catalog
      </Link>
      <section className="detail-hero">
        <div className="detail-hero-copy">
          <Badge tone={course.status === "complete" ? "coral" : "default"}>
            {course.category}
          </Badge>
          <h1 style={{ marginTop: 16 }}>{course.title}</h1>
          <p>{course.description}</p>
          <div className="meta-row">
            <span>
              <Clock3 size={15} /> {course.duration}
            </span>
            <span>
              <BookOpen size={15} /> {course.moduleCount} modules
            </span>
            <span>
              <Users size={15} /> {course.level}
            </span>
          </div>
          <div className="row" style={{ marginTop: 28 }}>
            <Link
              href={
                course.status === "complete"
                  ? `/courses/${course.id}/certificate`
                  : enrolled
                    ? `/courses/${course.id}/lessons/${firstOpen.id}`
                    : "#"
              }
              className="button button-primary"
              onClick={(event) => {
                if (!enrolled && course.status !== "complete") {
                  event.preventDefault();
                  setEnrolled(true);
                }
              }}
              data-testid="link-course-primary-action"
            >
              {actionLabel} <ArrowRight size={16} />
            </Link>
            <Button
              variant="ghost"
              onClick={() => setSaved(!saved)}
              testId="button-save-course"
            >
              {saved ? "Saved" : "Save for later"}
            </Button>
          </div>
        </div>
        <div className="detail-art" data-accent={course.accent}>
          <span
            className="eyebrow"
            style={{ color: course.accent === "ink" ? "#d8e85c" : "#585a35" }}
          >
            KoolTech / {course.category}
          </span>
          <span className="course-number">
            {String(courses.indexOf(course) + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Taught by {course.instructor}
          </span>
        </div>
      </section>

      <div className="module-layout">
        <section className="card">
          <div className="panel" style={{ paddingBottom: 12 }}>
            <div className="section-head">
              <h2>Course modules</h2>
              <Badge tone="muted">{course.moduleCount} modules</Badge>
            </div>
            {course.progress > 0 && (
              <ProgressBar value={course.progress} label="Course progress" />
            )}
          </div>
          <div className="module-list">
            {course.modules.map((module, index) => (
              <div
                className="module-row"
                key={module.id}
                data-testid={`module-row-${module.id}`}
              >
                <div className={`module-status ${module.state}`}>
                  {module.state === "complete" ? (
                    <Check size={15} />
                  ) : module.state === "locked" ? (
                    <LockKeyhole size={14} />
                  ) : (
                    <span style={{ fontSize: 12 }}>{index + 1}</span>
                  )}
                </div>
                <div>
                  <h4>{module.title}</h4>
                  <p>
                    {module.type === "quiz"
                      ? "Knowledge check"
                      : `Module ${index + 1} · ${module.duration}`}
                  </p>
                </div>
                {module.state !== "locked" && (
                  <Link
                    href={
                      module.type === "quiz"
                        ? `/courses/${course.id}/quiz`
                        : `/courses/${course.id}/lessons/${module.id}`
                    }
                    className="button button-ghost module-action"
                    data-testid={`link-module-${module.id}`}
                  >
                    {module.state === "complete" ? "Review" : "Start"}{" "}
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
        <aside className="card side-card">
          <h3>Your instructor</h3>
          <div className="instructor">
            <div className="instructor-avatar">
              {course.instructor
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
            <div>
              <strong>{course.instructor}</strong>
              <small>Working technologist</small>
            </div>
          </div>
          <p style={{ color: "#77766f", fontSize: 13 }}>
            “The best technical knowledge is the kind you can explain to someone
            else on a busy Tuesday.”
          </p>
          <div
            style={{
              borderTop: "1px solid #ece9e1",
              marginTop: 20,
              paddingTop: 18,
            }}
          >
            <span className="eyebrow">What you will practise</span>
            <p style={{ color: "#68675f", fontSize: 13, marginBottom: 0 }}>
              Troubleshooting · Clear notes · Real decisions
            </p>
          </div>
        </aside>
      </div>
    </Page>
  );
}

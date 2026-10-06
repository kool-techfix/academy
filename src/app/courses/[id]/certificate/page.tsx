"use client";

import { useState } from "react";

import { ArrowLeft, Check, ChevronRight, Download } from "lucide-react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Badge, Button } from "@/components/academy-ui";

import { Page } from "@/components/page-shell";

import { downloadTextFile } from "@/lib/downloads";
import { useCurrentUser } from "@/hooks/auth/use-user";
import { useLearnerCourse } from "@/hooks/learner/use-course";
import { useLearnerCourseProgress } from "@/hooks/learner/use-progress";

export default function Certificate() {
  const { id: courseId } = useParams<{ id: string }>();

  const [downloaded, setDownloaded] = useState(false);

  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  const { data: course, isLoading: isCourseLoading } =
    useLearnerCourse(courseId);

  const { data: progress, isLoading: isProgressLoading } =
    useLearnerCourseProgress(courseId);

  const isLoading = isUserLoading || isCourseLoading || isProgressLoading;

  if (isLoading) {
    return (
      <Page>
        <div className="card">
          <p>Loading certificate...</p>
        </div>
      </Page>
    );
  }

  if (!course || !progress || !user) {
    return (
      <Page>
        <div className="card">
          <span className="eyebrow">Certificate</span>

          <h1 style={{ marginTop: 10 }}>Certificate unavailable</h1>

          <p>We could not load your course completion information.</p>

          <Link href={`/courses/${courseId}`} className="button button-ghost">
            Back to course
          </Link>
        </div>
      </Page>
    );
  }

  if (!progress.certificateEligible) {
    return (
      <Page>
        <div className="card">
          <span className="eyebrow">Certificate</span>

          <h1 style={{ marginTop: 10 }}>Certificate not available yet</h1>

          <p>
            You need to complete all modules and pass the final assessment
            before your certificate becomes available.
          </p>

          <Link href={`/courses/${courseId}`} className="button button-ghost">
            Back to course
          </Link>
        </div>
      </Page>
    );
  }

  const download = () => {
    downloadTextFile(
      `${course.id}-certificate.txt`,
      `KOOLTECH FIX IT ACADEMY

Certificate of completion

${user.certificateName ?? user.name} has completed ${course.title}.`,
    );

    setDownloaded(true);
  };

  return (
    <Page>
      <Link
        href={`/courses/${course.id}`}
        className="row"
        style={{
          color: "var(--brand-text-muted)",
          fontSize: 13,
          marginBottom: 22,
        }}
        data-testid="link-back-certificate-course"
      >
        <ArrowLeft size={15} />
        Back to course
      </Link>

      <div className="card completion">
        <div className="completion-mark">
          <Check size={32} />
        </div>

        <span className="eyebrow">Course complete</span>

        <h1 style={{ marginTop: 10 }}>
          A job well done, {user.name.split(" ")[0]}.
        </h1>

        <p>
          You completed <strong>{course.title}</strong>. Keep this proof of
          practice close — and take the next useful step when you are ready.
        </p>

        <Button onClick={download} testId="button-download-certificate">
          <Download size={16} />

          {downloaded ? "Certificate downloaded" : "Download certificate"}
        </Button>

        <div className="review-list">
          <div className="section-head" style={{ marginTop: 24 }}>
            <h3>Reviewable modules</h3>

            <Badge tone="coral">Completed</Badge>
          </div>

          {course.modules.map((module) => (
            <div className="review-row" key={module.id}>
              <Check size={16} />

              <span>{module.title}</span>

              <Link
                href={`/courses/${course.id}/modules/${module.id}`}
                style={{
                  marginLeft: "auto",
                  color: "var(--brand-green)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
                data-testid={`link-review-${module.id}`}
              >
                Review{" "}
                <ChevronRight
                  size={13}
                  style={{
                    verticalAlign: "middle",
                  }}
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

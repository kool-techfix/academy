
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Page } from "@/components/page-shell";
import {
  ChevronLeft,
  CheckCircle,
  Circle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/academy-ui";
import { useInstructorCourseEnrollee } from "@/hooks/instructor/use-enrollees";

export default function EnrolleeDetail() {
  const params = useParams<{
    id: string;
    learnerId: string;
  }>();

  const courseId = params.id;
  const learnerId = params.learnerId;

  const {
    data,
    isLoading,
    isError,
  } = useInstructorCourseEnrollee(
    courseId,
    learnerId,
  );

  if (isLoading) {
    return (
      <Page>
        <div
          style={{
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2
            size={24}
            className="animate-spin"
            aria-label="Loading learner details"
          />
        </div>
      </Page>
    );
  }

  if (isError || !data) {
    return (
      <Page>
        <div className="not-found">
          <h2>Learner not found</h2>
          <p style={{ marginTop: 8 }}>
            The learner could not be loaded for this course.
          </p>
        </div>
      </Page>
    );
  }

  const {
    course,
    learner,
    progress,
    moduleResults,
    finalAssessmentResult,
  } = data;

  return (
    <Page>
      <div style={{ maxWidth: 800, margin: "24px auto" }}>
        <Link
          href={`/instructor/courses/${course.id}/enrollees`}
          className="settings-back"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 24,
          }}
        >
          <ChevronLeft size={16} />
          Back to Enrollees
        </Link>

        <div
          className="card"
          style={{
            padding: 42,
            marginBottom: 32,
            background: "var(--brand-black)",
            color: "var(--brand-white)",
          }}
        >
          <h1
            style={{
              color: "var(--brand-white)",
              fontSize: 38,
              marginBottom: 12,
            }}
          >
            {learner.name}
          </h1>

          <div
            className="row"
            style={{
              gap: 24,
              color: "var(--brand-gray)",
              fontSize: 14,
            }}
          >
            <span>
              <strong>Course:</strong> {course.title}
            </span>

            <span>
              <strong>Overall Progress:</strong>{" "}
              <span
                style={{
                  color: "var(--brand-white)",
                  fontWeight: 700,
                }}
              >
                {progress}%
              </span>
            </span>
          </div>
        </div>

        <h3
          style={{
            fontSize: 22,
            marginBottom: 16,
          }}
        >
          Module Breakdown
        </h3>

        <div
          className="stack"
          style={{ gap: 12 }}
        >
          {moduleResults.map((result) => {
            const isComplete = result.passed;

            return (
              <div
                key={result.moduleId}
                className="card row"
                style={{
                  padding: "20px 24px",
                  justifyContent: "space-between",
                }}
              >
                <div
                  className="row"
                  style={{ gap: 16 }}
                >
                  {isComplete ? (
                    <CheckCircle
                      size={24}
                      style={{ color: "var(--brand-green)" }}
                    />
                  ) : (
                    <Circle
                      size={24}
                      style={{ color: "var(--brand-gray)" }}
                    />
                  )}

                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 16,
                      }}
                    >
                      Module {result.moduleOrder}:{" "}
                      {result.moduleTitle}
                    </h4>

                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "var(--brand-text-muted)",
                        marginTop: 4,
                      }}
                    >
                      {isComplete
                        ? "Completed"
                        : result.hasAttempt
                          ? "Not passed"
                          : "Not started"}
                    </p>
                  </div>
                </div>

                {result.hasAttempt && (
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--brand-text-muted)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 700,
                      }}
                    >
                      Quiz Score
                    </div>

                    <Badge
                      tone={
                        result.passed
                          ? "default"
                          : "coral"
                      }
                    >
                      {result.score}% (
                      {result.score}/{result.total})
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            marginTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--brand-white)",
          }}
        >
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: 16,
              }}
            >
              Final Assessment Result
            </h4>
          </div>

          <div>
            {typeof finalAssessmentResult === "number" ? (
              <Badge
                tone={
                  finalAssessmentResult >= 80
                    ? "dark"
                    : "coral"
                }
              >
                Score: {finalAssessmentResult}%
              </Badge>
            ) : (
              <Badge tone="muted">
                In progress
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Page } from "@/components/page-shell";
import { useInstructorData } from "@/lib/use-instructor-data";
import { ChevronLeft, CheckCircle, Circle } from "lucide-react";
import { Badge } from "@/components/academy-ui";

export default function EnrolleeDetail() {
  const params = useParams<{ id: string; learnerId: string }>();
  const { courses, enrollees } = useInstructorData();
  const courseId = params?.id;
  const learnerId = params?.learnerId;

  const course = courses.find((c) => c.id === courseId);
  const courseEnrollees = courseId ? enrollees[courseId] || [] : [];
  const enrollee = courseEnrollees.find((e) => e.id === learnerId);

  if (!course || !enrollee) {
    return (
      <Page>
        <div className="not-found">
          <h2>Learner not found</h2>
        </div>
      </Page>
    );
  }

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
          <ChevronLeft size={16} /> Back to Enrollees
        </Link>

        <div
          className="card"
          style={{
            padding: 42,
            marginBottom: 32,
            background: "#2e2e2c",
            color: "#faf9f5",
          }}
        >
          <h1 style={{ color: "#faf9f5", fontSize: 38, marginBottom: 12 }}>
            {enrollee.name}
          </h1>
          <div
            className="row"
            style={{ gap: 24, color: "#c8c7bd", fontSize: 14 }}
          >
            <span>
              <strong>Course:</strong> {course.title}
            </span>
            <span>
              <strong>Overall Progress:</strong>{" "}
              <span style={{ color: "#d8e85c", fontWeight: 700 }}>
                {enrollee.progress}%
              </span>
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: 22, marginBottom: 16 }}>Module Breakdown</h3>
        <div className="stack" style={{ gap: 12 }}>
          {course.modules.map((module) => {
            const result = enrollee.moduleResults.find(
              (r) => r.moduleId === module.id,
            );
            const isComplete = !!result;
            const scorePct = result
              ? Math.round((result.score / result.total) * 100)
              : 0;

            return (
              <div
                key={module.id}
                className="card row"
                style={{
                  padding: "20px 24px",
                  justifyContent: "space-between",
                }}
              >
                <div className="row" style={{ gap: 16 }}>
                  {isComplete ? (
                    <CheckCircle size={24} color="#69751b" />
                  ) : (
                    <Circle size={24} color="#dcd9cf" />
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: 16 }}>
                      Module {module.order}: {module.title}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#77766f",
                        marginTop: 4,
                      }}
                    >
                      {isComplete ? "Completed" : "Not started"}
                    </p>
                  </div>
                </div>
                {isComplete && module.quizQuestions.length > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#85827a",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        fontWeight: 700,
                      }}
                    >
                      Quiz Score
                    </div>
                    <Badge tone={scorePct >= 80 ? "default" : "coral"}>
                      {scorePct}% ({result.score}/{result.total})
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
            background: "#faf9f5",
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: 16 }}>Final Assessment Result</h4>
          </div>
          <div>
            {typeof enrollee.finalAssessmentResult === "number" ? (
              <Badge
                tone={enrollee.finalAssessmentResult >= 80 ? "dark" : "coral"}
              >
                Score: {enrollee.finalAssessmentResult}%
              </Badge>
            ) : (
              <Badge tone="muted">In progress</Badge>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

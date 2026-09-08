"use client";

import { useState } from "react";

import { Button } from "@/components/academy-ui";
import { QuizFormModal } from "./quiz-form-modal";
import { CheckCircle } from "lucide-react";

import {
  useCourseFinalAssessment,
  useCreateCourseFinalAssessment,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/instructor/use-quizzes";

import type { QuizFormData } from "./quiz-form-modal";

type FinalAssessmentEditorProps = {
  courseId: string;
  courseTitle: string;
};

export function FinalAssessmentEditor({
  courseId,
  courseTitle,
}: FinalAssessmentEditorProps) {
  const [managing, setManaging] = useState(false);

  const {
    data: finalAssessment,
    isLoading,
    isError,
  } = useCourseFinalAssessment(courseId);

  const createFinalAssessment = useCreateCourseFinalAssessment();

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const questions = finalAssessment?.questions ?? [];

  const handleSave = async (submittedQuestions: QuizFormData["questions"]) => {
    try {
      /**
       * CASE 1:
       * Final assessment does not exist yet.
       */
      if (!finalAssessment) {
        await createFinalAssessment.mutateAsync({
          courseId,
          data: {
            type: "FINAL",
            questions: submittedQuestions.map((question) => ({
              questionText: question.questionText,
              options: question.options,
              correctAnswer: question.options[question.correctOptionIndex],
            })),
          },
        });

        setManaging(false);
        return;
      }

      /**
       * CASE 2:
       * Final assessment already exists.
       */

      const existingQuestionIds = new Set(
        questions.map((question) => question.id),
      );

      const submittedQuestionIds = new Set(
        submittedQuestions
          .filter((question) => question.id)
          .map((question) => question.id),
      );

      /**
       * Update existing questions
       * and create new questions.
       */
      await Promise.all(
        submittedQuestions.map(async (question) => {
          const payload = {
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.options[question.correctOptionIndex],
          };

          /**
           * Existing question
           */
          if (question.id && existingQuestionIds.has(question.id)) {
            return updateQuestion.mutateAsync({
              questionId: question.id,
              data: payload,
              context: {
                type: "FINAL",
                courseId,
              },
            });
          }

          /**
           * New question
           */
          return createQuestion.mutateAsync({
            quizId: finalAssessment.id,
            data: payload,
            context: {
              type: "FINAL",
              courseId,
            },
          });
        }),
      );

      /**
       * Delete questions removed
       * from the form.
       */
      const deletedQuestions = questions.filter(
        (question) => !submittedQuestionIds.has(question.id),
      );

      await Promise.all(
        deletedQuestions.map((question) =>
          deleteQuestion.mutateAsync({
            questionId: question.id,
            context: { type: "FINAL", courseId },
          }),
        ),
      );

      setManaging(false);
    } catch (error) {
      console.error("Failed to save final assessment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <p
          style={{
            margin: 0,
            color: "#77766f",
          }}
        >
          Loading final assessment...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <p
          style={{
            margin: 0,
            color: "#b42318",
          }}
        >
          Unable to load final assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <div
        className="row"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="row">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: questions.length ? "#eff2d7" : "#f0efea",
              color: questions.length ? "#52601b" : "#98958b",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CheckCircle size={22} />
          </div>

          <div>
            <h4
              style={{
                fontSize: 16,
                margin: "0 0 4px 0",
              }}
            >
              Final Assessment
            </h4>

            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#77766f",
              }}
            >
              {questions.length === 0
                ? "No questions configured yet."
                : `${questions.length} questions configured.`}
            </p>
          </div>
        </div>

        <Button
          variant={finalAssessment ? "secondary" : "primary"}
          onClick={() => setManaging(true)}
          disabled={
            createFinalAssessment.isPending ||
            createQuestion.isPending ||
            updateQuestion.isPending ||
            deleteQuestion.isPending
          }
        >
          {finalAssessment ? "Edit Assessment" : "Create Assessment"}
        </Button>
      </div>

      {managing && (
        <QuizFormModal
          title={`Final Assessment: ${courseTitle}`}
          quiz={finalAssessment}
          onClose={() => setManaging(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

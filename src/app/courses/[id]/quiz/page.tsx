"use client";

import { useState } from "react";

import { ArrowLeft, ArrowRight, Check, Trophy } from "lucide-react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";

import {
  useLearnerFinalQuiz,
  useSubmitFinalQuiz,
} from "@/hooks/learner/use-quiz";

export default function Quiz() {
  const { id: courseId } = useParams<{ id: string }>();

  const {
    data: quiz,
    isLoading,
    isError,
    error,
  } = useLearnerFinalQuiz(courseId);

  const submitFinalQuiz = useSubmitFinalQuiz(courseId);

  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  if (isLoading) {
    return (
      <Page>
        <div className="quiz-wrap">
          <p>Loading final assessment...</p>
        </div>
      </Page>
    );
  }

  if (isError || !quiz) {
    return (
      <Page>
        <div className="card">
          <span className="eyebrow">Final assessment</span>

          <h1 style={{ marginTop: 10 }}>Unable to load the final assessment</h1>

          <p>
            {error instanceof Error
              ? error.message
              : "Something went wrong while loading the final assessment."}
          </p>

          <Link href={`/courses/${courseId}`} className="button button-ghost">
            Back to course
          </Link>
        </div>
      </Page>
    );
  }

  // A quiz without questions can't be taken; never index into an empty list.
  if (quiz.questions.length === 0) {
    return (
      <Page>
        <div className="card panel">
          <span className="eyebrow">Knowledge check</span>

          <h1 style={{ marginTop: 10 }}>This quiz isn&apos;t ready yet</h1>

          <p>
            The instructor hasn&apos;t added any questions. Please check back
            later.
          </p>

          <Link href={`/courses/${courseId}`} className="button button-ghost">
            Back to course
          </Link>
        </div>
      </Page>
    );
  }

  const question = quiz.questions[step];

  const selectedAnswer = answers[question.id] ?? null;

  const isLastQuestion = step === quiz.questions.length - 1;

  const selectAnswer = (answer: string) => {
    setAnswers((current) => ({
      ...current,
      [question.id]: answer,
    }));
  };

  const advance = async () => {
    if (!selectedAnswer) {
      return;
    }

    if (!isLastQuestion) {
      setStep((current) => current + 1);
      return;
    }

    const submission = {
      quizId: quiz.id,
      answers: quiz.questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id],
      })),
    };

    const response = await submitFinalQuiz.mutateAsync(submission);

    setResult({
      score: response.score,
      passed: response.passed,
    });
  };

  if (result) {
    return (
      <Page>
        <div className="card completion" data-testid="quiz-completion">
          <div className="completion-mark">
            <Trophy size={30} />
          </div>

          <span className="eyebrow">
            {result.passed
              ? "Final assessment complete"
              : "Final assessment result"}
          </span>

          <h1 style={{ marginTop: 10 }}>
            {result.passed
              ? "You passed the final assessment."
              : "You didn't pass this time."}
          </h1>

          <p>
            You scored <strong>{result.score}%</strong>. The required passing
            score is <strong>{quiz.passScore}%</strong>.
          </p>

          <div
            className="row"
            style={{
              justifyContent: "center",
            }}
          >
            {result.passed && (
              <Link
                href={`/courses/${courseId}/certificate`}
                className="button button-primary"
                data-testid="link-view-certificate"
              >
                View certificate <ArrowRight size={16} />
              </Link>
            )}

            <Link
              href={`/courses/${courseId}`}
              className="button button-ghost"
              data-testid="link-back-course-after-quiz"
            >
              Back to course
            </Link>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="quiz-wrap">
        <Link
          href={`/courses/${courseId}`}
          className="row"
          style={{
            color: "var(--brand-text-muted)",
            fontSize: 13,
            marginBottom: 26,
          }}
          data-testid="link-exit-quiz"
        >
          <ArrowLeft size={15} /> Exit quiz
        </Link>

        <div className="quiz-top">
          <span>Final assessment</span>

          <strong data-testid="text-quiz-progress">
            Question {step + 1} of {quiz.questions.length}
          </strong>
        </div>

        <div className="quiz-progress">
          <div
            style={{
              width: `${((step + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>

        <span className="eyebrow">Final assessment</span>

        <h1 className="quiz-question" style={{ marginTop: 12 }}>
          {question.questionText}
        </h1>

        <div className="answers">
          {question.options.map((answer, index) => {
            const isSelected = selectedAnswer === answer;

            return (
              <button
                type="button"
                className={`answer ${isSelected ? "selected" : ""}`}
                onClick={() => selectAnswer(answer)}
                key={`${question.id}-${answer}`}
                data-testid={`button-answer-${index}`}
              >
                <span className="answer-letter">
                  {String.fromCharCode(65 + index)}
                </span>

                {answer}

                {isSelected && (
                  <Check
                    size={17}
                    style={{
                      marginLeft: "auto",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {submitFinalQuiz.isError && (
          <p role="alert" style={{ marginTop: 16 }}>
            {submitFinalQuiz.error instanceof Error
              ? submitFinalQuiz.error.message
              : "Failed to submit the final assessment."}
          </p>
        )}

        <div className="quiz-actions">
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={() => setStep((current) => current - 1)}
              disabled={submitFinalQuiz.isPending}
              testId="button-previous-question"
            >
              Previous
            </Button>
          ) : (
            <span />
          )}

          <Button
            onClick={advance}
            disabled={!selectedAnswer || submitFinalQuiz.isPending}
            testId={
              isLastQuestion ? "button-submit-quiz" : "button-next-question"
            }
          >
            {submitFinalQuiz.isPending ? (
              "Submitting..."
            ) : isLastQuestion ? (
              <>
                Submit quiz <Check size={15} />
              </>
            ) : (
              <>
                Next question <ArrowRight size={15} />
              </>
            )}
          </Button>
        </div>
      </div>
    </Page>
  );
}

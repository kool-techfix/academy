"use client";

import { useState } from "react";

import { ArrowLeft, ArrowRight, Check, Trophy } from "lucide-react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";

import {
  useLearnerModuleQuiz,
  useSubmitModuleQuiz,
} from "@/hooks/learner/use-quiz";

export default function Quiz() {
  const { id, moduleId } = useParams<{
    id: string;
    moduleId: string;
  }>();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [submitted, setSubmitted] = useState(false);

  const {
    data: quiz,
    isLoading,
    isError,
    error,
  } = useLearnerModuleQuiz(id, moduleId);

  const submitQuiz = useSubmitModuleQuiz(id, moduleId);

  if (isLoading) {
    return (
      <Page>
        <div className="quiz-wrap">
          <p>Loading quiz...</p>
        </div>
      </Page>
    );
  }

  if (isError || !quiz) {
    return (
      <Page>
        <div className="card">
          <span className="eyebrow">Knowledge check</span>

          <h1 style={{ marginTop: 10 }}>Unable to load quiz</h1>

          <p>
            {error instanceof Error
              ? error.message
              : "The quiz could not be loaded."}
          </p>

          <Link href={`/courses/${id}`} className="button button-ghost">
            <ArrowLeft size={15} />
            Back to course
          </Link>
        </div>
      </Page>
    );
  }

  const question = quiz.questions[step];

  if (!question) {
    return (
      <Page>
        <div className="card">
          <h1>Quiz unavailable</h1>
          <p>This quiz does not contain any questions.</p>
        </div>
      </Page>
    );
  }

  const selected = answers[question.id] ?? null;

  const advance = () => {
    if (!selected) return;

    if (step < quiz.questions.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    submitQuiz.mutate(
      {
        quizId: quiz.id,
        answers: quiz.questions.map((quizQuestion) => ({
          questionId: quizQuestion.id,
          answer: answers[quizQuestion.id],
        })),
      },
      {
        onSuccess: () => {
          setSubmitted(true);
        },
      },
    );
  };

  const goPrevious = () => {
    if (step === 0) return;

    setStep((current) => current - 1);
  };

  if (submitted && submitQuiz.data) {
    const result = submitQuiz.data;

    return (
      <Page>
        <div className="card completion" data-testid="quiz-completion">
          <div className="completion-mark">
            <Trophy size={30} />
          </div>

          <span className="eyebrow">Knowledge check complete</span>

          <h1 style={{ marginTop: 10 }}>
            {result.passed ? "Well done!" : "Keep practicing."}
          </h1>

          <p>
            You scored <strong>{result.score}%</strong>. The passing score is{" "}
            <strong>{result.passScore}%</strong>.
          </p>

          {result.passed ? (
            <p>
              You passed this module quiz. You can continue to the next module.
            </p>
          ) : (
            <p>
              You did not pass this quiz yet. Review the module and try again.
            </p>
          )}

          <div className="row" style={{ justifyContent: "center" }}>
            {result.passed ? (
              <Link
                href={`/courses/${id}`}
                className="button button-primary"
                data-testid="link-continue-course"
              >
                Continue course
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setStep(0);
                  setAnswers({});
                  submitQuiz.reset();
                }}
                testId="button-retake-quiz"
              >
                Retake quiz
              </Button>
            )}

            <Link
              href={`/courses/${id}`}
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
          href={`/courses/${id}`}
          className="row"
          style={{
            color: "var(--brand-text-muted)",
            fontSize: 13,
            marginBottom: 26,
          }}
          data-testid="link-exit-quiz"
        >
          <ArrowLeft size={15} />
          Exit quiz
        </Link>

        <div className="quiz-top">
          <span>Knowledge check</span>

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

        <span className="eyebrow">Module quiz</span>

        <h1 className="quiz-question" style={{ marginTop: 12 }}>
          {question.questionText}
        </h1>

        <div className="answers">
          {question.options.map((option, index) => (
            <button
              type="button"
              className={`answer ${selected === option ? "selected" : ""}`}
              onClick={() =>
                setAnswers((current) => ({
                  ...current,
                  [question.id]: option,
                }))
              }
              key={option}
              data-testid={`button-answer-${index}`}
            >
              <span className="answer-letter">
                {String.fromCharCode(65 + index)}
              </span>

              {option}

              {selected === option && (
                <Check size={17} style={{ marginLeft: "auto" }} />
              )}
            </button>
          ))}
        </div>

        {submitQuiz.isError && (
          <p role="alert" style={{ marginTop: 16 }}>
            {submitQuiz.error instanceof Error
              ? submitQuiz.error.message
              : "Failed to submit quiz."}
          </p>
        )}

        <div className="quiz-actions">
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={goPrevious}
              disabled={submitQuiz.isPending}
              testId="button-previous-question"
            >
              Previous
            </Button>
          ) : (
            <span />
          )}

          <Button
            onClick={advance}
            disabled={!selected || submitQuiz.isPending}
            testId={
              step < quiz.questions.length - 1
                ? "button-next-question"
                : "button-submit-quiz"
            }
          >
            {submitQuiz.isPending ? (
              "Submitting..."
            ) : step < quiz.questions.length - 1 ? (
              <>
                Next question
                <ArrowRight size={15} />
              </>
            ) : (
              <>
                Submit quiz
                <Check size={15} />
              </>
            )}
          </Button>
        </div>
      </div>
    </Page>
  );
}

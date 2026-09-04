import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Trophy } from "lucide-react";
import { Button } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";
import { getCourse, quizQuestions } from "@/lib/academy-data";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const course = getCourse(id);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [complete, setComplete] = useState(false);
  const question = quizQuestions[step];

  if (complete) {
    return (
      <Page>
        <div className="card completion" data-testid="quiz-completion">
          <div className="completion-mark">
            <Trophy size={30} />
          </div>
          <span className="eyebrow">Knowledge check complete</span>
          <h1 style={{ marginTop: 10 }}>You know your way around.</h1>
          <p>
            You got {quizQuestions.length} out of {quizQuestions.length}. The
            important part is the reasoning — keep practicing it in the field.
          </p>
          <div className="row" style={{ justifyContent: "center" }}>
            <Link
              href={`/courses/${course.id}/certificate`}
              className="button button-primary"
              data-testid="link-view-certificate"
            >
              View certificate <ArrowRight size={16} />
            </Link>
            <Link
              href={`/courses/${course.id}`}
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

  const advance = () => {
    if (selected === null) return;
    if (step < quizQuestions.length - 1) {
      setStep(step + 1);
      setSelected(null);
    } else {
      setComplete(true);
    }
  };

  return (
    <Page>
      <div className="quiz-wrap">
        <Link
          href={`/courses/${course.id}`}
          className="row"
          style={{ color: "#77766f", fontSize: 13, marginBottom: 26 }}
          data-testid="link-exit-quiz"
        >
          <ArrowLeft size={15} /> Exit quiz
        </Link>
        <div className="quiz-top">
          <span>Knowledge check</span>
          <strong data-testid="text-quiz-progress">
            Question {step + 1} of {quizQuestions.length}
          </strong>
        </div>
        <div className="quiz-progress">
          <div
            style={{ width: `${((step + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>
        <span className="eyebrow">{course.title}</span>
        <h1 className="quiz-question" style={{ marginTop: 12 }}>
          {question.question}
        </h1>
        <div className="answers">
          {question.answers.map((answer, index) => (
            <button
              className={`answer ${selected === index ? "selected" : ""}`}
              onClick={() => setSelected(index)}
              key={answer}
              data-testid={`button-answer-${index}`}
            >
              <span className="answer-letter">
                {String.fromCharCode(65 + index)}
              </span>
              {answer}
              {selected === index && (
                <Check size={17} style={{ marginLeft: "auto" }} />
              )}
            </button>
          ))}
        </div>
        <div className="quiz-actions">
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={() => {
                setStep(step - 1);
                setSelected(null);
              }}
              testId="button-previous-question"
            >
              Previous
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={advance}
            disabled={selected === null}
            testId={
              step < quizQuestions.length - 1
                ? "button-next-question"
                : "button-submit-quiz"
            }
          >
            {step < quizQuestions.length - 1 ? (
              <>
                Next question <ArrowRight size={15} />
              </>
            ) : (
              <>
                Submit quiz <Check size={15} />
              </>
            )}
          </Button>
        </div>
      </div>
    </Page>
  );
}

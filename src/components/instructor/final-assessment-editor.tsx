import { useState } from 'react';
import { InstructorCourse, QuizQuestion } from '@/lib/instructor-types';
import { Button } from '@/components/academy-ui';
import { QuizFormModal } from './quiz-form-modal';
import { CheckCircle } from 'lucide-react';

export function FinalAssessmentEditor({ course, onUpdate }: { course: InstructorCourse, onUpdate: (q: QuizQuestion[]) => void }) {
  const [managing, setManaging] = useState(false);
  const questions = course.finalAssessment;
  
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="row">
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: questions.length ? '#eff2d7' : '#f0efea', color: questions.length ? '#52601b' : '#98958b', display: 'grid', placeItems: 'center' }}>
             <CheckCircle size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: 16, margin: '0 0 4px 0' }}>Final Assessment</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#77766f' }}>
              {questions.length === 0 ? 'No questions configured yet.' : `${questions.length} questions configured.`}
            </p>
          </div>
        </div>
        <Button variant={questions.length ? "secondary" : "primary"} onClick={() => setManaging(true)}>
          {questions.length ? "Edit Assessment" : "Create Assessment"}
        </Button>
      </div>

      {managing && (
        <QuizFormModal 
          title={`Final Assessment: ${course.title}`}
          questions={questions}
          onClose={() => setManaging(false)}
          onSave={onUpdate}
        />
      )}
    </div>
  );
}

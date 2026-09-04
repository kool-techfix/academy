import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from './modal';
import { Button } from '@/components/academy-ui';
import { FormField } from '@/components/form-field';
import { Plus, Trash2 } from 'lucide-react';

const quizSchema = z.object({
  questions: z.array(z.object({
    id: z.string().optional(),
    text: z.string().min(5, "Question text must be at least 5 characters"),
    options: z.array(z.string().min(1, "Option cannot be empty")).length(4),
    correctOptionIndex: z.coerce.number().min(0).max(3)
  }))
});

type QuizFormData = z.infer<typeof quizSchema>;

export function QuizFormModal({ title, questions, onClose, onSave }: { title: string, questions: any[], onClose: () => void, onSave: (q: any[]) => void }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: { questions: questions.length ? questions : [{ id: `q-${Date.now()}`, text: '', options: ['', '', '', ''], correctOptionIndex: 0 }] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  const onSubmit = (data: QuizFormData) => {
    const formatted = data.questions.map(q => ({
      ...q,
      id: q.id || `q-${Date.now()}-${Math.random()}`
    }));
    onSave(formatted);
    onClose();
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="stack" style={{ gap: 24 }}>
        {fields.map((field, index) => (
          <div key={field.id} className="card" style={{ padding: 24, position: 'relative', background: '#faf9f5' }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ margin: 0, fontSize: 16 }}>Question {index + 1}</h4>
              <button type="button" onClick={() => remove(index)} style={{ background: 'none', border: 'none', color: '#77766f', cursor: 'pointer', padding: 4 }} aria-label={`Remove Question ${index + 1}`}>
                <Trash2 size={18} />
              </button>
            </div>
            
            <FormField label="Question text" name={`questions.${index}.text`} register={register as any} error={errors.questions?.[index]?.text?.message} placeholder="e.g. What is the standard voltage?" />
            
            <fieldset style={{ marginTop: 16, padding: 0, border: 'none' }}>
              <legend style={{ fontSize: 13, fontWeight: 700, color: '#4d4c47', display: 'block', marginBottom: 8 }}>Options (Select the correct one)</legend>
              <div className="stack" style={{ gap: 10 }}>
                {[0, 1, 2, 3].map((optIndex) => (
                  <div key={optIndex} className="row" style={{ alignItems: 'flex-start' }}>
                    <div style={{ paddingTop: 10, paddingRight: 8 }}>
                      <input 
                        type="radio" 
                        id={`q-${field.id}-opt-${optIndex}`}
                        value={optIndex} 
                        {...register(`questions.${index}.correctOptionIndex`)} 
                        style={{ accentColor: '#69751b', width: 18, height: 18 }}
                        aria-label={`Mark Option ${optIndex + 1} as correct`}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label htmlFor={`q-${field.id}-opt-${optIndex}`} className="sr-only">Option {optIndex + 1}</label>
                      <input 
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        {...register(`questions.${index}.options.${optIndex}`)}
                        style={{ width: '100%', height: 40, padding: '0 12px', border: '1px solid #dcd9cf', borderRadius: 6 }}
                        aria-label={`Option ${optIndex + 1} text`}
                      />
                      {errors.questions?.[index]?.options?.[optIndex] && (
                        <div className="field-error">{errors.questions[index].options[optIndex].message}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        ))}

        <div style={{ textAlign: 'center' }}>
          <Button type="button" variant="secondary" onClick={() => append({ text: '', options: ['', '', '', ''], correctOptionIndex: 0 })}>
            <Plus size={16} style={{ marginRight: 6 }} /> Add Another Question
          </Button>
        </div>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12, borderTop: '1px solid #ece9e1', paddingTop: 24 }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Questions</Button>
        </div>
      </form>
    </Modal>
  );
}

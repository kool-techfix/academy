import { useState } from 'react';
import { InstructorCourse, Module, Lesson } from '@/lib/instructor-types';
import { ChevronDown, ChevronRight, Plus, Pencil, Video, FileText } from 'lucide-react';
import { Button } from '@/components/academy-ui';
import { LessonFormModal } from './lesson-form-modal';
import { QuizFormModal } from './quiz-form-modal';
import { ModuleFormModal } from './module-form-modal';

export function ModuleList({ course, onUpdate }: { course: InstructorCourse; onUpdate: (modules: Module[]) => void }) {
  return (
    <div className="stack" style={{ gap: 16 }}>
      {course.modules.map(module => (
        <ModuleItem 
          key={module.id} 
          module={module} 
          existingModules={course.modules}
          onUpdate={(updated) => {
            const newModules = course.modules.map(m => m.id === module.id ? updated : m).sort((a, b) => a.order - b.order);
            onUpdate(newModules);
          }}
        />
      ))}
    </div>
  );
}

function ModuleItem({ module, existingModules, onUpdate }: { module: Module; existingModules: Module[]; onUpdate: (m: Module) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editingModule, setEditingModule] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [managingQuiz, setManagingQuiz] = useState(false);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="row" style={{ padding: '16px 20px', background: '#faf9f5', borderBottom: expanded ? '1px solid #ece9e1' : 'none' }}>
        <button 
          type="button"
          aria-expanded={expanded}
          aria-controls={`module-content-${module.id}`}
          onClick={() => setExpanded(!expanded)}
          className="row"
          style={{ flex: 1, background: 'none', border: 'none', textAlign: 'left', padding: 0, cursor: 'pointer' }}
        >
          <div style={{ display: 'grid', placeItems: 'center', color: '#68675f', marginRight: 12 }}>
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, color: '#77766f', fontSize: 13 }}>Module {module.order}</span>
            <strong style={{ fontSize: 16, color: '#2e2e2c' }}>{module.title}</strong>
          </div>
        </button>
        <button className="button button-ghost" onClick={() => setEditingModule(true)} aria-label={`Edit Module ${module.order}`}>Edit</button>
      </div>
      
      {expanded && (
        <div id={`module-content-${module.id}`} style={{ padding: '24px 20px' }}>
          <div className="stack" style={{ gap: 24 }}>
            <div>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 15, color: '#484741' }}>Lessons</h4>
                <button className="button button-secondary" onClick={() => setAddingLesson(true)} style={{ minHeight: 32, fontSize: 12, padding: '0 12px' }}>
                  <Plus size={14} style={{ marginRight: 4 }} /> Add Lesson
                </button>
              </div>
              
              {module.lessons.length === 0 ? (
                <div style={{ padding: 16, background: '#f5f4ef', borderRadius: 6, color: '#77766f', fontSize: 13, textAlign: 'center' }}>
                  No lessons in this module.
                </div>
              ) : (
                <div className="stack" style={{ gap: 8 }}>
                  {module.lessons.map(lesson => (
                    <div key={lesson.id} className="row card" style={{ padding: '12px 16px', justifyContent: 'space-between' }}>
                      <div className="row">
                        <Video size={16} color="#8a887e" />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{lesson.title}</span>
                        {lesson.notesFilename && (
                          <div className="badge badge-muted" style={{ padding: '3px 6px', fontSize: 10 }}>
                            <FileText size={10} style={{ marginRight: 4 }} /> {lesson.notesFilename}
                          </div>
                        )}
                      </div>
                      <button 
                        type="button"
                        className="icon-button" 
                        style={{ width: 32, height: 32 }} 
                        onClick={() => setEditingLesson(lesson)}
                        aria-label={`Edit lesson: ${lesson.title}`}
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ borderTop: '1px solid #ece9e1', paddingTop: 20 }}>
               <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, color: '#484741', marginBottom: 4 }}>Module Quiz</h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#85827a' }}>{module.quizQuestions.length} questions configured.</p>
                  </div>
                  <Button variant="ghost" onClick={() => setManagingQuiz(true)}>
                    Manage Quiz Questions
                  </Button>
               </div>
            </div>
          </div>
        </div>
      )}

      {editingModule && (
        <ModuleFormModal 
          module={module} 
          existingModules={existingModules}
          onClose={() => setEditingModule(false)}
          onSave={(data) => onUpdate({ ...module, ...data })}
        />
      )}

      {(addingLesson || editingLesson) && (
        <LessonFormModal 
          lesson={editingLesson || undefined}
          onClose={() => { setAddingLesson(false); setEditingLesson(null); }}
          onSave={(data) => {
            if (editingLesson) {
              onUpdate({ ...module, lessons: module.lessons.map(l => l.id === editingLesson.id ? { ...l, ...data } : l) });
            } else {
              onUpdate({ ...module, lessons: [...module.lessons, { id: `l-${Date.now()}`, ...data }] });
            }
            setAddingLesson(false); setEditingLesson(null);
          }}
        />
      )}

      {managingQuiz && (
        <QuizFormModal
          title={`Quiz: ${module.title}`}
          questions={module.quizQuestions}
          onClose={() => setManagingQuiz(false)}
          onSave={(questions) => onUpdate({ ...module, quizQuestions: questions })}
        />
      )}
    </div>
  );
}

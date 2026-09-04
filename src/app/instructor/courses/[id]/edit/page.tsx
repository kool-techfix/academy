"use client";

import { useState } from 'react';
import { Page } from '@/components/page-shell';
import { Button, Badge } from '@/components/academy-ui';
import { useInstructorData } from '@/lib/use-instructor-data';
import { ChevronLeft, Plus } from 'lucide-react';
import { ModuleList } from '@/components/instructor/module-list';
import { FinalAssessmentEditor } from '@/components/instructor/final-assessment-editor';
import { ModuleFormModal } from '@/components/instructor/module-form-modal';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseEdit() {
const { id } = useParams<{ id: string }>();
  const { courses, updateCourse, canPublish } = useInstructorData();
  const [addingModule, setAddingModule] = useState(false);
  const courseId = id;
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <Page><div className="not-found"><h2>Course not found</h2></div></Page>;
  }

  const isPublishable = canPublish(course);

  const handlePublishToggle = () => {
    updateCourse(course.id, { 
      status: course.status === 'Draft' ? 'Published' : 'Draft' 
    });
  };

  const nextOrder = course.modules.length > 0 ? Math.max(...course.modules.map(m => m.order)) + 1 : 1;

  const handleSaveNewModule = (data: any) => {
    const newModule = {
      id: `m-${Date.now()}`,
      title: data.title,
      order: data.order,
      lessons: [],
      quizQuestions: []
    };
    const updatedModules = [...course.modules, newModule].sort((a, b) => a.order - b.order);
    updateCourse(course.id, {
      modules: updatedModules
    });
    setAddingModule(false);
  };

  return (
    <Page>
      <div style={{ maxWidth: 900, margin: '24px auto' }}>
        <Link href="/instructor" className="settings-back" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="page-head" style={{ alignItems: 'center' }}>
          <div>
            <div className="row" style={{ marginBottom: 12 }}>
              <Badge tone={course.status === 'Published' ? 'default' : 'muted'}>{course.status}</Badge>
            </div>
            <h1 style={{ fontSize: 32 }}>{course.title}</h1>
          </div>
          
          <div style={{ position: 'relative' }}>
            <Button 
              variant={course.status === 'Published' ? 'ghost' : 'primary'}
              onClick={handlePublishToggle}
              disabled={course.status === 'Draft' && !isPublishable}
            >
              {course.status === 'Published' ? 'Unpublish' : 'Publish Course'}
            </Button>
            {course.status === 'Draft' && !isPublishable && (
              <p style={{ position: 'absolute', top: '100%', right: 0, width: 220, textAlign: 'right', fontSize: 11, color: '#85827a', marginTop: 8 }}>
                Requires at least 1 module with 1 lesson and 1 quiz question.
              </p>
            )}
          </div>
        </div>

        <div className="stack" style={{ gap: 32, marginTop: 42 }}>
          <section>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h3>Modules</h3>
              <Button variant="secondary" onClick={() => setAddingModule(true)} testId="btn-add-module">
                <Plus size={16} style={{ marginRight: 6 }} /> Add Module
              </Button>
            </div>
            
            {course.modules.length === 0 ? (
              <div className="card empty-state" style={{ minHeight: 160, padding: 32 }}>
                <p>No modules yet. Add one to get started.</p>
              </div>
            ) : (
              <ModuleList course={course} onUpdate={(modules) => updateCourse(course.id, { modules })} />
            )}
          </section>

          <section style={{ paddingBottom: 64 }}>
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h3>Final Assessment</h3>
            </div>
            <FinalAssessmentEditor course={course} onUpdate={(finalAssessment) => updateCourse(course.id, { finalAssessment })} />
          </section>
        </div>

        {addingModule && (
          <ModuleFormModal 
            module={{ title: '', order: nextOrder }}
            existingModules={course.modules}
            onClose={() => setAddingModule(false)}
            onSave={handleSaveNewModule}
          />
        )}
      </div>
    </Page>
  );
}

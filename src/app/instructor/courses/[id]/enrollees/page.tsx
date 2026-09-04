
"use client";

import { Page } from '@/components/page-shell';
import { useInstructorData } from '@/lib/use-instructor-data';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EnrolleesList() {
  const { id } = useParams<{ id: string }>();
  const { courses, enrollees } = useInstructorData();
  const courseId = id;
  const course = courses.find(c => c.id === courseId);
  const courseEnrollees = courseId ? enrollees[courseId] || [] : [];

  if (!course) {
    return <Page><div className="not-found"><h2>Course not found</h2></div></Page>;
  }

  return (
    <Page>
      <div style={{ maxWidth: 1000, margin: '24px auto' }}>
        <Link href="/instructor" className="settings-back" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="page-head">
          <div>
            <h1 style={{ fontSize: 32 }}>{course.title}</h1>
            <p style={{ marginTop: 8 }}>{courseEnrollees.length} enrollees</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: 32, overflow: 'hidden' }}>
          {courseEnrollees.length === 0 ? (
            <div className="empty-state">
              <p>No one has enrolled in this course yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#faf9f5', borderBottom: '1px solid #ece9e1', color: '#77766f', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Learner Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Course Progress</th>
                    <th style={{ padding: '16px 24px', fontWeight: 700 }}>Final Assessment</th>
                    <th style={{ padding: '16px 24px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {courseEnrollees.map(enrollee => (
                    <tr key={enrollee.id} style={{ borderBottom: '1px solid #ece9e1', transition: 'background 180ms ease' }} className="enrollee-row">
                      <td style={{ padding: 0, fontWeight: 600 }}>
                        <Link 
                          href={`/instructor/courses/${course.id}/enrollees/${enrollee.id}`}
                          style={{ display: 'block', padding: '20px 24px', color: 'inherit' }}
                        >
                          {enrollee.name}
                        </Link>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, maxWidth: 200 }}>
                          <div style={{ flex: 1, height: 6, background: '#ebe9df', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${enrollee.progress}%`, background: '#d8e85c', borderRadius: 10 }} />
                          </div>
                          <span style={{ fontSize: 13, color: '#77766f', minWidth: 36, textAlign: 'right' }}>{enrollee.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', fontSize: 14 }}>
                        {typeof enrollee.finalAssessmentResult === 'number' ? (
                          <span style={{ color: enrollee.finalAssessmentResult >= 80 ? '#585d21' : '#a14943', fontWeight: 700 }}>
                            {enrollee.finalAssessmentResult}%
                          </span>
                        ) : (
                          <span style={{ color: '#98958b', fontStyle: 'italic' }}>{enrollee.finalAssessmentResult}</span>
                        )}
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <Link 
                          href={`/instructor/courses/${course.id}/enrollees/${enrollee.id}`}
                          className="button button-ghost"
                          style={{ minHeight: 32, padding: '0 12px' }}
                          aria-label={`View details for ${enrollee.name}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}

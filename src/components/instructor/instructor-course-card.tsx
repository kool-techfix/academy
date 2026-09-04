import { Badge } from '@/components/academy-ui';
import { InstructorCourse } from '@/lib/instructor-types';
import { Users, FileEdit } from 'lucide-react';
import { useInstructorData } from '@/lib/use-instructor-data';
import Link from 'next/link';

export function InstructorCourseCard({ course }: { course: InstructorCourse }) {
  const { enrollees } = useInstructorData();
  const enrolleeCount = enrollees[course.id]?.length ?? course.enrolleeCount;

  return (
    <article className="card course-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="course-card-body" style={{ flex: 1 }}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <Badge tone={course.status === 'Published' ? 'default' : 'muted'}>
            {course.status}
          </Badge>
          <span style={{ fontSize: 13, color: '#85827a' }}>{enrolleeCount} enrollees</span>
        </div>
        <h3 style={{ fontSize: 18, marginBottom: 8, lineHeight: 1.3 }}>{course.title}</h3>
        <p style={{ color: '#77766f', fontSize: 14 }}>{course.modules.length} modules</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #ece9e1' }}>
        <Link 
          href={`/instructor/courses/${course.id}/edit`} 
          className="button button-ghost"
          style={{ border: 'none', borderRadius: 0, borderRight: '1px solid #ece9e1', height: 48 }}
        >
          <FileEdit size={16} style={{ marginRight: 6 }} /> Edit
        </Link>
        <Link 
          href={`/instructor/courses/${course.id}/enrollees`} 
          className="button button-ghost"
          style={{ border: 'none', borderRadius: 0, height: 48 }}
          data-testid={`link-enrollees-${course.id}`}
        >
          <Users size={16} style={{ marginRight: 6 }} /> View Enrollees
        </Link>
      </div>
    </article>
  );
}

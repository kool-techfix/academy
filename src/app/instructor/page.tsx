"use client";
import { Page } from '@/components/page-shell';
import { Button } from '@/components/academy-ui';
import { useInstructorData } from '@/lib/use-instructor-data';
import { InstructorCourseCard } from '@/components/instructor/instructor-course-card';
import { BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InstructorDashboard() {
  const { courses } = useInstructorData();
  const router = useRouter();

  return (
    <Page>
      <div className="section-head" style={{ marginTop: 24 }}>
        <h2>My Courses</h2>
        <Button onClick={() => router.push('/instructor/courses/new')}>Add New Course</Button>
      </div>
      
      {courses.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon"><BookOpen size={24} /></div>
          <h3>No courses yet</h3>
          <p style={{ maxWidth: 400, margin: '14px auto 24px' }}>
            Start sharing your knowledge by creating your first course.
          </p>
          <Button onClick={() => router.push('/instructor/courses/new')} testId="btn-empty-add-course">Add New Course</Button>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <InstructorCourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </Page>
  );
}

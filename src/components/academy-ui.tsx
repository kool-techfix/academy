import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { courses } from '@/lib/academy-data';
import type { Course } from '@/lib/academy-types';
import Link from 'next/link';

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  testId,
  type = 'button',
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
  disabled?: boolean;
  testId?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'muted' | 'coral' | 'dark';
}) {
  return (
    <span
      className={`badge badge-${tone}`}
      data-testid={`status-${String(children).toLowerCase().replaceAll(' ', '-')}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, label = 'Progress' }: { value: number; label?: string }) {
  return (
    <div data-testid={`progress-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className="progress-meta">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function CourseCard({
  course,
  mode = 'grid',
  visitor = false,
}: {
  course: Course;
  mode?: 'grid' | 'list';
  visitor?: boolean;
}) {
  const action =
    visitor
      ? 'Get Started'
      : course.status === 'complete'
      ? 'Review course'
      : course.status === 'in-progress'
        ? 'Continue learning'
        : 'View course';

  return (
    <article className="card course-card" data-testid={`card-course-${course.id}`}>
      <Link
        href={`/courses/${course.id}`}
        className="course-art "
        data-accent={course.accent}
        aria-label={`Open ${course.title}`}
      >
        <span
          className={`course-number ${
            String(courses.indexOf(course) + 1).padStart(2, '0') === '03' ? 'text-white' : ''
          }`}
        >
          {String(courses.indexOf(course) + 1).padStart(2, '0')}
        </span>
      </Link>
      <div className="course-card-body">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Badge
            tone={
              course.status === 'complete'
                ? 'coral'
                : course.status === 'in-progress'
                  ? 'default'
                  : 'muted'
            }
          >
            {course.status === 'complete'
              ? 'Completed'
              : course.status === 'in-progress'
                ? 'In progress'
                : 'Available'}
          </Badge>
          <span style={{ fontSize: 12, color: '#85827a' }}>{course.level}</span>
        </div>
        <Link href={`/courses/${course.id}`} data-testid={`link-course-title-${course.id}`}>
          <h3>{course.title}</h3>
        </Link>
        <p>{course.shortDescription}</p>
        {course.progress > 0 && (
          <ProgressBar value={course.progress} label={course.progress === 100 ? 'Complete' : 'Your progress'} />
        )}
        <div className="course-card-foot mt-3">
          <span>
            {course.moduleCount} modules · {course.duration}
          </span>
          <Link
            href={visitor ? '/register' : `/courses/${course.id}`}
            className="button button-ghost"
            style={{ minHeight: 33, padding: '0 10px' }}
            data-testid={`link-course-action-${course.id}`}
          >
            {visitor || mode === 'list' ? action : <ChevronRight size={16} aria-label={action} />}
          </Link>
        </div>
      </div>
    </article>
  );
}
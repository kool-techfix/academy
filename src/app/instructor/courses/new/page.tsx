"use client";


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Page } from '@/components/page-shell';
import { Button } from '@/components/academy-ui';
import { FormField } from '@/components/form-field';
import { useInstructorData } from '@/lib/use-instructor-data';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description is too long")
});

type FormData = z.infer<typeof schema>;

export default function CourseNew() {
    const router = useRouter();
  const { addCourse } = useInstructorData();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data: FormData) => {
    const course = addCourse(data);
    router.push(`/instructor/courses/${course.id}/edit`);
  };

  return (
    <Page>
      <div className="settings-layout" style={{ margin: '24px auto' }}>
        <Link href="/instructor" className="settings-back" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
        <div className="card settings-section">
          <div className="settings-section-heading">
            <h2>Create New Course</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="stack">
            <FormField
              label="Course Title"
              name="title"
              register={register}
              error={errors.title?.message}
              placeholder="e.g. Advanced Hardware Diagnostics"
            />
            <div className="form-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="What will learners achieve in this course?"
                {...register('description')}
                aria-invalid={Boolean(errors.description)}
                style={{ width: '100%', minHeight: 120, padding: '12px 13px', border: '1px solid #dcd9cf', borderRadius: 6, background: '#fff', color: '#2e2e2c', fontFamily: 'inherit', fontSize: 'inherit', resize: 'vertical' }}
              />
              {errors.description && (
                <div className="field-error">{errors.description.message}</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button type="submit" disabled={isSubmitting}>Create Draft</Button>
            </div>
          </form>
        </div>
      </div>
    </Page>
  );
}

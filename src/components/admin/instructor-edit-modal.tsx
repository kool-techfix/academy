import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/academy-ui';
import { FormField } from '@/components/form-field';
import { Modal } from '@/components/instructor/modal';
import { expertiseOptions, type AdminInstructor } from '@/lib/admin-data';

const instructorEditSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  expertise: z.string().trim().min(1, 'Expertise is required'),
});

type InstructorEditValues = z.infer<typeof instructorEditSchema>;

export function InstructorEditModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminInstructor;
  onClose: () => void;
  onSave: (values: InstructorEditValues) => void;
}) {
  const form = useForm<InstructorEditValues>({
    resolver: zodResolver(instructorEditSchema),
    defaultValues: { name: user.name, email: user.email, expertise: user.expertise },
  });

  return (
    <Modal title="Edit instructor" onClose={onClose}>
      <form onSubmit={form.handleSubmit(onSave)} noValidate>
        <FormField label="Name" name="name" placeholder="Full name" register={form.register} error={form.formState.errors.name?.message} />
        <FormField label="Email address" name="email" type="email" placeholder="name@example.com" register={form.register} error={form.formState.errors.email?.message} />
        <div className="form-field">
          <label htmlFor="admin-expertise">Area of expertise</label>
          <select id="admin-expertise" {...form.register('expertise')} aria-invalid={Boolean(form.formState.errors.expertise)}>
            <option value="">Select an area</option>
            {expertiseOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            {!expertiseOptions.includes(user.expertise as typeof expertiseOptions[number]) && (
              <option value={user.expertise}>{user.expertise}</option>
            )}
          </select>
          {form.formState.errors.expertise && <div className="field-error">{form.formState.errors.expertise.message}</div>}
        </div>
        <div className="admin-modal-actions">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" testId="button-save-instructor">Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}
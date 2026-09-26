import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/academy-ui';
import { FormField } from '@/components/form-field';
import { Modal } from '@/components/instructor/modal';
import type { AdminLearner } from '@/lib/admin-data';

const learnerEditSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
});

type LearnerEditValues = z.infer<typeof learnerEditSchema>;

export function LearnerEditModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminLearner;
  onClose: () => void;
  onSave: (values: LearnerEditValues) => void;
}) {
  const form = useForm<LearnerEditValues>({
    resolver: zodResolver(learnerEditSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  return (
    <Modal title="Edit learner" onClose={onClose}>
      <form onSubmit={form.handleSubmit(onSave)} noValidate>
        <FormField label="Name" name="name" placeholder="Full name" register={form.register} error={form.formState.errors.name?.message} />
        <FormField label="Email address" name="email" type="email" placeholder="name@example.com" register={form.register} error={form.formState.errors.email?.message} />
        <div className="admin-modal-actions">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" testId="button-save-learner">Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}
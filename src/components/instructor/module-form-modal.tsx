import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from './modal';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/academy-ui';

export function ModuleFormModal({ module, existingModules = [], onClose, onSave }: { module: any, existingModules?: any[], onClose: () => void, onSave: (d: any) => void }) {
  const moduleSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    order: z.coerce.number().min(1, "Order must be positive").refine(
      (val) => !existingModules.some(m => m.id !== module.id && m.order === val),
      { message: "Order must be unique" }
    )
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: module.title, order: module.order }
  });

  return (
    <Modal title={module.id ? 'Edit Module' : 'Add Module'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSave)} className="stack">
        <FormField label="Module Title" name="title" register={register} error={errors.title?.message as string} placeholder="e.g. Introduction" />
        <FormField label="Order" name="order" type="number" register={register} error={errors.order?.message as string} placeholder="1" />
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Module</Button>
        </div>
      </form>
    </Modal>
  );
}

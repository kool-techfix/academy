import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "./modal";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/academy-ui";
import { Module } from "@/lib/instructor-types";

type ModuleFormData = { title: string; order: number };
type ModuleFormModalProps = {
  module: Module;
  existingModules?: Module[];
  onClose: () => void;
  onSave: (data: ModuleFormData) => void;
  isSaving?: boolean;
};
const createModuleSchema = (currentModule: Module, existingModules: Module[]) =>
  z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    order: z.coerce
      .number()
      .min(1, "Order must be positive")
      .refine(
        (val) =>
          !existingModules.some(
            (m) => m.id !== currentModule.id && m.order === val,
          ),
        { message: "Order must be unique" },
      ),
  });

export function ModuleFormModal({
  module,
  existingModules = [],
  onClose,
  onSave,
  isSaving,
}: ModuleFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createModuleSchema(module, existingModules)),
    defaultValues: { title: module.title, order: module.order },
  });

  return (
    <Modal title={module.id ? "Edit Module" : "Add Module"} onClose={onClose}>
      <form onSubmit={handleSubmit(onSave)} className="stack">
        <FormField
          label="Module Title"
          name="title"
          register={register}
          error={errors.title?.message as string}
          placeholder="e.g. Introduction"
        />
        <FormField
          label="Order"
          name="order"
          type="number"
          register={register}
          error={errors.order?.message as string}
          placeholder="1"
        />
        <div
          className="row"
          style={{ justifyContent: "flex-end", marginTop: 12 }}
        >
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Module"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

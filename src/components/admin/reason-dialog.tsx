"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/academy-ui";
import { Modal } from "@/components/instructor/modal";
import {
  moderationReasonSchema,
  type ModerationReasonInput,
} from "@/Schemas/admin.schema";

/**
 * Confirmation dialog for moderation actions that require a reason
 * (reject, flag, remove, suspend). Uses the same schema as the API.
 */
export function ReasonDialog({
  title,
  description,
  confirmLabel,
  isPending,
  error,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  isPending: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModerationReasonInput>({
    resolver: zodResolver(moderationReasonSchema),
    defaultValues: { reason: "" },
  });

  return (
    <Modal title={title} onClose={isPending ? () => {} : onCancel}>
      <form
        onSubmit={handleSubmit(({ reason }) => onConfirm(reason))}
        noValidate
      >
        <p className="admin-dialog-copy">{description}</p>

        <div className="form-field admin-reason-field">
          <label htmlFor="moderation-reason">Reason</label>
          <textarea
            id="moderation-reason"
            placeholder="Explain why you are taking this action"
            aria-invalid={Boolean(errors.reason)}
            disabled={isPending}
            {...register("reason")}
            data-testid="input-moderation-reason"
          />
          {errors.reason && (
            <div className="field-error">{errors.reason.message}</div>
          )}
        </div>

        {error && (
          <div className="field-error" role="alert" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div className="admin-dialog-actions">
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={isPending}
            testId="button-confirm-moderation"
          >
            {isPending ? "Saving..." : confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

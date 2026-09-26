"use client";

import { Button } from "@/components/academy-ui";
import { Modal } from "@/components/instructor/modal";

/**
 * Confirmation dialog for moderation actions without a reason
 * (approve, reinstate, restore).
 */
export function ConfirmDialog({
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
  onConfirm: () => void;
}) {
  return (
    <Modal title={title} onClose={isPending ? () => {} : onCancel}>
      <p className="admin-dialog-copy">{description}</p>

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
          onClick={onConfirm}
          disabled={isPending}
          testId="button-confirm-action"
        >
          {isPending ? "Saving..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

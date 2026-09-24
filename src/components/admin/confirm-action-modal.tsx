import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/academy-ui';
import { Modal } from '@/components/instructor/modal';

export function ConfirmActionModal({
  name,
  onClose,
  onConfirm,
}: {
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title="Suspend account" onClose={onClose}>
      <div className="confirm-action">
        <div className="confirm-action-icon"><AlertTriangle size={20} /></div>
        <p>
          Suspend <strong>{name}</strong>? They will be blocked from signing in until reinstated.
        </p>
        <div className="admin-modal-actions">
          <Button variant="ghost" onClick={onClose}>Keep account active</Button>
          <Button onClick={onConfirm} testId="button-confirm-suspend">Suspend account</Button>
        </div>
      </div>
    </Modal>
  );
}
import { useState } from 'react';
import { Link } from 'wouter';
import { Button, Badge } from '@/components/academy-ui';
import { ConfirmActionModal } from '@/components/admin/confirm-action-modal';
import { LearnerEditModal } from '@/components/admin/learner-edit-modal';
import { Page } from '@/components/page-shell';
import { useAdminData } from '@/lib/use-admin-data';
import type { AdminLearner } from '@/lib/admin-data';

export default function ManageLearners() {
  const { learners, updateLearnerStatus, updateLearner } = useAdminData();
  const [editing, setEditing] = useState<AdminLearner | null>(null);
  const [suspending, setSuspending] = useState<AdminLearner | null>(null);

  return (
    <Page>
      <Link href="/admin" className="settings-back">← Admin overview</Link>
      <div className="page-head admin-page-head">
        <div>
          <span className="eyebrow">Learner accounts</span>
          <h1>Manage Learners</h1>
          <p>Keep learner details accurate and make account access easy to understand.</p>
        </div>
      </div>
      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {learners.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong><span>{user.email}</span></td>
                <td><Badge tone={user.status === 'Active' ? 'success' : 'error'}>{user.status}</Badge></td>
                <td>
                  <div className="admin-row-actions">
                    <Button variant="ghost" onClick={() => setEditing(user)} testId={`button-edit-learner-${user.id}`}>Edit</Button>
                    {user.status === 'Active' ? (
                      <Button variant="secondary" onClick={() => setSuspending(user)} testId={`button-suspend-learner-${user.id}`}>Suspend</Button>
                    ) : (
                      <Button onClick={() => updateLearnerStatus(user.id, 'Active')} testId={`button-reinstate-learner-${user.id}`}>Reinstate</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <LearnerEditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            updateLearner(editing.id, values);
            setEditing(null);
          }}
        />
      )}
      {suspending && (
        <ConfirmActionModal
          name={suspending.name}
          onClose={() => setSuspending(null)}
          onConfirm={() => {
            updateLearnerStatus(suspending.id, 'Suspended');
            setSuspending(null);
          }}
        />
      )}
    </Page>
  );
}
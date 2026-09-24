import { useState } from 'react';
import { Link } from 'wouter';
import { Button, Badge } from '@/components/academy-ui';
import { ConfirmActionModal } from '@/components/admin/confirm-action-modal';
import { InstructorEditModal } from '@/components/admin/instructor-edit-modal';
import { Page } from '@/components/page-shell';
import { useAdminData } from '@/lib/use-admin-data';
import type { AdminInstructor } from '@/lib/admin-data';

function statusTone(status: AdminInstructor['status']) {
  return status === 'Approved' ? 'success' : status === 'Pending' ? 'warning' : 'error';
}

export default function ManageInstructors() {
  const { instructors, updateInstructorStatus, updateInstructor } = useAdminData();
  const [editing, setEditing] = useState<AdminInstructor | null>(null);
  const [suspending, setSuspending] = useState<AdminInstructor | null>(null);

  return (
    <Page>
      <Link href="/admin" className="settings-back">← Admin overview</Link>
      <div className="page-head admin-page-head">
        <div>
          <span className="eyebrow">People and access</span>
          <h1>Manage Instructors</h1>
          <p>Approve instructors, keep profiles current, and manage access to course authoring.</p>
        </div>
      </div>
      <div className="admin-table-wrap card">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Area of expertise</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {instructors.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong><span>{user.email}</span></td>
                <td>{user.expertise}</td>
                <td><Badge tone={statusTone(user.status)}>{user.status}</Badge></td>
                <td>
                  <div className="admin-row-actions">
                    <Button variant="ghost" onClick={() => setEditing(user)} testId={`button-edit-instructor-${user.id}`}>Edit</Button>
                    {user.status === 'Pending' && (
                      <Button onClick={() => updateInstructorStatus(user.id, 'Approved')} testId={`button-approve-instructor-${user.id}`}>Approve</Button>
                    )}
                    {user.status === 'Approved' && (
                      <Button variant="secondary" onClick={() => setSuspending(user)} testId={`button-suspend-instructor-${user.id}`}>Suspend</Button>
                    )}
                    {user.status === 'Suspended' && (
                      <Button onClick={() => updateInstructorStatus(user.id, 'Approved')} testId={`button-reinstate-instructor-${user.id}`}>Reinstate</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <InstructorEditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            updateInstructor(editing.id, values);
            setEditing(null);
          }}
        />
      )}
      {suspending && (
        <ConfirmActionModal
          name={suspending.name}
          onClose={() => setSuspending(null)}
          onConfirm={() => {
            updateInstructorStatus(suspending.id, 'Suspended');
            setSuspending(null);
          }}
        />
      )}
    </Page>
  );
}
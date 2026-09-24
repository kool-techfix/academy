"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import {
  AdminBackLink,
  AdminEmptyState,
  AdminLoading,
  AdminNotice,
  formatDate,
} from "@/components/admin/admin-page-states";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ReasonDialog } from "@/components/admin/reason-dialog";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/academy-ui";
import { Page } from "@/components/page-shell";
import {
  useAdminUsers,
  useReinstateUser,
  useRemoveUser,
  useSuspendUser,
} from "@/hooks/admin/use-admin-users";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { AdminUser, ModeratedRole } from "@/Services/admin.service";

const ROLE_TABS: { label: string; value: ModeratedRole }[] = [
  { label: "Learners", value: "LEARNER" },
  { label: "Instructors", value: "INSTRUCTOR" },
];

type Action = {
  type: "suspend" | "remove" | "reinstate";
  user: AdminUser;
};

function roleLabel(role: ModeratedRole) {
  return role === "INSTRUCTOR" ? "instructor" : "learner";
}

function canSuspend(user: AdminUser) {
  return user.role === "INSTRUCTOR"
    ? user.status === "APPROVED"
    : user.status === "ACTIVE";
}

export default function AdminUsersPage() {
  const [role, setRole] = useState<ModeratedRole>("LEARNER");
  const [action, setAction] = useState<Action | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: users = [], isLoading, isError, error } = useAdminUsers(role);
  const suspend = useSuspendUser();
  const remove = useRemoveUser();
  const reinstate = useReinstateUser();

  const mutation =
    action?.type === "suspend" ? suspend : action?.type === "remove" ? remove : reinstate;

  const closeDialog = () => {
    suspend.reset();
    remove.reset();
    reinstate.reset();
    setAction(null);
  };

  const runAction = async (reason?: string) => {
    if (!action) return;

    const { user } = action;

    if (action.type === "suspend" && reason) {
      await suspend.mutateAsync({ id: user.id, reason });
      setNotice(`${user.name} has been suspended.`);
    } else if (action.type === "remove" && reason) {
      await remove.mutateAsync({ id: user.id, reason });
      setNotice(`${user.name}'s account has been removed.`);
    } else if (action.type === "reinstate") {
      await reinstate.mutateAsync(user.id);
      setNotice(`${user.name} has been reinstated.`);
    }
    closeDialog();
  };

  return (
    <Page>
      <AdminBackLink />

      <div className="page-head">
        <div>
          <span className="eyebrow">User moderation</span>
          <h1>Users</h1>
          <p>Suspend or remove accounts that violate platform rules. History is always preserved.</p>
        </div>
      </div>

      {notice && <AdminNotice message={notice} onDismiss={() => setNotice(null)} />}

      <div className="auth-tabs" role="tablist" aria-label="Filter users by role">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={role === tab.value}
            className={`auth-tab ${role === tab.value ? "active" : ""}`}
            onClick={() => setRole(tab.value)}
            data-testid={`tab-users-${tab.value.toLowerCase()}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <AdminLoading message="Loading users..." />
      ) : isError ? (
        <AdminEmptyState
          icon={<Users size={24} />}
          title="Unable to load users"
          message={getApiErrorMessage(error)}
        />
      ) : users.length === 0 ? (
        <AdminEmptyState
          icon={<Users size={24} />}
          title={`No ${roleLabel(role)}s yet`}
          message={`Registered ${roleLabel(role)}s will appear here.`}
        />
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} data-testid={`row-user-${user.id}`}>
                  <td>
                    <strong>{user.name}</strong>
                    <span className="admin-sub">{user.email}</span>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{roleLabel(user.role)}</td>
                  <td>
                    <StatusBadge status={user.status} />
                    {user.moderationReason && (
                      <span className="admin-reason">{user.moderationReason}</span>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    {user.status !== "REMOVED" && (
                      <div className="admin-row-actions">
                        {canSuspend(user) && (
                          <Button
                            variant="ghost"
                            onClick={() => setAction({ type: "suspend", user })}
                            testId={`button-suspend-${user.id}`}
                          >
                            Suspend
                          </Button>
                        )}
                        {user.status === "SUSPENDED" && (
                          <Button
                            onClick={() => setAction({ type: "reinstate", user })}
                            testId={`button-reinstate-${user.id}`}
                          >
                            Reinstate
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => setAction({ type: "remove", user })}
                          testId={`button-remove-${user.id}`}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {action?.type === "suspend" && (
        <ReasonDialog
          title={`Suspend ${roleLabel(action.user.role)}?`}
          description={
            action.user.role === "INSTRUCTOR"
              ? `${action.user.name} will lose access to instructor tools. Their courses and learner records are kept.`
              : `${action.user.name} will be signed out and blocked from learning. Their enrollments and progress are kept.`
          }
          confirmLabel="Suspend"
          isPending={mutation.isPending}
          error={mutation.isError ? getApiErrorMessage(mutation.error) : null}
          onCancel={closeDialog}
          onConfirm={(reason) => runAction(reason).catch(() => {})}
        />
      )}

      {action?.type === "remove" && (
        <ReasonDialog
          title={`Remove ${roleLabel(action.user.role)}?`}
          description={`${action.user.name}'s account will be permanently blocked from signing in. This cannot be undone here, but their historical records are kept.`}
          confirmLabel="Remove account"
          isPending={mutation.isPending}
          error={mutation.isError ? getApiErrorMessage(mutation.error) : null}
          onCancel={closeDialog}
          onConfirm={(reason) => runAction(reason).catch(() => {})}
        />
      )}

      {action?.type === "reinstate" && (
        <ConfirmDialog
          title={`Reinstate ${roleLabel(action.user.role)}`}
          description={`Restore ${action.user.name}'s access?`}
          confirmLabel="Reinstate"
          isPending={mutation.isPending}
          error={mutation.isError ? getApiErrorMessage(mutation.error) : null}
          onCancel={closeDialog}
          onConfirm={() => runAction().catch(() => {})}
        />
      )}
    </Page>
  );
}

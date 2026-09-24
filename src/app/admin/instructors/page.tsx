"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

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
  useAdminInstructors,
  useApproveInstructor,
  useRejectInstructor,
} from "@/hooks/admin/use-admin-instructors";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { AdminInstructor } from "@/Services/admin.service";
import type { InstructorStatus } from "@/Services/auth.service";

const FILTERS: { label: string; value?: InstructorStatus }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "All" },
];

type PendingAction = {
  type: "approve" | "reject";
  instructor: AdminInstructor;
};

type Notice = {
  message: string;
  tone: "success" | "warning";
};

export default function AdminInstructorsPage() {
  const [filter, setFilter] = useState<InstructorStatus | undefined>("PENDING");
  const [action, setAction] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const { data: instructors = [], isLoading, isError, error } =
    useAdminInstructors(filter);
  const approve = useApproveInstructor();
  const reject = useRejectInstructor();

  const mutation = action?.type === "reject" ? reject : approve;

  const closeDialog = () => {
    approve.reset();
    reject.reset();
    setAction(null);
  };

  const announce = (verb: string, name: string, emailSent: boolean) =>
    setNotice(
      emailSent
        ? { tone: "success", message: `${name} was ${verb}. We emailed them the decision.` }
        : {
            tone: "warning",
            message: `${name} was ${verb}, but the notification email could not be sent.`,
          },
    );

  const handleApprove = async () => {
    if (!action) return;

    const { emailSent } = await approve.mutateAsync(action.instructor.id);
    announce("approved", action.instructor.name, emailSent);
    closeDialog();
  };

  const handleReject = async (reason: string) => {
    if (!action) return;

    const { emailSent } = await reject.mutateAsync({
      id: action.instructor.id,
      reason,
    });
    announce("rejected", action.instructor.name, emailSent);
    closeDialog();
  };

  return (
    <Page>
      <AdminBackLink />

      <div className="page-head">
        <div>
          <span className="eyebrow">Instructor moderation</span>
          <h1>Instructors</h1>
          <p>Review new instructor applications and decide who can publish courses.</p>
        </div>
      </div>

      {notice && (
        <AdminNotice
          message={notice.message}
          tone={notice.tone}
          onDismiss={() => setNotice(null)}
        />
      )}

      <div className="auth-tabs" role="tablist" aria-label="Filter instructors">
        {FILTERS.map((option) => (
          <button
            key={option.label}
            type="button"
            role="tab"
            aria-selected={filter === option.value}
            className={`auth-tab ${filter === option.value ? "active" : ""}`}
            onClick={() => setFilter(option.value)}
            data-testid={`tab-instructors-${option.label.toLowerCase()}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <AdminLoading message="Loading instructors..." />
      ) : isError ? (
        <AdminEmptyState
          icon={<ShieldCheck size={24} />}
          title="Unable to load instructors"
          message={getApiErrorMessage(error)}
        />
      ) : instructors.length === 0 ? (
        <AdminEmptyState
          icon={<ShieldCheck size={24} />}
          title={filter === "PENDING" ? "No pending applications" : "No instructors"}
          message={
            filter === "PENDING"
              ? "New instructor applications will appear here for review."
              : "There are no instructors with this status."
          }
        />
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Instructor</th>
                <th>Expertise</th>
                <th>Registered</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {instructors.map((instructor) => (
                <tr key={instructor.id} data-testid={`row-instructor-${instructor.id}`}>
                  <td>
                    <strong>{instructor.name}</strong>
                    <span className="admin-sub">{instructor.email}</span>
                  </td>
                  <td>{instructor.expertise ?? "—"}</td>
                  <td>{formatDate(instructor.createdAt)}</td>
                  <td>
                    <StatusBadge status={instructor.instructorStatus ?? "PENDING"} />
                    {instructor.moderationReason && (
                      <span className="admin-reason">{instructor.moderationReason}</span>
                    )}
                  </td>
                  <td>
                    {instructor.instructorStatus === "PENDING" && (
                      <div className="admin-row-actions">
                        <Button
                          variant="ghost"
                          onClick={() => setAction({ type: "reject", instructor })}
                          testId={`button-reject-${instructor.id}`}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => setAction({ type: "approve", instructor })}
                          testId={`button-approve-${instructor.id}`}
                        >
                          Approve
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

      {action?.type === "approve" && (
        <ConfirmDialog
          title="Approve instructor"
          description={`Approve ${action.instructor.name}? They will be able to create and publish courses, and will receive an approval email.`}
          confirmLabel="Approve"
          isPending={mutation.isPending}
          error={mutation.isError ? getApiErrorMessage(mutation.error) : null}
          onCancel={closeDialog}
          onConfirm={() => handleApprove().catch(() => {})}
        />
      )}

      {action?.type === "reject" && (
        <ReasonDialog
          title="Reject instructor"
          description={`Reject ${action.instructor.name}'s application? The reason below will be included in the email we send them.`}
          confirmLabel="Reject"
          isPending={mutation.isPending}
          error={mutation.isError ? getApiErrorMessage(mutation.error) : null}
          onCancel={closeDialog}
          onConfirm={(reason) => handleReject(reason).catch(() => {})}
        />
      )}
    </Page>
  );
}

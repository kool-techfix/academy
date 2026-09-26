import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export function AdminBackLink({
  href = "/admin",
  label = "Admin overview",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="settings-back"
      style={{ display: "flex", alignItems: "center", gap: 6 }}
    >
      <ArrowLeft size={14} /> {label}
    </Link>
  );
}

export function AdminLoading({ message }: { message: string }) {
  return (
    <div className="card empty-state" role="status" aria-live="polite">
      <Loader2 size={22} className="animate-spin" />
      <p>{message}</p>
    </div>
  );
}

export function AdminEmptyState({
  icon,
  title,
  message,
}: {
  icon: ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="card empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p style={{ maxWidth: 420, margin: "10px auto 0" }}>{message}</p>
    </div>
  );
}

export function AdminNotice({
  message,
  tone = "success",
  onDismiss,
}: {
  message: string;
  tone?: "success" | "warning";
  onDismiss: () => void;
}) {
  return (
    <div
      className={`form-success admin-notice ${tone === "warning" ? "warning" : ""}`}
      role="status"
    >
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}

export function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

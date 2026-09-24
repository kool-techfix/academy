import { Badge } from "@/components/academy-ui";

type Tone = "default" | "muted" | "coral" | "dark";

const STATUS_DISPLAY: Record<string, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "default" },
  APPROVED: { label: "Approved", tone: "default" },
  PENDING: { label: "Pending", tone: "muted" },
  REJECTED: { label: "Rejected", tone: "coral" },
  SUSPENDED: { label: "Suspended", tone: "coral" },
  REMOVED: { label: "Removed", tone: "dark" },
  PUBLISHED: { label: "Published", tone: "default" },
  DRAFT: { label: "Draft", tone: "muted" },
  FLAGGED: { label: "Flagged", tone: "coral" },
};

export function StatusBadge({ status }: { status: string }) {
  const display = STATUS_DISPLAY[status] ?? { label: status, tone: "muted" };

  return <Badge tone={display.tone}>{display.label}</Badge>;
}

import { Page } from "@/components/page-shell";
import { getCurrentUser } from "@/lib/auth/auth-guard";

const COPY: Record<string, { badge: string; title: string; body: string }> = {
  PENDING: {
    badge: "Pending review",
    title: "Your application is being reviewed.",
    body: "Thanks for applying to teach. An admin will review your application and we'll email you as soon as there's a decision. You can't manage courses until it's approved.",
  },
  REJECTED: {
    badge: "Not approved",
    title: "Your application wasn't approved.",
    body: "We weren't able to approve your instructor account this time. Check your email for the reason, and reply to it if you have questions.",
  },
  SUSPENDED: {
    badge: "Suspended",
    title: "Your instructor account is suspended.",
    body: "Your access to the instructor workspace is paused. Check your email for details, or reply to it to get in touch with us.",
  },
};

/** Shown to instructors who are pending, rejected or suspended. */
export default async function InstructorStatus() {
  const user = await getCurrentUser();
  const copy = COPY[user?.instructorStatus ?? "PENDING"] ?? COPY.PENDING;

  return (
    <Page>
      <div className="card status-card" data-testid="card-instructor-status">
        <span
          className={`badge ${user?.instructorStatus === "PENDING" ? "" : "badge-coral"}`}
          data-testid="text-instructor-status"
        >
          {copy.badge}
        </span>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        {user?.expertise && (
          <p className="status-meta">
            Area of expertise: <strong>{user.expertise}</strong>
          </p>
        )}
      </div>
    </Page>
  );
}

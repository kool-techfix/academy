import { sendEmail } from "@/lib/email/email-transport";

type Recipient = {
  name: string;
  email: string;
};

const ACADEMY_NAME = "KoolTech Fix IT Academy";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loginUrl() {
  const baseUrl = process.env.APP_URL?.replace(/\/$/, "");

  return baseUrl ? `${baseUrl}/login` : null;
}

function layout(bodyHtml: string) {
  return `<div style="font-family:Arial,sans-serif;background:#faf9f5;padding:32px;color:#2e2e2c">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e2d9;border-radius:10px;padding:32px">
    <p style="margin:0 0 24px;font-weight:700">${ACADEMY_NAME}</p>
    ${bodyHtml}
    <p style="margin:32px 0 0;color:#77766f;font-size:13px">— The ${ACADEMY_NAME} team</p>
  </div>
</div>`;
}

export class InstructorEmailService {
  async sendApproval(recipient: Recipient) {
    const url = loginUrl();
    const name = escapeHtml(recipient.name);

    await sendEmail({
      to: recipient.email,
      subject: `Your instructor account has been approved`,
      text: [
        `Hi ${recipient.name},`,
        "",
        `Good news — your instructor account at ${ACADEMY_NAME} has been approved.`,
        "You can now sign in and start creating and publishing courses.",
        ...(url ? ["", `Sign in: ${url}`] : []),
        "",
        `— The ${ACADEMY_NAME} team`,
      ].join("\n"),
      html: layout(`
    <p>Hi ${name},</p>
    <p>Good news — your instructor account at ${ACADEMY_NAME} has been <strong>approved</strong>.</p>
    <p>You can now sign in and start creating and publishing courses.</p>
    ${url ? `<p style="margin-top:24px"><a href="${escapeHtml(url)}" style="display:inline-block;background:#d8e85c;color:#2e2e2c;padding:12px 18px;border-radius:6px;font-weight:700;text-decoration:none">Sign in</a></p>` : ""}`),
    });
  }

  async sendRejection(recipient: Recipient, reason: string) {
    const name = escapeHtml(recipient.name);

    await sendEmail({
      to: recipient.email,
      subject: `Update on your instructor application`,
      text: [
        `Hi ${recipient.name},`,
        "",
        `Thank you for applying to teach at ${ACADEMY_NAME}.`,
        "After reviewing your application, we are unable to approve your instructor account at this time.",
        "",
        "Reason:",
        reason,
        "",
        "If you have questions about this decision, please reply to this email.",
        "",
        `— The ${ACADEMY_NAME} team`,
      ].join("\n"),
      html: layout(`
    <p>Hi ${name},</p>
    <p>Thank you for applying to teach at ${ACADEMY_NAME}.</p>
    <p>After reviewing your application, we are unable to approve your instructor account at this time.</p>
    <div style="margin:20px 0;padding:16px;background:#faf9f5;border-left:3px solid #f2a79e;border-radius:4px">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#77766f;text-transform:uppercase;letter-spacing:.08em">Reason</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(reason)}</p>
    </div>
    <p>If you have questions about this decision, please reply to this email.</p>`),
    });
  }
}

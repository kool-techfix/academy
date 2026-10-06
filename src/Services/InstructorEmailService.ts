import { brandColors as c } from "@/lib/brand-colors";
import { sendEmail } from "@/lib/email/email-transport";
import { ACADEMY_NAME, emailLayout, escapeHtml } from "@/lib/email/template";

type Recipient = {
  name: string;
  email: string;
};

function loginUrl() {
  const baseUrl = process.env.APP_URL?.replace(/\/$/, "");

  return baseUrl ? `${baseUrl}/login` : null;
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
      html: emailLayout(`
    <p>Hi ${name},</p>
    <p>Good news — your instructor account at ${ACADEMY_NAME} has been <strong>approved</strong>.</p>
    <p>You can now sign in and start creating and publishing courses.</p>
    ${url ? `<p style="margin-top:24px"><a href="${escapeHtml(url)}" style="display:inline-block;background:${c.green};color:${c.white};padding:12px 18px;border-radius:6px;font-weight:700;text-decoration:none">Sign in</a></p>` : ""}`),
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
      html: emailLayout(`
    <p>Hi ${name},</p>
    <p>Thank you for applying to teach at ${ACADEMY_NAME}.</p>
    <p>After reviewing your application, we are unable to approve your instructor account at this time.</p>
    <div style="margin:20px 0;padding:16px;background:${c.grayLight};border-left:3px solid ${c.red};border-radius:4px">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:${c.textMuted};text-transform:uppercase;letter-spacing:.08em">Reason</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(reason)}</p>
    </div>
    <p>If you have questions about this decision, please reply to this email.</p>`),
    });
  }
}

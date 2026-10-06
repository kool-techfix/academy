import { sendEmail } from "@/lib/email/email-transport";
import {
  ACADEMY_NAME,
  emailButton,
  emailLayout,
  escapeHtml,
} from "@/lib/email/template";

type Recipient = {
  name: string;
  email: string;
};

export const PASSWORD_RESET_EXPIRY_MINUTES = 60;

export class PasswordResetEmailService {
  /** The link is single-use and expires after an hour. */
  async sendResetLink(recipient: Recipient, resetUrl: string) {
    const name = escapeHtml(recipient.name);

    await sendEmail({
      to: recipient.email,
      subject: `Reset your ${ACADEMY_NAME} password`,
      text: [
        `Hi ${recipient.name},`,
        "",
        `We received a request to reset the password for your ${ACADEMY_NAME} account.`,
        `Open this link to choose a new password (it expires in ${PASSWORD_RESET_EXPIRY_MINUTES} minutes and can be used once):`,
        resetUrl,
        "",
        "If you didn't ask for this, you can ignore this email — your password won't change.",
        "",
        `— The ${ACADEMY_NAME} team`,
      ].join("\n"),
      html: emailLayout(`
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your ${ACADEMY_NAME} account.</p>
    ${emailButton(resetUrl, "Choose a new password")}
    <p style="font-size:13px">This link expires in ${PASSWORD_RESET_EXPIRY_MINUTES} minutes and can only be used once.</p>
    <p style="font-size:13px">If you didn't ask for this, you can ignore this email — your password won't change.</p>`),
    });
  }

  /** Security notice after a successful reset. */
  async sendPasswordChanged(recipient: Recipient) {
    const name = escapeHtml(recipient.name);

    await sendEmail({
      to: recipient.email,
      subject: `Your ${ACADEMY_NAME} password was changed`,
      text: [
        `Hi ${recipient.name},`,
        "",
        `The password for your ${ACADEMY_NAME} account was just reset, and you've been signed out on all devices.`,
        "",
        "If this wasn't you, reset your password again right away and reply to this email.",
        "",
        `— The ${ACADEMY_NAME} team`,
      ].join("\n"),
      html: emailLayout(`
    <p>Hi ${name},</p>
    <p>The password for your ${ACADEMY_NAME} account was just reset, and you've been signed out on all devices.</p>
    <p>If this wasn't you, reset your password again right away and reply to this email.</p>`),
    });
  }
}

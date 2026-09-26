/**
 * Minimal email transport. Sends through Resend's HTTP API when
 * RESEND_API_KEY and EMAIL_FROM are configured; otherwise logs the email
 * so development works without an email provider.
 *
 * Swap this file to change providers — callers only depend on sendEmail().
 */
export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.info(
      `[email] Provider not configured; would send "${message.subject}" to ${message.to}\n${message.text}`,
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Email provider responded ${response.status}: ${await response.text()}`,
    );
  }
}

import nodemailer, { type Transporter } from "nodemailer";

/**
 * Email transport (nodemailer over SMTP). Callers only depend on sendEmail().
 *
 * Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM
 * (SMTP_SECURE optional; defaults to true on port 465). When SMTP isn't
 * configured, emails are logged instead so development works without a mail
 * server — never in production, where a missing config is an error.
 */
export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const from = process.env.EMAIL_FROM;

  if (!host || !from) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secureEnv = process.env.SMTP_SECURE;

  return {
    host,
    port,
    secure: secureEnv ? secureEnv === "true" : port === 465,
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
    from,
  };
}

let transporter: Transporter | null = null;

function getTransporter(config: SmtpConfig) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth:
        config.user && config.pass
          ? { user: config.user, pass: config.pass }
          : undefined,
    });
  }

  return transporter;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const config = getSmtpConfig();

  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured (set SMTP_HOST and EMAIL_FROM)");
    }

    console.info(
      `[email] SMTP not configured; would send "${message.subject}" to ${message.to}\n${message.text}`,
    );
    return;
  }

  await getTransporter(config).sendMail({
    from: config.from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}

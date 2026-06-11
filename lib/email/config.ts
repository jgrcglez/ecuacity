export const emailConfig = {
  provider: (process.env.EMAIL_PROVIDER ?? "resend") as "resend" | "smtp",
  from: process.env.EMAIL_FROM ?? "Ecuacity <noreply@ecuacity.com>",
  resendApiKey: process.env.RESEND_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpIgnoreTls: process.env.SMTP_IGNORE_TLS === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
} as const;

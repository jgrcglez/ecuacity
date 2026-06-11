import { emailConfig } from "./config";
import type { EmailProvider, SendEmailParams } from "./providers/interface";
import { ResendProvider } from "./providers/resend";
import { SmtpProvider } from "./providers/smtp";

let provider: EmailProvider | null = null;

function getProvider(): EmailProvider {
  if (!provider) {
    provider = emailConfig.provider === "smtp"
      ? new SmtpProvider(emailConfig)
      : new ResendProvider(emailConfig);
  }
  return provider;
}

export async function sendEmail(params: SendEmailParams) {
  return getProvider().send(params);
}

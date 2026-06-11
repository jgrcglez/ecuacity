import { Resend } from "resend";
import type { EmailProvider, SendEmailParams, SendEmailResult } from "./interface";
import type { emailConfig } from "../config";

export class ResendProvider implements EmailProvider {
  name = "resend";
  private client: Resend;
  private from: string;

  constructor(config: typeof emailConfig) {
    this.client = new Resend(config.resendApiKey ?? "");
    this.from = config.from;
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    const { data, error } = await this.client.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) throw error;
    return { id: data?.id ?? "" };
  }
}

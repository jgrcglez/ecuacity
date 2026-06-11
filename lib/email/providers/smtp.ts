import nodemailer from "nodemailer";
import type { EmailProvider, SendEmailParams, SendEmailResult } from "./interface";
import type { emailConfig } from "../config";

export class SmtpProvider implements EmailProvider {
  name = "smtp";
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(config: typeof emailConfig) {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      ignoreTLS: config.smtpIgnoreTls,
      auth: config.smtpUser && config.smtpPass
        ? { user: config.smtpUser, pass: config.smtpPass }
        : undefined,
    });
    this.from = config.from;
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    const info = await this.transporter.sendMail({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return { id: info.messageId };
  }
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  id: string;
}

export interface EmailProvider {
  send(params: SendEmailParams): Promise<SendEmailResult>;
  name: string;
}

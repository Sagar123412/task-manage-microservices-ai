import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

export function getMailer(config: {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
}): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    });
  }
  return transporter;
}

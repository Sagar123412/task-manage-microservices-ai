import { getLogger } from "@task-manager/shared/server";
import { getMailer } from "../lib/mailer.js";
import { todoCreatedTemplate } from "../templates/todo-created.template.js";
import { userRegisteredTemplate } from "../templates/user-registered.template.js";

const log = getLogger();

type EmailConfig = {
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser?: string;
  smtpPass?: string;
};

export class EmailService {
  constructor(private readonly config: EmailConfig) {}

  async sendUserRegisteredEmail(input: { to: string; verificationUrl: string }): Promise<void> {
    const template = userRegisteredTemplate({ verificationUrl: input.verificationUrl });
    const transporter = getMailer({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      user: this.config.smtpUser,
      pass: this.config.smtpPass,
    });
    await transporter.sendMail({
      from: this.config.fromEmail,
      to: input.to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    log.info("notification_email_sent_user_registered", { to: input.to });
  }

  async sendTodoCreatedEmail(input: { to: string; title: string; dueDate?: string }): Promise<void> {
    const template = todoCreatedTemplate({ title: input.title, dueDate: input.dueDate });
    const transporter = getMailer({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      user: this.config.smtpUser,
      pass: this.config.smtpPass,
    });
    await transporter.sendMail({
      from: this.config.fromEmail,
      to: input.to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    log.info("notification_email_sent_todo_created", { to: input.to, title: input.title });
  }
}

let emailService: EmailService | null = null;

export function getEmailService(config: EmailConfig): EmailService {
  if (!emailService) {
    emailService = new EmailService(config);
  }
  return emailService;
}

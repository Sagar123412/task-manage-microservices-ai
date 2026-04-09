import type { Channel, ConsumeMessage } from "amqplib";
import { notificationEventSchema } from "@task-manager/shared";
import { getLogger } from "@task-manager/shared/server";
import { getEmailService } from "../services/email.service.js";
import { getRabbitMqClient } from "../lib/rabbitmq.js";

const log = getLogger();

type ConsumerConfig = {
  rabbitmqUrl: string;
  exchangeName: string;
  queueName: string;
  retryQueueName: string;
  deadQueueName: string;
  retryDelayMs: number;
  maxRetries: number;
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser?: string;
  smtpPass?: string;
};

export async function startEventConsumer(config: ConsumerConfig): Promise<void> {
  const rabbit = getRabbitMqClient({
    url: config.rabbitmqUrl,
    exchange: config.exchangeName,
    queue: config.queueName,
    retryQueue: config.retryQueueName,
    deadQueue: config.deadQueueName,
    retryDelayMs: config.retryDelayMs,
  });

  const emailService = getEmailService({
    fromEmail: config.fromEmail,
    smtpHost: config.smtpHost,
    smtpPort: config.smtpPort,
    smtpSecure: config.smtpSecure,
    smtpUser: config.smtpUser,
    smtpPass: config.smtpPass,
  });

  await rabbit.consume(async (msg: ConsumeMessage, channel: Channel) => {
    try {
      const json = JSON.parse(msg.content.toString()) as unknown;
      const event = notificationEventSchema.parse(json);

      if (event.type === "user.registered") {
        await emailService.sendUserRegisteredEmail({
          to: event.payload.email,
          verificationUrl: event.payload.verificationUrl,
        });
      }
      if (event.type === "todo.created") {
        await emailService.sendTodoCreatedEmail({
          to: event.payload.email,
          title: event.payload.title,
          dueDate: event.payload.dueDate,
        });
      }

      channel.ack(msg);
    } catch (error) {
      const retryCount = Number(msg.properties.headers?.["x-retry-count"] ?? 0);
      const reason = error instanceof Error ? error.message : "unknown_error";

      if (retryCount < config.maxRetries) {
        await rabbit.sendToRetry(msg.content, retryCount + 1);
        channel.ack(msg);
        log.warn("notification_event_retrying", { retryCount: retryCount + 1, reason });
      } else {
        await rabbit.sendToDead(msg.content, reason);
        channel.ack(msg);
        log.error("notification_event_failed_dead_lettered", { reason, retries: retryCount });
      }
    }
  });
}

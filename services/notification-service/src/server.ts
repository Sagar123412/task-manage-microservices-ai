import { z } from "zod";
import { configureLogger, getLogger, parseServiceEnv } from "@task-manager/shared/server";
import { createApp } from "./app.js";
import { startEventConsumer } from "./consumer/event.consumer.js";

const env = parseServiceEnv(
  z.object({
    PORT: z.coerce.number().int().positive().default(4004),
    RABBITMQ_URL: z.string().default("amqp://127.0.0.1:5672"),
    EVENT_EXCHANGE_NAME: z.string().default("app.events"),
    NOTIFICATION_QUEUE_NAME: z.string().default("notification.events"),
    NOTIFICATION_RETRY_QUEUE_NAME: z.string().default("notification.events.retry"),
    NOTIFICATION_DEAD_QUEUE_NAME: z.string().default("notification.events.dead"),
    NOTIFICATION_RETRY_DELAY_MS: z.coerce.number().int().positive().default(10000),
    NOTIFICATION_MAX_RETRIES: z.coerce.number().int().positive().default(3),
    EMAIL_FROM: z.string().email().default("no-reply@taskmanager.local"),
    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().int().positive().default(1025),
    SMTP_SECURE: z.coerce.boolean().default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
  })
);

configureLogger({ serviceName: "notification-service", level: env.LOG_LEVEL });
const log = getLogger();

const app = createApp();
app.listen(env.PORT, () => {
  log.info("notification_service_listening", { port: env.PORT });
});

void startEventConsumer({
  rabbitmqUrl: env.RABBITMQ_URL,
  exchangeName: env.EVENT_EXCHANGE_NAME,
  queueName: env.NOTIFICATION_QUEUE_NAME,
  retryQueueName: env.NOTIFICATION_RETRY_QUEUE_NAME,
  deadQueueName: env.NOTIFICATION_DEAD_QUEUE_NAME,
  retryDelayMs: env.NOTIFICATION_RETRY_DELAY_MS,
  maxRetries: env.NOTIFICATION_MAX_RETRIES,
  fromEmail: env.EMAIL_FROM,
  smtpHost: env.SMTP_HOST,
  smtpPort: env.SMTP_PORT,
  smtpSecure: env.SMTP_SECURE,
  smtpUser: env.SMTP_USER,
  smtpPass: env.SMTP_PASS,
})
  .then(() => {
    log.info("notification_consumer_started");
  })
  .catch((error) => {
    log.error("notification_consumer_start_failed", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
  });

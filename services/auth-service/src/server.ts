import { z } from "zod";
import type { SignOptions } from "jsonwebtoken";
import { configureLogger, getLogger, parseServiceEnv } from "@task-manager/shared/server";
import { createApp } from "./app.js";

const env = parseServiceEnv(
  z.object({
    // Needed by Prisma at runtime and during schema sync/migrations.
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().int().positive().default(4003),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRES_IN: z
      .custom<SignOptions["expiresIn"]>((value) => typeof value === "string" || typeof value === "number")
      .default("1h"),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_REFRESH_EXPIRES_IN: z
      .custom<SignOptions["expiresIn"]>((value) => typeof value === "string" || typeof value === "number")
      .default("7d"),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
    VERIFY_EMAIL_BASE_URL: z.string().url().default("http://127.0.0.1:3000/api/v1/auth/verify-email"),
    RABBITMQ_URL: z.string().default("amqp://127.0.0.1:5672"),
    EVENT_EXCHANGE_NAME: z.string().default("app.events"),
  })
);

configureLogger({ serviceName: "auth-service", level: env.LOG_LEVEL });

const log = getLogger();

// Keep route wiring in app.ts; server.ts handles process bootstrap only.
const app = createApp({
  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
  verifyEmailBaseUrl: env.VERIFY_EMAIL_BASE_URL,
  rabbitmqUrl: env.RABBITMQ_URL,
  eventExchangeName: env.EVENT_EXCHANGE_NAME,
});

app.listen(env.PORT, () => {
  log.info("auth_service_listening", { port: env.PORT });
});

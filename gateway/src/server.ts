import { z } from "zod";
import { configureLogger, getLogger, parseServiceEnv } from "@task-manager/shared/server";
import { createApp } from "./app.js";

const env = parseServiceEnv(
  z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    USERS_SERVICE_URL: z.string().url().default("http://127.0.0.1:4002"),
    AUTH_SERVICE_URL: z.string().url().default("http://127.0.0.1:4003"),
    TODO_SERVICE_URL: z.string().url().default("http://127.0.0.1:4005"),
  })
);

configureLogger({ serviceName: "gateway", level: env.LOG_LEVEL });

const log = getLogger();
const app = createApp({
  usersServiceUrl: env.USERS_SERVICE_URL,
  authServiceUrl: env.AUTH_SERVICE_URL,
  todoServiceUrl: env.TODO_SERVICE_URL,
});
app.listen(env.PORT, () => {
  log.info("gateway_listening", { port: env.PORT });
});

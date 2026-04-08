import { z } from "zod";
import { configureLogger, getLogger, parseServiceEnv } from "@task-manager/shared/server";
import { createApp } from "./app.js";

const env = parseServiceEnv(
  z.object({
    PORT: z.coerce.number().int().positive().default(4002),
  })
);

configureLogger({ serviceName: "users-service", level: env.LOG_LEVEL });

const log = getLogger();
const app = createApp();
app.listen(env.PORT, () => {
  log.info("users_service_listening", { port: env.PORT });
});

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { config as loadEnv } from "dotenv";
import { configureLogger, getLogger, parseServiceEnv } from "@task-manager/shared/server";
import { createApp } from "./app.js";
import { connectMongo } from "./lib/mongodb.js";

const currentDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(currentDir, "../.env") });

const env = parseServiceEnv(
  z.object({
    PORT: z.coerce.number().int().positive().default(4005),
    // Required for deploy parity across local/staging/prod.
    MONGODB_URI: z.string().min(1),
    REDIS_URL: z.string().min(1),
  })
);

configureLogger({ serviceName: "todo-service", level: env.LOG_LEVEL });
const log = getLogger();

await connectMongo(env.MONGODB_URI);
const app = createApp({ redisUrl: env.REDIS_URL });

app.listen(env.PORT, () => {
  log.info("todo_service_listening", { port: env.PORT });
});

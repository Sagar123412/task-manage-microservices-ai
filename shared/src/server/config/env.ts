import { z } from "zod";

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
});

/**
 * Parses `process.env` with shared fields (`NODE_ENV`, `LOG_LEVEL`) merged with a service-specific schema.
 */
export function parseServiceEnv<T extends z.ZodRawShape>(extension: z.ZodObject<T>) {
  return baseEnvSchema.merge(extension).parse(process.env);
}

export type BaseServiceEnv = z.infer<typeof baseEnvSchema>;

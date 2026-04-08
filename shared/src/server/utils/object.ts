/** Removes keys whose value is `undefined` (shallow). */
export function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const v = obj[key];
    if (v !== undefined) {
      out[key] = v;
    }
  }
  return out;
}

/** Sleep for testing or simple backoff (prefer queues in production). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

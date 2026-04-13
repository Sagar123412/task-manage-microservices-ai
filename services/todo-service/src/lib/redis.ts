import { createClient, type RedisClientType } from "redis";

let client: RedisClientType | null = null;

export async function getRedisClient(url: string): Promise<RedisClientType> {
  if (!client) {
    client = createClient({ url });
    await client.connect();
  }
  return client;
}

import { PrismaClient } from "@prisma/client";

let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  // Keep one Prisma instance per process to avoid exhausting DB connections.
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

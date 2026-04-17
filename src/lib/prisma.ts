import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required to initialize Prisma.");
  }
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function getPrismaClient() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

const prismaProxyHandler: ProxyHandler<PrismaClient> = {
  get(_target, property) {
    const client = getPrismaClient();
    const value = (client as unknown as Record<PropertyKey, unknown>)[property];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
};

export const prisma: PrismaClient = new Proxy({} as PrismaClient, prismaProxyHandler);

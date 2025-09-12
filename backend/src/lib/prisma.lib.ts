import { PrismaClient } from "@prisma/client";

// Global cache for singleton (works in dev/prod; survives hot reloads)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Optional: Log for debugging
    log: process.env.NODE_ENV === "development" ? ["query", "info"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

import { PrismaClient } from "@prisma/client";

// Global cache for singleton (works in dev/prod; survives hot reloads)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Optional: Log for debugging
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

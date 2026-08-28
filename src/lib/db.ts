import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Vibecode learning: Prisma 7 requires a driver adapter.
// - For Supabase Free (pooled 6543 with pgbouncer=true) we use PrismaPg with connectionString.
// - This keeps connections cheap for serverless (Vercel Hobby) + Supabase 60-conn limit.
// - Fallback: if DATABASE_URL missing (build time), use dummy string so `next build` passes; runtime will need real env.

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy?schema=public";
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;

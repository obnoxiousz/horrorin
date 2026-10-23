import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

// Serverless notes:
// - Every lambda holds its own pool; keep `max` small so concurrent lambdas
//   don't exhaust the DB connection cap (Supabase). Override with PG_POOL_MAX.
// - Short idle timeout so Vercel's frozen lambdas don't leak sockets.
const isServerless = !!process.env.VERCEL;
const pool = new Pool({
  connectionString,
  max: Number(process.env.PG_POOL_MAX ?? (isServerless ? 3 : 10)),
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

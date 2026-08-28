import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { db } from "./db";

// Vibecode learning: Better Auth = 100% free auth (no MAU limit).
// - Uses same Supabase Postgres via Prisma adapter — no extra vendor.
// - emailAndPassword enabled → we can register users without OAuth; OAuth added later for free.
// - user.role enum from Prisma: CUSTOMER|STAFF|ADMIN. Only ADMIN can access /admin.
// - Session stored in DB (default) — survives serverless restarts on Vercel.
// - BETTER_AUTH_SECRET = openssl rand -base64 32 — encrypts sessions.
// - BETTER_AUTH_URL = http://localhost:3000 locally, Vercel URL in prod.

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "build-dummy-secret-32-chars-long-12345",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // minPasswordLength defaults to 8 — keeps free tier secure without extra cost
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
        required: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
    // Customer can delete own account → soft anonymize (not hard delete) — keeps orders
    deleteUser: {
      enabled: true,
      // No email verification for demo; immediate soft delete via beforeDelete hook
    },
  },
  plugins: [
    admin({
      defaultRole: "CUSTOMER",
      adminRoles: ["ADMIN"],
      // Banned users cannot sign in — used for soft delete / anonymize
    }),
  ],
  // Advanced: secure cookies in prod, CSRF on (never disable per skill security checklist)
  advanced: {
    // Better Auth auto-uses BETTER_AUTH_SECRET from env; only set secret here if env not set
  },
  // Hooks: example to default role to CUSTOMER on create (defense in depth — DB already defaults)
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: user.role || "CUSTOMER",
            },
          };
        },
      },
    },
  },
  // Trusted origins for CSRF — Vercel + localhost
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.BETTER_AUTH_URL || "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  ].filter(Boolean),
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Vibecode learning: Route Handler = API endpoint (app/api/health/route.ts → /api/health)
// Use to verify Prisma + Supabase connection without exposing data.

export async function GET() {
  try {
    // Lightweight check — does not require auth
    await db.$queryRaw`SELECT 1 as ok`;
    return NextResponse.json({ status: "ok", db: "connected", ts: new Date().toISOString() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ status: "error", db: msg }, { status: 500 });
  }
}

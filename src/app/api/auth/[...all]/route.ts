import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Vibecode learning: Better Auth Next.js handler.
// - toNextJsHandler(auth) creates { GET, POST } for /api/auth/*
// - Handles: sign-up, sign-in, sign-out, session, etc.
// - Verify: GET /api/auth/ok → { status: "ok" } means wiring succeeded (per skill workflow step 6).

export const { POST, GET } = toNextJsHandler(auth);

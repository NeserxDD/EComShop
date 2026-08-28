import { headers } from "next/headers";
import { auth } from "./auth";

// Vibecode learning: Server-side session check.
// - auth.api.getSession({ headers }) reads cookies on server (Server Components / Route Handlers).
// - Use to gate /admin (ADMIN/STAFF only) and /orders (CUSTOMER).
// - No "use client" — keeps secret in server, prevents flicker.

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireRole(allowed: ("CUSTOMER" | "STAFF" | "ADMIN")[]) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const ok = role && allowed.includes(role as typeof allowed[number]);
  return { session, role, ok };
}

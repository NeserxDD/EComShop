import { createClient } from "@supabase/supabase-js";

// Vibecode learning: We use Supabase ONLY as Postgres + optional Realtime.
// Better Auth handles auth (not Supabase Auth) — so we keep auth decoupled and $0 unlimited.
// This client is for: Realtime subscriptions (repair status) or Storage fallback if Cloudinary not configured.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

// Server client with service role (never expose to browser)
export function supabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supaUrl || !serviceKey) return null;
  return createClient(supaUrl, serviceKey);
}

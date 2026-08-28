"use client";
import { createAuthClient } from "better-auth/react";

// Vibecode learning: Client SDK for React.
// - "use client" required — better-auth/react uses hooks (useSession).
// - Base URL auto-detected from BETTER_AUTH_URL or window.location.
// - Methods: signUp.email(), signIn.email(), signOut(), useSession().
// - This file is imported only in Client Components (e.g., Header, sign-in form).

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

"use client";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
// Self-service: old password required for self (changePassword needs currentPassword)
// Admin-on-others: no old password (admin.setUserPassword) via plugins/admin
export const admin = authClient.admin;

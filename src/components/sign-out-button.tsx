"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        try {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/");
                router.refresh();
              },
            },
          });
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted transition-colors disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}

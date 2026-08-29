"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export function CartIcon() {
  const [count, setCount] = useState(0);

  function refresh() {
    try {
      const cart: any[] = JSON.parse(localStorage.getItem("ecom_cart") || "[]");
      const total = cart.reduce((s: number, c: any) => s + (c.qty || 0), 0);
      setCount(total);
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("cart:updated", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("cart:updated", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  return (
    <Link href="/cart" className="relative flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-muted transition-colors">
      <span className="text-sm">🛒</span>
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{count}</span>}
    </Link>
  );
}

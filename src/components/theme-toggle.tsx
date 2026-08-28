"use client";
import { useEffect, useState } from "react";

// Warm toggle — persists "light"/"dark"/"system" (skill: honor system + persist)
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const s = localStorage.getItem("ecomshop-theme");
    const m = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = (s as "light" | "dark") || (m ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ecomshop-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="size-8 rounded-full border bg-card hover:bg-muted flex items-center justify-center text-xs transition-colors dark:border-border"
      title={`Switch to ${theme === "dark" ? "light" : "dark"}`}
    >
      <span className="hidden sm:inline">{theme === "dark" ? "☾" : "☀"}</span>
      <span className="sm:hidden">{theme === "dark" ? "·" : "o"}</span>
    </button>
  );
}

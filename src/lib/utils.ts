import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Vibecode learning: cn() merges Tailwind classes safely.
// clsx handles conditional classes, twMerge dedupes conflicting Tailwind utilities (e.g., p-2 vs p-4)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string) {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(n);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

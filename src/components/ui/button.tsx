import * as React from "react";
import { cn } from "@/lib/utils";

// Vibecode learning: Minimal shadcn-like Button — no extra dependency.
// Variants use Tailwind only. Copy from shadcn/ui pattern.

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black": variant === "default",
            "border hover:bg-zinc-50 dark:border-zinc-800": variant === "outline",
            "hover:bg-zinc-100 dark:hover:bg-zinc-900": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
          },
          {
            "h-10 px-6 py-2": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

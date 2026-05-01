import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-base",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:brightness-110",
        variant === "secondary" &&
          "bg-card text-foreground border border-border hover:bg-black/[0.03] dark:hover:bg-white/[0.06]",
        variant === "ghost" &&
          "text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
        variant === "danger" &&
          "bg-danger text-white hover:brightness-110 dark:text-black",
        className,
      )}
      {...props}
    />
  );
}


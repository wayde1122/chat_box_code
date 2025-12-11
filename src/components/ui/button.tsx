import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ asChild, className, variant = "primary", size = "md", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={clsx(
        "inline-flex items-center justify-center rounded-lg transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "secondary" && "bg-slate-800 text-slate-100 hover:bg-slate-700",
        variant === "ghost" && "bg-transparent text-slate-200 hover:bg-slate-800/50",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        className
      )}
      {...props}
    />
  );
}


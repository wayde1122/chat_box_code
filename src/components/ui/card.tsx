import React from "react";
import { clsx } from "clsx";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-700 bg-slate-800/60 backdrop-blur",
        className
      )}
      {...props}
    />
  );
}


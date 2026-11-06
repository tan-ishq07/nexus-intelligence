import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "critical" | "warning" | "success" | "info" | "neutral" | "purple" | "cyan" | "secondary";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-100 text-slate-300 border-slate-700",
    critical: "bg-nexus-rose/10 text-nexus-rose border-nexus-rose/30",
    warning: "bg-nexus-amber/10 text-nexus-amber border-nexus-amber/30",
    success: "bg-nexus-emerald/10 text-nexus-emerald border-nexus-emerald/30",
    info: "bg-nexus-cyan/10 text-nexus-cyan border-nexus-cyan/30",
    neutral: "bg-slate-800/80 text-slate-400 border-slate-700/60",
    purple: "bg-nexus-purple/10 text-nexus-purple border-nexus-purple/30",
    cyan: "bg-nexus-cyan/10 text-nexus-cyan border-nexus-cyan/30",
    secondary: "bg-slate-800/80 text-slate-400 border-slate-700/60",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border uppercase tracking-wider font-mono",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

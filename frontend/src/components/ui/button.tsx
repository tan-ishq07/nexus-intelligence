import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "glow" | "subtle" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nexus-cyan disabled:pointer-events-none disabled:opacity-50 text-sm select-none";

    const variants = {
      default: "bg-surface-100 hover:bg-surface-50 text-white border border-slate-700/80 hover:border-slate-600 shadow-sm",
      outline: "border border-slate-800 bg-transparent hover:bg-surface-200 text-slate-300 hover:text-white",
      ghost: "hover:bg-surface-200 text-slate-400 hover:text-white",
      danger: "bg-nexus-rose/10 hover:bg-nexus-rose/20 text-nexus-rose border border-nexus-rose/30",
      glow: "bg-gradient-to-r from-nexus-blue to-nexus-cyan text-white font-semibold hover:shadow-glow-cyan border-none",
      subtle: "bg-surface-300/60 hover:bg-surface-200/80 text-slate-300 border border-slate-800/80",
      secondary: "bg-surface-300/60 hover:bg-surface-200/80 text-slate-300 border border-slate-800/80",
    };

    const sizes = {
      sm: "h-8 px-3 rounded text-xs gap-1.5",
      md: "h-9 px-4 rounded-md gap-2",
      lg: "h-11 px-6 rounded-md text-base gap-2.5",
      icon: "h-9 w-9 rounded-md",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

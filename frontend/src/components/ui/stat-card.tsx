import React from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  trendType?: "positive" | "negative" | "neutral"; // e.g. delay going up is negative
  icon?: LucideIcon;
  badge?: string;
  alertLevel?: "normal" | "warning" | "critical";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  change,
  trend,
  trendType = "positive",
  icon: Icon,
  badge,
  alertLevel = "normal",
  className,
}) => {
  const alertBorders = {
    normal: "border-slate-800/80 hover:border-slate-700",
    warning: "border-nexus-amber/40 bg-nexus-amber/5 hover:border-nexus-amber/60",
    critical: "border-nexus-rose/50 bg-nexus-rose/5 hover:border-nexus-rose/80",
  };

  const trendColors = {
    positive: "text-nexus-emerald",
    negative: "text-nexus-rose",
    neutral: "text-slate-400",
  };

  return (
    <Card className={cn("p-4 sm:p-5 relative overflow-hidden group", alertBorders[alertLevel], className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate max-w-[80%]">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded bg-surface-200/80 border border-slate-700/50 text-slate-300 group-hover:text-nexus-cyan transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2 my-1">
        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
          {value}
        </span>
        {badge && (
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-100 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40 text-xs">
        {change && (
          <div className={cn("flex items-center font-mono font-medium space-x-1", trendColors[trendType])}>
            {trend === "up" && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trend === "down" && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend === "neutral" && <Minus className="w-3.5 h-3.5" />}
            <span>{change}</span>
          </div>
        )}
        {subtext && <span className="text-slate-400 truncate ml-auto">{subtext}</span>}
      </div>
    </Card>
  );
};

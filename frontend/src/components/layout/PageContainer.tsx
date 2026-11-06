"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { RefreshCw, Download, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageContainerProps {
  title: string;
  subtitle: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  breadcrumb = ["NEXUS", "Command Surface"],
  actions,
  children,
  className,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className={cn("p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto select-none", className)}>
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 mb-1">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                <span className={idx === breadcrumb.length - 1 ? "text-nexus-cyan font-semibold" : ""}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Global Page Actions */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          {actions}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="font-mono text-xs"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isRefreshing && "animate-spin text-nexus-cyan")} />
              {isRefreshing ? "Syncing..." : "Sync Live"}
            </Button>
          )}
        </div>
      </div>

      {/* Page Body Content */}
      <main className="space-y-6">{children}</main>
    </div>
  );
};

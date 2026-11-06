"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe2,
  Database,
  RefreshCw,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Boxes,
  Network,
  Radio,
  Compass,
  BarChart3,
  Sliders,
  BrainCircuit,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Executive Command",
    items: [
      { name: "Command Center", href: "/command-center", icon: LayoutDashboard },
      { name: "Global Network", href: "/network", icon: Globe2, badge: "3D Ready" },
      { name: "Decision & Insights", href: "/decisions", icon: BrainCircuit, badge: "AI" },
    ],
  },
  {
    title: "Operations & Risk",
    items: [
      { name: "Supplier Risk", href: "/supplier-risk", icon: ShieldCheck },
      { name: "Inventory Intelligence", href: "/inventory", icon: Boxes },
      { name: "Geospatial Telemetry", href: "/geospatial", icon: Compass },
      { name: "Anomaly Detection", href: "/anomalies", icon: Radio, badge: "3 Critical", badgeColor: "text-nexus-rose bg-nexus-rose/10" },
    ],
  },
  {
    title: "Analytics & AI Lab",
    items: [
      { name: "Predictive Delays", href: "/predictive", icon: TrendingUp },
      { name: "Mining Laboratory", href: "/mining-lab", icon: Cpu },
      { name: "Association Discovery", href: "/association-rules", icon: Network },
      { name: "OLAP Studio", href: "/olap", icon: BarChart3 },
      { name: "What-If Simulator", href: "/scenarios", icon: Sliders },
    ],
  },
  {
    title: "Data & Governance",
    items: [
      { name: "Data Warehouse", href: "/warehouse", icon: Database },
      { name: "ETL & Quality Studio", href: "/etl-studio", icon: RefreshCw },
      { name: "Reports & Exports", href: "/reports", icon: FileText },
      { name: "Settings & Health", href: "/settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-surface-400 border-r border-slate-800/90 flex flex-col z-30 transition-all duration-300 select-none",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
        <Link href="/command-center" className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-nexus-blue to-nexus-cyan flex items-center justify-center flex-shrink-0 shadow-glow-cyan">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-widest text-white uppercase font-mono">
                NEXUS
              </span>
              <span className="text-[10px] uppercase tracking-wider text-nexus-cyan font-mono font-medium -mt-1">
                INTELLIGENCE
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-surface-200 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navigationSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === "/command-center" && pathname === "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all group relative",
                      isActive
                        ? "bg-nexus-blue/15 text-white border-l-2 border-nexus-cyan shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-surface-200/60"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0 transition-colors",
                        isActive ? "text-nexus-cyan" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1 tracking-normal">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase",
                          item.badgeColor || "bg-surface-100 text-slate-300 border border-slate-700/60"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Operational System Status Pill */}
      <div className="p-3 border-t border-slate-800/80 bg-surface-500/80">
        {!collapsed ? (
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1.5 bg-surface-300/80 rounded border border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-nexus-emerald animate-pulse" />
              <span className="font-mono text-[11px] text-slate-300">CORE ENGINE</span>
            </div>
            <span className="text-[10px] font-mono text-nexus-cyan">v1.0-LIVE</span>
          </div>
        ) : (
          <div className="flex justify-center" title="Core Engine Operational">
            <span className="w-2.5 h-2.5 rounded-full bg-nexus-emerald animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { RiskDistributionBar } from "@/components/charts/RiskDistributionBar";
import { RegionalPerformanceChart } from "@/components/charts/RegionalPerformanceChart";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  CommandCenterMetrics,
  TrendPoint,
  RegionalPerformance,
  SupplierRiskDistribution,
  OperationalAlert,
  Recommendation,
} from "@/types";
import {
  Truck,
  Building2,
  Warehouse,
  DollarSign,
  Clock,
  AlertTriangle,
  Boxes,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Activity,
  ArrowRight,
  Filter,
  CheckCircle,
  Globe2,
  Navigation,
  Compass,
  Calendar
} from "lucide-react";
import Link from "next/link";

export default function CommandCenterPage() {
  const [metrics, setMetrics] = useState<CommandCenterMetrics | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [regional, setRegional] = useState<RegionalPerformance[]>([]);
  const [supplierRisk, setSupplierRisk] = useState<SupplierRiskDistribution[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeHorizon, setTimeHorizon] = useState<"24h" | "7d" | "30d" | "90d" | "custom">("30d");

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [m, t, r, sr, al, rc] = await Promise.all([
        api.getMetrics(),
        api.getTrends(),
        api.getRegional(),
        api.getSupplierRisk(),
        api.getAlerts(),
        api.getRecommendations(),
      ]);
      setMetrics(m);
      setTrends(t);
      setRegional(r);
      setSupplierRisk(sr);
      setAlerts(al);
      setRecommendations(rc);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute scaled metrics based on date filter horizon
  const getScaledMetrics = () => {
    if (!metrics) return null;
    let multiplier = 1.0;
    let otdDelta = 0;
    let delayDelta = 0;

    if (timeHorizon === "24h") {
      multiplier = 0.18;
      otdDelta = 2.2;
      delayDelta = -2.4;
    } else if (timeHorizon === "7d") {
      multiplier = 0.52;
      otdDelta = 0.8;
      delayDelta = -1.1;
    } else if (timeHorizon === "90d") {
      multiplier = 2.95;
      otdDelta = -0.7;
      delayDelta = 0.6;
    }

    return {
      total_shipments: Math.round(metrics.total_shipments * multiplier),
      active_suppliers: metrics.active_suppliers,
      global_warehouses: metrics.global_warehouses,
      inventory_value_usd: metrics.inventory_value_usd,
      on_time_delivery_pct: Math.min(99.4, Math.max(88.0, Number((metrics.on_time_delivery_pct + otdDelta).toFixed(1)))),
      avg_shipment_delay_hours: Math.max(1.2, Number((metrics.avg_shipment_delay_hours + delayDelta).toFixed(1))),
      high_risk_suppliers_count: metrics.high_risk_suppliers_count,
      predicted_stockouts_count: timeHorizon === "24h" ? 1 : timeHorizon === "7d" ? 3 : metrics.predicted_stockouts_count,
      total_in_transit_value_usd: metrics.total_in_transit_value_usd * (multiplier > 1.5 ? 1.4 : multiplier)
    };
  };

  const currentMetrics = getScaledMetrics() || metrics;

  return (
    <PageContainer
      title="EXECUTIVE COMMAND CENTER"
      subtitle="Real-time situational intelligence across global tier-1 supply network & predictive operations"
      breadcrumb={["NEXUS", "Command Surface", "Executive Dashboard"]}
      onRefresh={loadData}
      isRefreshing={isRefreshing}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {/* Palantir-Style Date Horizon Filter */}
          <div className="flex items-center space-x-1 bg-surface-300/80 p-1 rounded-lg border border-slate-700/80 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-nexus-cyan ml-1 mr-1" />
            {(["24h", "7d", "30d", "90d", "custom"] as const).map((h) => (
              <button
                key={h}
                onClick={() => setTimeHorizon(h)}
                className={`px-2 py-1 rounded transition-colors uppercase font-medium ${
                  timeHorizon === h
                    ? "bg-nexus-cyan text-surface-50 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {h}
              </button>
            ))}
          </div>

          <Link href="/scenarios">
            <Button variant="glow" size="sm">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              Simulate Crisis
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" size="sm">
              Export Dossier
            </Button>
          </Link>
        </div>
      }
    >
      {/* Top 8 Tier-1 Strategic KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Shipments In Flight"
          value={currentMetrics ? formatNumber(currentMetrics.total_shipments) : "14,850"}
          change={`Active horizon: ${timeHorizon.toUpperCase()}`}
          trend="up"
          trendType="positive"
          subtext="Active maritime & air"
          icon={Truck}
        />
        <StatCard
          title="Active Qualified Suppliers"
          value={currentMetrics ? formatNumber(currentMetrics.active_suppliers) : "412"}
          change="98.2% compliance"
          trend="neutral"
          trendType="neutral"
          subtext="12 Tier-1 strategic fabs"
          icon={Building2}
        />
        <StatCard
          title="Global Warehouse Network"
          value={currentMetrics ? currentMetrics.global_warehouses : "48"}
          change="81.4% mean utilization"
          trend="up"
          trendType="neutral"
          subtext="8 super-hubs online"
          icon={Warehouse}
        />
        <StatCard
          title="Total Inventory Valuation"
          value={currentMetrics ? formatCurrency(currentMetrics.inventory_value_usd) : "$248.9M"}
          change="+$14.2M buffer rebalance"
          trend="up"
          trendType="neutral"
          subtext="Capital velocity 4.8x"
          icon={DollarSign}
        />
        <StatCard
          title="On-Time Delivery Rate"
          value={currentMetrics ? `${currentMetrics.on_time_delivery_pct}%` : "94.6%"}
          change="+1.2% SLA baseline"
          trend="up"
          trendType="positive"
          subtext="Target SLA: 95.0%"
          icon={Clock}
        />
        <StatCard
          title="Avg Shipment Delay"
          value={currentMetrics ? `${currentMetrics.avg_shipment_delay_hours} hrs` : "4.2 hrs"}
          change="-0.8 hrs vs baseline"
          trend="down"
          trendType="positive"
          subtext="Intermodal dwell factor"
          icon={Clock}
        />
        <StatCard
          title="High-Risk Suppliers"
          value={currentMetrics ? currentMetrics.high_risk_suppliers_count : "19"}
          change="+2 added to watchlist"
          trend="up"
          trendType="negative"
          subtext="Geopolitical & solvency"
          alertLevel="warning"
          icon={AlertTriangle}
        />
        <StatCard
          title="Predicted Stockouts (30d)"
          value={currentMetrics ? currentMetrics.predicted_stockouts_count : "7"}
          change="Critical line impact"
          trend="up"
          trendType="negative"
          subtext="Auto-mitigation available"
          alertLevel="critical"
          icon={Boxes}
        />
      </div>

      {/* EMBEDDED 3D CONTROL TOWER SPOTLIGHT BANNER */}
      <Card className="p-4 sm:p-5 border-nexus-cyan/40 bg-gradient-to-r from-nexus-cyan/10 via-surface-300/40 to-nexus-purple/10 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-nexus-cyan/20 border border-nexus-cyan/50 flex items-center justify-center text-nexus-cyan shadow-glow-cyan flex-shrink-0 animate-pulse">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-nexus-cyan">
                  3D GEOSPATIAL CONTROL TOWER
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-emerald animate-ping" />
                <span className="text-[10px] font-mono text-nexus-emerald font-bold">ORBITAL SYNCHRONIZATION ACTIVE</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-sans mt-0.5">
                Full Interactive 3D Earth & Worldwide Network Telemetry
              </h3>
              <p className="text-xs text-slate-300 font-sans mt-1 max-w-2xl">
                Experience full planetary surveillance with 9 switchable intelligence layers, Great-Circle 3D parabolic geodesic curves, animated shipments, and strategic chokepoint threat radii.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start lg:self-center">
            <Link href="/network">
              <Button variant="glow" size="md" className="font-mono text-xs whitespace-nowrap shadow-glow-cyan">
                <Globe2 className="w-4 h-4 mr-2" />
                Launch 3D Earth Globe
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Row 2: Demand Trend Forecast & Regional Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-nexus-cyan" />
                <span>Global Demand Telemetry & Machine Learning Forecast (14-Day Horizon)</span>
              </div>
              <Badge variant="info">DuckDB Accelerated</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={trends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-nexus-blue" />
                <span>Regional SLA Performance</span>
              </div>
              <Badge variant="neutral">By Geopolitical Theater</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegionalPerformanceChart data={regional} />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Supplier Risk Distribution & High-Priority Autonomous Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-nexus-emerald" />
                <span>Supplier Risk Stratification</span>
              </div>
              <Badge variant="neutral">412 Monitored</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskDistributionBar data={supplierRisk} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-nexus-cyan" />
                <span>High-Priority Prescriptive Recommendations</span>
              </div>
              <span className="text-xs font-mono text-nexus-emerald font-semibold">
                Est. Total Savings: $5.67M
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-lg bg-surface-200/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          rec.priority === "Critical"
                            ? "critical"
                            : rec.priority === "High"
                            ? "warning"
                            : "info"
                        }
                      >
                        {rec.priority}
                      </Badge>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">
                        {rec.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{rec.rationale}</p>
                  </div>
                  <div className="flex flex-col sm:items-end flex-shrink-0">
                    <span className="text-xs font-mono font-bold text-nexus-emerald">
                      Save {formatCurrency(rec.estimated_savings_usd)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Window: {rec.mitigation_window_hours}h
                    </span>
                    <Link href="/decisions" className="mt-1">
                      <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                        Execute Playbook
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Operational Disruptions & Live Incident Stream */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-nexus-rose" />
              <span>Real-Time Operational Alerts & Supply Chain Disruptions</span>
            </div>
            <Link href="/anomalies">
              <Button variant="ghost" size="sm" className="text-xs font-mono text-nexus-cyan">
                View All Incidents &rarr;
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Alert Code</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Disruption Event</th>
                  <th className="py-2.5 px-3">Target Entity</th>
                  <th className="py-2.5 px-3">Est. Value at Risk</th>
                  <th className="py-2.5 px-3">Detected</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-surface-200/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-nexus-cyan">{alert.alert_code}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          alert.severity === "Critical"
                            ? "critical"
                            : alert.severity === "High"
                            ? "warning"
                            : "info"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-white max-w-sm">
                      <div className="truncate">{alert.title}</div>
                      <div className="text-[11px] text-slate-400 font-sans truncate">{alert.summary}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {alert.entity_type} ({alert.entity_id})
                    </td>
                    <td className="py-3 px-3 font-bold text-nexus-rose">
                      {formatCurrency(alert.impact_usd)}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{alert.detected_at}</td>
                    <td className="py-3 px-3 text-right">
                      <Link href="/decisions">
                        <Button variant="subtle" size="sm" className="h-7 text-[11px] px-2.5">
                          Mitigate
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import { ScenarioResult } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Sliders,
  Play,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
  Clock,
  Layers,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  Zap,
  RotateCcw
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function WhatIfSimulatorPage() {
  const [scenarioId, setScenarioId] = useState("suez_chokepoint_block");
  const [severity, setSeverity] = useState(1.5);
  const [duration, setDuration] = useState(14);
  const [rerouteCape, setRerouteCape] = useState(true);
  const [bufferDrawdown, setBufferDrawdown] = useState(25);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  const SCENARIOS = [
    { id: "suez_chokepoint_block", name: "Red Sea / Suez Maritime Interruption & Bab el-Mandeb Closure", desc: "Mandatory circumnavigation of Africa via Cape of Good Hope with transit delay & bunker fuel surge." },
    { id: "supplier_failure", name: "Strategic Tier-1 Supplier Failure / Fab Force Majeure", desc: "Key semiconductor or advanced assembly facility sudden shutdown and buffer starvation." },
    { id: "warehouse_shutdown", name: "Central Distribution Hub Shutdown (Rotterdam / Chicago)", desc: "Catastrophic facility interruption with inland feeder barge and rail gridlock." },
    { id: "demand_spike_30", name: "+30% Global Unforecasted Demand Surge / Black Swan", desc: "Retail customer ordering acceleration exceeding safety stock and slot allocations." },
    { id: "transport_cost_surge", name: "Transportation Fuel & Spot Container Rate Surge (+140%)", desc: "Maritime bunker index spike and spot air charter market squeeze across trans-oceanic lanes." },
    { id: "delay_surge", name: "Multi-Port Berth Congestion & Intermodal Terminal Dwell Surge", desc: "Anchor dwell cascade at Long Beach, Ningbo, and Rotterdam container terminals." }
  ];

  const runSimulation = async () => {
    setIsSimulating(true);
    setIsArmed(false);
    try {
      const res = await api.simulateScenario({
        scenario_id: scenarioId,
        severity_multiplier: severity,
        duration_days: duration,
        reroute_via_cape_good_hope: rerouteCape,
        buffer_inventory_drawdown_pct: bufferDrawdown
      });
      setResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  // Comparative data for Before vs After chart
  const comparisonData = result?.comparison_metrics || [
    { metric: "Operational Cost ($M)", baseline: 2.45, simulated: 5.60, delta: "+$3.15M" },
    { metric: "Shipment Delay (hrs)", baseline: 4.2, simulated: 28.5, delta: "+24.3 hrs" },
    { metric: "On-Time SLA (%)", baseline: 94.6, simulated: 68.2, delta: "-26.4%" },
    { metric: "Safety Stock Risk (SKUs)", baseline: 2, simulated: 14, delta: "+12 SKUs" }
  ];

  return (
    <PageContainer
      title="WHAT-IF SCENARIO SIMULATOR"
      subtitle="Monte Carlo crisis simulation, geopolitical chokepoint disruption modeling, and resilience stress-testing"
      breadcrumb={["NEXUS", "Decision Operations", "What-If Simulator"]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Parameter Controls */}
        <Card className="p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-nexus-cyan" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">Simulation Engine</h3>
            </div>
            <Badge variant="purple">Monte Carlo Stochastic</Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Disruption Scenario
              </label>
              <select
                value={scenarioId}
                onChange={(e) => setScenarioId(e.target.value)}
                className="w-full bg-surface-200 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-nexus-cyan font-mono"
              >
                {SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 font-sans mt-1">
                {SCENARIOS.find((s) => s.id === scenarioId)?.desc}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Severity Multiplier</span>
                <span className="text-nexus-cyan font-bold">{severity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={severity}
                onChange={(e) => setSeverity(parseFloat(e.target.value))}
                className="w-full accent-nexus-cyan cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Disruption Duration</span>
                <span className="text-nexus-purple font-bold">{duration} Days</span>
              </div>
              <input
                type="range"
                min="7"
                max="60"
                step="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-nexus-purple cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Buffer Drawdown %</span>
                <span className="text-nexus-emerald font-bold">{bufferDrawdown}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={bufferDrawdown}
                onChange={(e) => setBufferDrawdown(parseInt(e.target.value))}
                className="w-full accent-nexus-emerald cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-200/50 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-slate-200 block font-semibold">Active Rerouting Protocol</span>
                <span className="text-[10px] font-mono text-slate-400">Cape of Good Hope / Air Bridge</span>
              </div>
              <input
                type="checkbox"
                checked={rerouteCape}
                onChange={(e) => setRerouteCape(e.target.checked)}
                className="w-4 h-4 accent-nexus-cyan cursor-pointer"
              />
            </div>

            <Button
              variant="glow"
              size="md"
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full font-mono text-xs"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isSimulating ? "Computing Monte Carlo Trees..." : "Execute Crisis Simulation"}
            </Button>
          </div>
        </Card>

        {/* Simulation Output Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              title="Projected Cost Impact"
              value={result ? formatCurrency(result.projected_additional_cost_usd) : "$3.15M"}
              change="Fuel & dwell inflation"
              trend="up"
              trendType="negative"
              alertLevel="critical"
              icon={DollarSign}
            />
            <StatCard
              title="Mean Lead Time Increase"
              value={result ? `+${result.mean_delay_increase_days} days` : "+11.4 days"}
              change="Circumnavigation penalty"
              trend="up"
              trendType="negative"
              alertLevel="warning"
              icon={Clock}
            />
            <StatCard
              title="Affected Trade Corridors"
              value={result ? `${result.affected_routes_count} Corridors` : "28 Corridors"}
              subtext="Maritime & air lines impacted"
              icon={Layers}
            />
            <StatCard
              title="Critical SKUs at Risk"
              value={result ? `${result.stockout_risk_skus_count} SKUs` : "14 SKUs"}
              subtext="Safety buffer exhausted"
              alertLevel="critical"
              icon={AlertTriangle}
            />
          </div>

          {/* SIDE-BY-SIDE BEFORE VS AFTER COMPARISON CHART */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-nexus-cyan" />
                  <span>Before-vs-After Operational Stress Comparison</span>
                </div>
                <Badge variant="cyan">Baseline vs Modelled Projection</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0b1329",
                        borderColor: "#1e293b",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff"
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Bar dataKey="baseline" name="Baseline (Nominal)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="simulated" name="Simulated (Crisis Impact)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Playbook Card with Arm Button */}
          <Card className={`p-5 transition-all ${isArmed ? "border-nexus-emerald/80 bg-nexus-emerald/10 shadow-glow-emerald" : "border-nexus-cyan/40 bg-nexus-cyan/5"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-nexus-cyan">
                  {isArmed ? <CheckCircle2 className="w-4 h-4 text-nexus-emerald" /> : <ShieldCheck className="w-4 h-4" />}
                  <span className={isArmed ? "text-nexus-emerald" : "text-nexus-cyan"}>
                    {isArmed ? "OPERATIONAL MITIGATION PROTOCOL ARMED" : "RECOMMENDED OPERATIONAL PLAYBOOK"}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-mono leading-relaxed mt-1">
                  {result?.recommended_playbook ||
                    "PLAYBOOK-ALPHA-CAPE: Reallocate Tier-1 High-Value Cargo to Frankfurt Air Bridge while routing bulk raw components via Cape with extended lead buffer."}
                </p>
              </div>

              <Button
                variant={isArmed ? "outline" : "glow"}
                size="sm"
                onClick={() => setIsArmed(!isArmed)}
                className="font-mono text-xs whitespace-nowrap self-start sm:self-center"
              >
                {isArmed ? (
                  <span className="flex items-center text-nexus-emerald">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Protocol Active
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Arm Mitigation Playbook
                  </span>
                )}
              </Button>
            </div>
          </Card>

          {/* Affected Entities & Impact Progression Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Impact Timeline Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span>Projected Impact Timeline</span>
                  <Badge variant="neutral">Cumulative</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-2.5">Milestone</th>
                        <th className="py-2 px-2.5">Cumulative Cost</th>
                        <th className="py-2 px-2.5 text-right">At-Risk Consignments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {(result?.impact_timeline || [
                        { day: "Day 2", cumulative_cost_impact_usd: 450000, unmet_demand_units: 400, at_risk_tier1_shipments: 14 },
                        { day: "Day 6", cumulative_cost_impact_usd: 1350000, unmet_demand_units: 1200, at_risk_tier1_shipments: 21 },
                        { day: "Day 10", cumulative_cost_impact_usd: 2250000, unmet_demand_units: 2400, at_risk_tier1_shipments: 26 },
                        { day: "Day 14", cumulative_cost_impact_usd: 3150000, unmet_demand_units: 3600, at_risk_tier1_shipments: 32 },
                      ]).map((row, idx) => (
                        <tr key={idx} className="hover:bg-surface-200/40 transition-colors">
                          <td className="py-2 px-2.5 font-semibold text-white">{row.day}</td>
                          <td className="py-2 px-2.5 font-bold text-nexus-rose">{formatCurrency(row.cumulative_cost_impact_usd)}</td>
                          <td className="py-2 px-2.5 text-right font-bold text-nexus-amber">{row.at_risk_tier1_shipments} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Affected Critical Entities */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span>Affected Supply Chain Entities</span>
                  <Badge variant="critical">High Exposure</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {(result?.affected_entities || [
                    { entity: "Bab el-Mandeb / Suez Strait", impact: "Mandatory Avoidance", risk: "Critical" },
                    { entity: "Rotterdam Super-Hub", impact: "Container Inflow Starvation", risk: "High" },
                    { entity: "Frankfurt Air Bridge", impact: "Air Charter Surcharge +45%", risk: "Moderate" }
                  ]).map((ent, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-surface-200/60 border border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-white font-bold block">{ent.entity}</span>
                        <span className="text-slate-400 text-[11px]">{ent.impact}</span>
                      </div>
                      <Badge variant={ent.risk === "Critical" ? "critical" : ent.risk === "High" ? "warning" : "info"}>
                        {ent.risk}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

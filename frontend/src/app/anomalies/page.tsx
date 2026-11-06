"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import {
  AlertOctagon,
  Radar,
  Activity,
  CheckCircle2,
  Play,
  RotateCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  HelpCircle
} from "lucide-react";

export default function AnomaliesPage() {
  const [domain, setDomain] = useState("shipments");
  const [algorithm, setAlgorithm] = useState("isolation_forest");
  const [contamination, setContamination] = useState(0.05);
  const [sensitivitySigma, setSensitivitySigma] = useState(2.5);

  const [anomalyResult, setAnomalyResult] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    runDetection();
  }, []);

  const runDetection = async (
    dom = domain,
    algo = algorithm,
    cont = contamination,
    sigma = sensitivitySigma
  ) => {
    setIsDetecting(true);
    try {
      const res = await api.detectAnomalies({
        domain: dom,
        algorithm: algo,
        contamination: cont,
        sensitivity_sigma: sigma
      });
      setAnomalyResult(res);
    } catch (err) {
      console.error("Anomaly detection error:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  const events = anomalyResult?.events || [];
  const criticalCount = events.filter((e: any) => e.severity === "CRITICAL").length;
  const highCount = events.filter((e: any) => e.severity === "HIGH").length;

  return (
    <PageContainer
      title="OPERATIONAL ANOMALY DETECTION CENTER"
      subtitle="Unsupervised outlier discovery (Isolation Forest, DBSCAN, Z-Score, IQR) with mathematical evidence breakdowns"
      breadcrumb={["NEXUS", "Risk Intelligence", "Anomaly Detection"]}
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Detection Engine"
          value={algorithm.toUpperCase().replace("_", " ")}
          subtext={`Contamination: ${(contamination * 100).toFixed(0)}%`}
          icon={Radar}
        />
        <StatCard
          title="Critical Anomalies"
          value={`${criticalCount} Critical`}
          subtext="Immediate escalation required"
          alertLevel="critical"
          icon={AlertOctagon}
        />
        <StatCard
          title="High-Severity Deviations"
          value={`${highCount} Elevated`}
          subtext="Exceeds 2.5σ baseline"
          alertLevel="warning"
          icon={Activity}
        />
        <StatCard
          title="Anomalies Analyzed"
          value={anomalyResult ? `${anomalyResult.total_records_analyzed}` : "1,200"}
          subtext={anomalyResult ? `${anomalyResult.anomalies_detected_count} Outliers Found` : "Stream active"}
          icon={Layers}
        />
      </div>

      {/* 1. ANOMALY WORKBENCH CONTROLS */}
      <Card className="p-5 border-slate-800 bg-surface-100/90 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-nexus-cyan/10 border border-nexus-cyan/30 flex items-center justify-center text-nexus-cyan">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                ANOMALY DETECTION WORKBENCH & PARAMETER TUNING
              </h3>
              <p className="text-xs text-slate-400">
                Configure operational telemetry domain, algorithm architecture, and sensitivity boundaries
              </p>
            </div>
          </div>

          <Button
            onClick={() => runDetection()}
            disabled={isDetecting}
            className="bg-nexus-cyan text-surface-50 hover:bg-nexus-cyan/90 font-mono text-xs px-4"
          >
            {isDetecting ? (
              <>
                <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Scanning Stream...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-2" />
                Run Anomaly Detection
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1 text-[11px] font-sans">1. Telemetry Domain</label>
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                runDetection(e.target.value);
              }}
              className="w-full bg-surface-200 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-nexus-cyan"
            >
              <option value="shipments">Shipments (Transit, Dwell, Kinematics)</option>
              <option value="suppliers">Suppliers (Reliability Drift, Defects)</option>
              <option value="inventory">Inventory (Stock Spikes, Depletion)</option>
              <option value="orders">Orders (Transaction Size Outliers)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px] font-sans">2. Detection Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value);
                runDetection(domain, e.target.value);
              }}
              className="w-full bg-surface-200 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-nexus-cyan"
            >
              <option value="isolation_forest">Isolation Forest (Tree Partition)</option>
              <option value="dbscan">DBSCAN Density Outlier (Noise: -1)</option>
              <option value="zscore">Statistical Z-Score (|Z| &gt; σ)</option>
              <option value="iqr">Interquartile Range (IQR 1.5x)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
              <span>3. Contamination Rate</span>
              <span className="text-nexus-cyan font-mono">{(contamination * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.15"
              step="0.01"
              value={contamination}
              onChange={(e) => setContamination(parseFloat(e.target.value))}
              className="w-full accent-nexus-cyan h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
              <span>4. Sensitivity Sigma</span>
              <span className="text-nexus-purple font-mono">{sensitivitySigma.toFixed(1)} σ</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.0"
              step="0.1"
              value={sensitivitySigma}
              onChange={(e) => setSensitivitySigma(parseFloat(e.target.value))}
              className="w-full accent-nexus-purple h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* 2. DETECTED ANOMALIES FEED WITH EVIDENCE DRAWER */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card className="p-8 text-center border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm text-slate-300 font-medium">No statistical outliers detected under current sensitivity parameters.</p>
            <p className="text-xs text-slate-500 mt-1">Operational equilibrium confirmed within normal confidence bands.</p>
          </Card>
        ) : (
          events.map((ev: any) => {
            const isExpanded = expandedId === ev.id;
            return (
              <Card
                key={ev.id}
                className={`p-4 sm:p-5 border-slate-800 transition-colors ${
                  ev.severity === "CRITICAL"
                    ? "border-red-500/40 bg-red-500/5"
                    : ev.severity === "HIGH"
                    ? "border-amber-500/30"
                    : "hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-nexus-cyan">{ev.id}</span>
                    <Badge
                      variant={
                        ev.severity === "CRITICAL"
                          ? "critical"
                          : ev.severity === "HIGH"
                          ? "warning"
                          : "info"
                      }
                    >
                      {ev.severity} ({ev.score})
                    </Badge>
                    <span className="text-xs font-semibold text-white truncate">{ev.entity}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                    <span>Method: <strong className="text-slate-200">{ev.detection_method}</strong></span>
                    <span className="text-nexus-cyan font-bold">{ev.status}</span>
                  </div>
                </div>

                {/* Details Row */}
                <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-sans">Anomaly Type:</span>
                    <span className="text-sm font-semibold text-white">{ev.anomaly_type}</span>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Observed Telemetry</span>
                      <span className="text-sm font-bold text-red-400">{ev.detected_value}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Expected Baseline</span>
                      <span className="text-sm font-bold text-emerald-400">{ev.baseline_expected}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    className="text-xs font-mono self-start md:self-auto"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 mr-1" />
                        Hide Evidence
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 mr-1" />
                        Mathematical Evidence ({ev.evidence?.length || 0})
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-slate-400 font-sans mt-1">
                  {ev.context}
                </p>

                {/* Mathematical Evidence Breakdown Drawer */}
                {isExpanded && ev.evidence && (
                  <div className="mt-4 pt-3 border-t border-slate-800 bg-surface-200/50 p-3 rounded text-xs font-mono space-y-2">
                    <span className="text-slate-300 font-bold block pb-1 border-b border-slate-800">
                      Feature Deviation Breakdown (Standard Deviation &sigma; Distance):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      {ev.evidence.map((dev: any, dIdx: number) => (
                        <div key={dIdx} className="p-2.5 rounded bg-surface-100 border border-slate-800 space-y-1">
                          <div className="flex justify-between font-bold text-white">
                            <span>{dev.metric}</span>
                            <span className="text-red-400">+{dev.deviation_sigma}&sigma;</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>Observed: {dev.observed_value}</span>
                            <span>Median: {dev.baseline_median}</span>
                          </div>
                          <div className="text-[10px] text-nexus-amber font-sans">
                            {dev.direction.replace("_", " ")} normal distribution
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </PageContainer>
  );
}

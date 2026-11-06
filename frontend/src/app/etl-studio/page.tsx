"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import { PipelineInfo, DataQualityReport, DatasetMetadata, LineageGraph } from "@/types";
import { formatNumber } from "@/lib/utils";
import {
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Play,
  Terminal,
  FileText,
  GitBranch,
  Layers,
  ArrowRight,
  Database,
  Info,
} from "lucide-react";

export default function ETLStudioPage() {
  const [pipelines, setPipelines] = useState<PipelineInfo[]>([]);
  const [quality, setQuality] = useState<DataQualityReport | null>(null);
  const [metadata, setMetadata] = useState<DatasetMetadata[]>([]);
  const [lineage, setLineage] = useState<LineageGraph | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"pipelines" | "quality" | "lineage" | "datasets">("pipelines");

  const loadData = async () => {
    try {
      const [p, q, m, l, lg] = await Promise.all([
        api.getETLPipelines(),
        api.getDataQualityMetrics(),
        api.getDatasetMetadata(),
        api.getDataLineage(),
        api.getPipelineLogs(),
      ]);
      setPipelines(p);
      setQuality(q);
      setMetadata(m);
      setLineage(l);
      setLogs(lg);
    } catch (e) {
      console.error("Error loading ETL data:", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      const newLogs = await api.getPipelineLogs();
      setLogs(newLogs);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunPipeline = async (pipelineId: string) => {
    setIsRunning(true);
    try {
      await api.triggerPipelineRun(pipelineId);
      await loadData();
    } catch (err: any) {
      alert(`Pipeline error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PageContainer
      title="ETL & DATA QUALITY STUDIO"
      subtitle="Streaming medallion extraction, transformation pipelines, automated quality audits, and data lineage graph"
      breadcrumb={["NEXUS", "Data Platform", "ETL Studio"]}
      actions={
        <div className="flex items-center space-x-2">
          <Button
            variant="glow"
            size="sm"
            disabled={isRunning}
            onClick={() => handleRunPipeline("PIPE-MEDALLION-MASTER")}
            className="font-mono text-xs"
          >
            <Play className={`w-3.5 h-3.5 mr-1.5 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Executing Medallion Pipeline..." : "Execute Full Medallion ETL"}
          </Button>
        </div>
      }
    >
      {/* Top Quality Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Data Quality Score"
          value={quality ? `${quality.overall_health_score}%` : "99.2%"}
          subtext="Certified Star Schema Quality"
          trend="up"
          trendType="positive"
          icon={ShieldCheck}
        />
        <StatCard
          title="Completeness Metric"
          value={quality ? `${quality.completeness_score}%` : "99.8%"}
          subtext={`Missing: ${quality?.missing_pct || 0.2}% across cells`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Validity & Consistency"
          value={quality ? `${quality.validity_score}%` : "99.4%"}
          subtext="Temporal & Domain constraints pass"
          icon={Layers}
        />
        <StatCard
          title="Referential Integrity"
          value={quality ? `${quality.referential_integrity_score}%` : "100.0%"}
          subtext="Zero orphan foreign keys"
          icon={Database}
        />
      </div>

      {/* Surface Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("pipelines")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "pipelines"
              ? "bg-nexus-cyan/20 text-nexus-cyan font-bold border border-nexus-cyan/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Active Pipelines ({pipelines.length})
        </button>
        <button
          onClick={() => setActiveTab("quality")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "quality"
              ? "bg-nexus-cyan/20 text-nexus-cyan font-bold border border-nexus-cyan/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Data Quality Certification
        </button>
        <button
          onClick={() => setActiveTab("lineage")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "lineage"
              ? "bg-nexus-cyan/20 text-nexus-cyan font-bold border border-nexus-cyan/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Data Lineage Graph
        </button>
        <button
          onClick={() => setActiveTab("datasets")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "datasets"
              ? "bg-nexus-cyan/20 text-nexus-cyan font-bold border border-nexus-cyan/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Dataset Inventory & Provenance ({metadata.length})
        </button>
      </div>

      {/* TAB 1: Pipelines Table & Live Log Terminal */}
      {activeTab === "pipelines" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 text-nexus-cyan" />
                  <span>Ingestion & ETL Pipelines</span>
                </div>
                <Badge variant="info">{pipelines.length} Registered</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Pipeline ID</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Source &rarr; Target</th>
                      <th className="py-2.5 px-3">Throughput</th>
                      <th className="py-2.5 px-3">P95 Latency</th>
                      <th className="py-2.5 px-3">Quality</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Trigger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {pipelines.map((p) => (
                      <tr key={p.pipeline_id} className="hover:bg-surface-200/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-nexus-cyan">{p.pipeline_id}</td>
                        <td className="py-3 px-3 font-sans font-medium text-white">{p.name}</td>
                        <td className="py-3 px-3 text-slate-400">
                          {p.source} &rarr; <span className="text-slate-200">{p.target}</span>
                        </td>
                        <td className="py-3 px-3">{p.records_per_minute} rec/min</td>
                        <td className="py-3 px-3 text-nexus-cyan">{p.latency_ms} ms</td>
                        <td className="py-3 px-3 font-bold text-nexus-emerald">
                          {p.data_quality_score}%
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={p.status.includes("Running") ? "warning" : "success"}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="subtle"
                            size="sm"
                            disabled={isRunning}
                            onClick={() => handleRunPipeline(p.pipeline_id)}
                            className="h-7 text-[11px] px-2.5"
                          >
                            Execute
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Live Pipeline Execution Logs Terminal */}
          <Card className="p-4 bg-black/90 border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-nexus-cyan" />
                <span className="font-bold">Real-Time Ingestion Logs Terminal</span>
              </div>
              <Badge variant="purple">Live Stdout</Badge>
            </div>
            <div className="h-56 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300 scrollbar-thin">
              {logs.map((logLine, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    logLine.includes("[ERROR]")
                      ? "text-nexus-rose font-bold"
                      : logLine.includes("[SUCCESS]")
                      ? "text-nexus-emerald font-bold"
                      : logLine.includes("[START]")
                      ? "text-nexus-cyan font-bold"
                      : "text-slate-400"
                  }`}
                >
                  {logLine}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Data Quality Certification */}
      {activeTab === "quality" && quality && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-nexus-emerald" />
                  <span>Data Quality Dimension Scorecard: {quality.table_name}</span>
                </div>
                <Badge variant={quality.status === "Healthy" ? "success" : "warning"}>
                  {quality.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-surface-200/50 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Completeness:</span>
                    <span className="text-nexus-emerald font-bold">{quality.completeness_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800">
                    <div className="h-full bg-nexus-emerald rounded-full" style={{ width: `${quality.completeness_score}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Missing values: {quality.missing_pct}%</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-200/50 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Uniqueness:</span>
                    <span className="text-nexus-cyan font-bold">{quality.uniqueness_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800">
                    <div className="h-full bg-nexus-cyan rounded-full" style={{ width: `${quality.uniqueness_score}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Duplicate records: {quality.duplicate_pct}%</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-200/50 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Validity:</span>
                    <span className="text-nexus-purple font-bold">{quality.validity_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800">
                    <div className="h-full bg-nexus-purple rounded-full" style={{ width: `${quality.validity_score}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Domain & range validation</span>
                </div>

                <div className="p-4 rounded-xl bg-surface-200/50 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Consistency:</span>
                    <span className="text-nexus-emerald font-bold">{quality.consistency_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800">
                    <div className="h-full bg-nexus-emerald rounded-full" style={{ width: `${quality.consistency_score}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Cross-field chronological checks</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detected Quality Anomalies & Issue Reports */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-nexus-amber" />
                  <span>Quality Issue Quarantine & Remediation Log</span>
                </div>
                <Badge variant="neutral">{quality.detected_issues.length} Flagged</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quality.detected_issues.length === 0 ? (
                <div className="py-6 text-center text-xs font-mono text-nexus-emerald flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero critical quality violations detected in current warehouse state.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {quality.detected_issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-surface-200/50 border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="space-y-0.5">
                        <span className="text-nexus-cyan font-bold block">{issue.column}</span>
                        <span className="text-slate-300">{issue.message}</span>
                      </div>
                      <Badge variant={issue.severity === "Critical" ? "critical" : "warning"}>
                        {issue.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Data Lineage Graph */}
      {activeTab === "lineage" && lineage && (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-nexus-cyan" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                End-to-End Medallion Data Lineage Graph
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">Bronze Raw</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Silver Cleaned</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">Gold Curated</span>
            </div>
          </div>

          {/* Medallion Flow Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bronze Layer */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-amber-400 pb-1 border-b border-amber-500/20">
                1. Bronze Raw Sources
              </h4>
              {lineage.nodes
                .filter((n) => n.layer === "raw")
                .map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-surface-200 border border-amber-500/30 text-xs font-mono space-y-1">
                    <span className="font-bold text-white block truncate">{n.label}</span>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{n.format}</span>
                      <span className="text-amber-400">{n.type}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Silver Layer */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 pb-1 border-b border-cyan-500/20">
                2. Silver Cleaned & Transformed
              </h4>
              {lineage.nodes
                .filter((n) => n.layer === "cleaned")
                .map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-surface-200 border border-cyan-500/30 text-xs font-mono space-y-1">
                    <span className="font-bold text-white block truncate">{n.label}</span>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{n.format}</span>
                      <span className="text-nexus-cyan">{n.type}</span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Gold Layer */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-purple-400 pb-1 border-b border-purple-500/20">
                3. Gold Curated Star Schema
              </h4>
              {lineage.nodes
                .filter((n) => n.layer === "curated")
                .map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-surface-200 border border-purple-500/30 text-xs font-mono space-y-1">
                    <span className="font-bold text-white block truncate">{n.label}</span>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{n.format}</span>
                      <span className="text-nexus-purple">{n.type}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: Dataset Inventory & Licensing */}
      {activeTab === "datasets" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-nexus-cyan" />
                <span>Dataset Catalog, Provenance & Licensing Documentation</span>
              </div>
              <Badge variant="neutral">{metadata.length} Datasets</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Dataset Name</th>
                    <th className="py-2.5 px-3">File Name</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3">Records</th>
                    <th className="py-2.5 px-3">Origin & Attribution</th>
                    <th className="py-2.5 px-3">License</th>
                    <th className="py-2.5 px-3 text-right">Target Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {metadata.map((ds, idx) => (
                    <tr key={idx} className="hover:bg-surface-200/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white font-sans">{ds.dataset_name}</td>
                      <td className="py-3 px-3 text-nexus-cyan">{ds.file_name}</td>
                      <td className="py-3 px-3">{ds.format}</td>
                      <td className="py-3 px-3 font-bold">{formatNumber(ds.records)}</td>
                      <td className="py-3 px-3 text-slate-400">{ds.origin}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-surface-100 text-slate-300 border border-slate-700/60 text-[10px]">
                          {ds.license}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-nexus-purple">
                        {ds.integration_target}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

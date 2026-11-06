"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import {
  GitPullRequest,
  Clock,
  AlertTriangle,
  Play,
  RotateCw,
  CheckCircle2,
  Sliders,
  Layers,
  Activity,
  Cpu,
  Sparkles,
  BarChart3,
  Network
} from "lucide-react";

export default function MiningLabPage() {
  // KDD Pipeline State
  const [kddStages, setKddStages] = useState<any[]>([]);
  const [kddResult, setKddResult] = useState<any>(null);
  const [isExecutingKdd, setIsExecutingKdd] = useState(false);

  // Clustering State
  const [clusteringTarget, setClusteringTarget] = useState("suppliers");
  const [clusteringAlgo, setClusteringAlgo] = useState("kmeans");
  const [clusterCount, setClusterCount] = useState(4);
  const [clusteringResult, setClusteringResult] = useState<any>(null);
  const [isClustering, setIsClustering] = useState(false);

  // Process variants & bottlenecks
  const [variants, setVariants] = useState<any[]>([]);
  const [bottlenecks, setBottlenecks] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const stages = await api.getKddStages();
      setKddStages(stages);
      
      const pVars = await api.getProcessVariants();
      setVariants(pVars);

      const bNecks = await api.getBottlenecks();
      setBottlenecks(bNecks);

      // Run initial clustering
      runClusteringAction("suppliers", "kmeans", 4);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunKddPipeline = async () => {
    setIsExecutingKdd(true);
    try {
      const res = await api.executeKddPipeline({
        pipeline_name: "KDD-Enterprise-Production",
        target_dataset: "product_purchasing",
        mining_task: "Association_FPGrowth",
        parameters: { min_support: 0.04, min_confidence: 0.35 }
      });
      setKddResult(res);
    } catch (err) {
      console.error("KDD execution error:", err);
    } finally {
      setIsExecutingKdd(false);
    }
  };

  const runClusteringAction = async (target = clusteringTarget, algo = clusteringAlgo, k = clusterCount) => {
    setIsClustering(true);
    try {
      const res = await api.runClustering({
        target,
        algorithm: algo,
        n_clusters: k,
        eps: 0.8,
        min_samples: 4
      });
      setClusteringResult(res);
    } catch (err) {
      console.error("Clustering run error:", err);
    } finally {
      setIsClustering(false);
    }
  };

  const scatter = clusteringResult?.scatter_points || [];
  const profiles = clusteringResult?.cluster_profiles || [];

  return (
    <PageContainer
      title="MINING LABORATORY & KDD ENGINE"
      subtitle="Knowledge Discovery in Databases (KDD) 7-stage pipeline, multidimensional clustering, and process topology"
      breadcrumb={["NEXUS", "Analytics & Mining", "Mining Laboratory"]}
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="KDD Pipeline Status"
          value={kddResult ? "Completed" : "Standby"}
          subtext={kddResult ? `Total Duration: ${kddResult.total_duration_ms} ms` : "7 Reusable Stages"}
          alertLevel="normal"
          icon={Cpu}
        />
        <StatCard
          title="Active Clustering Model"
          value={clusteringResult ? clusteringResult.algorithm : "K-MEANS"}
          subtext={clusteringResult ? `${clusteringResult.clusters_count} Segments Generated` : "Ready"}
          icon={Network}
        />
        <StatCard
          title="Silhouette Score"
          value={clusteringResult?.silhouette_score ? `${clusteringResult.silhouette_score}` : "0.141"}
          subtext="Cluster separation & density metric"
          trend="up"
          trendType="positive"
          icon={Activity}
        />
        <StatCard
          title="Critical Bottlenecks"
          value={`${bottlenecks.length} Identified`}
          subtext="Rotterdam & Long Beach terminals"
          alertLevel="warning"
          icon={AlertTriangle}
        />
      </div>

      {/* 1. KDD 7-STAGE PIPELINE RUNNER */}
      <Card className="p-5 border-slate-800 bg-surface-100/90 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-nexus-cyan/10 border border-nexus-cyan/30 flex items-center justify-center text-nexus-cyan">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                7-STAGE KNOWLEDGE DISCOVERY IN DATABASES (KDD) PIPELINE
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end reproducible pipeline execution with stage benchmarking and relational logging
              </p>
            </div>
          </div>

          <Button
            onClick={handleRunKddPipeline}
            disabled={isExecutingKdd}
            className="bg-nexus-cyan text-surface-50 hover:bg-nexus-cyan/90 font-mono text-xs px-4"
          >
            {isExecutingKdd ? (
              <>
                <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Executing KDD Pipeline...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-2" />
                Execute 7-Stage KDD Pipeline
              </>
            )}
          </Button>
        </div>

        {/* Visual Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-4">
          {[
            { id: 1, name: "Data Selection", sub: "Warehouse Fact Subset" },
            { id: 2, name: "Data Cleaning", sub: "Nulls & Outlier Bounds" },
            { id: 3, name: "Data Integration", sub: "Dimensional Joins" },
            { id: 4, name: "Transformation", sub: "StandardScaler / One-Hot" },
            { id: 5, name: "Data Mining", sub: "FP-Growth / K-Means" },
            { id: 6, name: "Pattern Eval", sub: "Lift & Silhouette" },
            { id: 7, name: "Presentation", sub: "Decision Playbooks" }
          ].map((stage) => {
            const executedStage = kddResult?.stages?.find((s: any) => s.stage === stage.id);
            const isDone = Boolean(executedStage);
            return (
              <div
                key={stage.id}
                className={`p-3 rounded-lg border text-xs font-mono transition-colors ${
                  isDone
                    ? "bg-nexus-cyan/5 border-nexus-cyan/40 text-nexus-cyan"
                    : "bg-surface-200/50 border-slate-800 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[10px] text-slate-500">STAGE {stage.id}</span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-nexus-cyan" />}
                </div>
                <div className="font-semibold text-white truncate text-[11px]">{stage.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{stage.sub}</div>
                {executedStage && (
                  <div className="mt-2 text-[10px] text-nexus-cyan font-bold">
                    {executedStage.duration_ms} ms
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Execution Log Summary */}
        {kddResult && (
          <div className="mt-4 p-3 rounded bg-surface-200/60 border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800/80 mb-2">
              <span className="text-nexus-cyan font-bold">RUN ID: {kddResult.run_id}</span>
              <span className="text-slate-400">Total Latency: <strong className="text-white">{kddResult.total_duration_ms} ms</strong></span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-slate-300">Findings: </strong> {kddResult.summary_findings}
            </p>
          </div>
        )}
      </Card>

      {/* 2. MULTIDIMENSIONAL CLUSTERING WORKBENCH */}
      <Card className="p-5 border-slate-800 bg-surface-100/90 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-nexus-purple/10 border border-nexus-purple/30 flex items-center justify-center text-nexus-purple">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                MULTIDIMENSIONAL CLUSTERING & SEGMENTATION WORKBENCH
              </h3>
              <p className="text-xs text-slate-400">
                K-Means, Hierarchical, DBSCAN, and GMM segmentation with 2D PCA projection
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => runClusteringAction()}
              disabled={isClustering}
              className="bg-nexus-purple text-white hover:bg-nexus-purple/90 font-mono text-xs px-4"
            >
              {isClustering ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Fitting Clusters...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-2" />
                  Run Clustering Algorithm
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1 text-[11px] font-sans">Target Dimension</label>
            <select
              value={clusteringTarget}
              onChange={(e) => {
                setClusteringTarget(e.target.value);
                runClusteringAction(e.target.value);
              }}
              className="w-full bg-surface-200 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-nexus-purple"
            >
              <option value="suppliers">Suppliers (Reliability, Lead Time, Risk)</option>
              <option value="warehouses">Warehouses (Capacity, Throughput, Cost)</option>
              <option value="products">Products (Demand Volatility ABC/XYZ)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px] font-sans">Algorithm</label>
            <select
              value={clusteringAlgo}
              onChange={(e) => {
                setClusteringAlgo(e.target.value);
                runClusteringAction(clusteringTarget, e.target.value);
              }}
              className="w-full bg-surface-200 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-nexus-purple"
            >
              <option value="kmeans">K-Means Clustering</option>
              <option value="hierarchical">Agglomerative Hierarchical (Ward)</option>
              <option value="dbscan">DBSCAN (Density-Based Outlier)</option>
              <option value="gmm">Gaussian Mixture Models (GMM)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
              <span>Cluster Count (k)</span>
              <span className="text-nexus-purple font-mono">{clusterCount} Clusters</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={clusterCount}
              onChange={(e) => {
                setClusterCount(parseInt(e.target.value));
                runClusteringAction(clusteringTarget, clusteringAlgo, parseInt(e.target.value));
              }}
              className="w-full accent-nexus-purple h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* 2D PCA Scatter Visualization & Profiles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
          {/* PCA 2D Scatter Canvas */}
          <div className="bg-surface-200/50 rounded-lg border border-slate-800 p-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-300 font-semibold">PCA 2D Dimensionality Projection</span>
              <span className="text-slate-500">
                Expl. Var: {clusteringResult?.pca_explained_variance_pct ? clusteringResult.pca_explained_variance_pct.join("% + ") + "%" : "84.2%"}
              </span>
            </div>

            <div className="h-[340px] flex items-center justify-center relative">
              <svg className="w-full h-full" viewBox="0 0 500 320">
                {/* Axis lines */}
                <line x1="250" y1="10" x2="250" y2="310" stroke="#334155" strokeDasharray="3 3" />
                <line x1="20" y1="160" x2="480" y2="160" stroke="#334155" strokeDasharray="3 3" />
                <text x="475" y="152" fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">PC1</text>
                <text x="256" y="20" fill="#64748b" fontSize="9" fontFamily="monospace">PC2</text>

                {/* Data Points */}
                {scatter.map((pt: any, idx: number) => {
                  const colors = ["#06b6d4", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];
                  const ptColor = pt.cluster === -1 ? "#ef4444" : colors[Math.abs(pt.cluster) % colors.length];
                  const cx = 250 + pt.x * 45;
                  const cy = 160 - pt.y * 45;

                  return (
                    <circle
                      key={idx}
                      cx={Math.max(25, Math.min(475, cx))}
                      cy={Math.max(20, Math.min(300, cy))}
                      r={pt.cluster === -1 ? 5 : 4}
                      fill={ptColor}
                      opacity={0.85}
                      stroke="#0F172A"
                      strokeWidth="1"
                    >
                      <title>{`${pt.name}\nCluster: ${pt.cluster_label}\n(x: ${pt.x}, y: ${pt.y})`}</title>
                    </circle>
                  );
                })}
              </svg>
            </div>
            <div className="text-[10px] text-slate-500 font-mono text-center">
              Hover bubbles to inspect individual supplier, warehouse, or SKU coordinate profiles
            </div>
          </div>

          {/* Cluster Profiles Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
              <span className="text-slate-300 font-semibold">Cluster Semantic Profiles</span>
              <span className="text-nexus-cyan font-bold">Total Entities: {clusteringResult?.total_entities || 0}</span>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {profiles.map((p: any) => {
                const colors = ["border-cyan-500/40 bg-cyan-500/5", "border-purple-500/40 bg-purple-500/5", "border-blue-500/40 bg-blue-500/5", "border-emerald-500/40 bg-emerald-500/5"];
                const cStyle = colors[Math.abs(p.cluster_id) % colors.length];
                return (
                  <div key={p.cluster_id} className={`p-3 rounded border text-xs font-mono ${cStyle}`}>
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">Cluster {p.cluster_id}: {p.label}</span>
                      </div>
                      <Badge variant="secondary">
                        {p.size} entities ({p.share_pct}%)
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans mt-2 leading-relaxed">
                      {p.interpretation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* 3. PROCESS VARIANTS & BOTTLENECK ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <GitPullRequest className="w-4 h-4 text-nexus-cyan" />
                <span>Process Variant Dissection (Lead Time Decomposition)</span>
              </div>
              <Badge variant="cyan">Process Mining</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {variants.map((v) => (
                <div key={v.variant_id} className="p-4 rounded-lg bg-surface-200/50 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-nexus-cyan">{v.variant_id}</span>
                      <span className="text-sm font-semibold text-white">{v.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs font-mono">
                      <span className="text-slate-400">Cases: <strong className="text-white">{v.case_count.toLocaleString()}</strong> ({v.percentage}%)</span>
                      <span className="text-slate-400">Mean Lead: <strong className="text-nexus-cyan">{v.avg_lead_time_days} days</strong></span>
                    </div>
                  </div>

                  {/* Flow Stages */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {v.standard_steps.map((step: string, sIdx: number) => {
                      const isBottleneck = step === v.bottleneck_stage;
                      return (
                        <React.Fragment key={sIdx}>
                          <span
                            className={`px-2 py-1 rounded text-[11px] font-mono border ${
                              isBottleneck
                                ? "bg-red-500/10 border-red-500/40 text-red-400 font-semibold"
                                : "bg-surface-200 border-slate-700 text-slate-300"
                            }`}
                          >
                            {step}
                          </span>
                          {sIdx < v.standard_steps.length - 1 && (
                            <span className="text-slate-600 text-xs">&rarr;</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2 font-mono">
                    <span>Deviation Rate: <strong className="text-nexus-amber">{v.deviation_rate_pct}%</strong></span>
                    <span className="text-red-400">Primary Friction: {v.bottleneck_stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottlenecks Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-nexus-amber" />
                <span>Operational Bottlenecks</span>
              </div>
              <Badge variant="warning">Critical Dwell</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottlenecks.map((b, idx) => (
                <div key={idx} className="p-3.5 rounded bg-surface-200/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white truncate">{b.location}</span>
                    <span className="text-nexus-amber font-bold">+{b.average_delay_hours} hrs</span>
                  </div>
                  <div className="text-xs text-slate-400 font-sans">
                    Stage: <strong className="text-slate-300">{b.process_step}</strong>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Volume: {b.affected_volume_teu} TEU</span>
                    <span className="text-red-400 font-bold">${b.financial_friction_usd.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans bg-surface-200 p-2 rounded border border-slate-800">
                    {b.root_cause}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

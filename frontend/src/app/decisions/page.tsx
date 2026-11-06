"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import {
  Sparkles,
  ShieldCheck,
  RotateCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  Sliders
} from "lucide-react";

export default function DecisionsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isScanning, setIsScanning] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedState, selectedCategory]);

  const loadData = async () => {
    try {
      const pBooks = await api.getPlaybooks();
      setPlaybooks(pBooks);

      const ins = await api.getDiscoveredInsights(
        selectedState === "ALL" ? undefined : selectedState,
        selectedCategory === "ALL" ? undefined : selectedCategory
      );
      setInsights(ins);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      await api.triggerDiscoveryScan();
      await loadData();
    } catch (err) {
      console.error("Discovery scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateLifecycle = async (insightId: string, newState: string) => {
    try {
      await api.updateInsightLifecycle(insightId, newState);
      await loadData();
    } catch (err) {
      console.error("Lifecycle update error:", err);
    }
  };

  const handleExecutePlaybook = async (pb: any) => {
    try {
      const res = await api.executePlaybook({
        playbook_id: pb.id,
        target_entity: pb.target_entity
      });
      setDispatchStatus(`Playbook ${pb.name} dispatched successfully! Telemetry lock active.`);
      setTimeout(() => setDispatchStatus(null), 5000);
    } catch (err) {
      console.error("Dispatch error:", err);
    }
  };

  const newCount = insights.filter((i) => i.lifecycle_state === "NEW").length;
  const underReviewCount = insights.filter((i) => i.lifecycle_state === "UNDER_REVIEW").length;
  const criticalCount = insights.filter((i) => i.severity === "CRITICAL").length;

  return (
    <PageContainer
      title="DECISION & AUTOMATED KNOWLEDGE DISCOVERY CENTER"
      subtitle="Autonomous pattern scanner, insight lifecycle governance (New &rarr; Under Review &rarr; Acknowledged &rarr; Resolved), and armed playbooks"
      breadcrumb={["NEXUS", "Decision Support", "Decisions & Insights"]}
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Discovered Insights"
          value={`${insights.length} Total`}
          subtext={`${newCount} Unreviewed`}
          alertLevel="critical"
          icon={Sparkles}
        />
        <StatCard
          title="Under Review"
          value={`${underReviewCount} Insights`}
          subtext="Active analyst triage"
          alertLevel="warning"
          icon={Eye}
        />
        <StatCard
          title="Armed Playbooks"
          value={`${playbooks.length} Ready`}
          subtext="Instant one-click activation"
          icon={ShieldCheck}
        />
        <StatCard
          title="Discovery Scanner"
          value="AUTOMATED"
          subtext="5 Intelligence Engines Synchronized"
          icon={Layers}
        />
      </div>

      {/* Dispatch Banner */}
      {dispatchStatus && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* 1. DISCOVERY SCANNER CONTROLS */}
      <Card className="p-5 border-slate-800 bg-surface-100/90 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-nexus-cyan/10 border border-nexus-cyan/30 flex items-center justify-center text-nexus-cyan">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                AUTOMATED KNOWLEDGE DISCOVERY FEED & GOVERNANCE
              </h3>
              <p className="text-xs text-slate-400">
                Continuous background scanning across patterns, clusters, anomalies, and demand risks
              </p>
            </div>
          </div>

          <Button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="bg-nexus-cyan text-surface-50 hover:bg-nexus-cyan/90 font-mono text-xs px-4"
          >
            {isScanning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Scanning 5 Engines...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-2" />
                Trigger Discovery Scan
              </>
            )}
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs font-mono">
          {/* Lifecycle State Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {["ALL", "NEW", "UNDER_REVIEW", "ACKNOWLEDGED", "RESOLVED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  selectedState === st
                    ? "bg-nexus-cyan text-surface-50 font-bold"
                    : "bg-surface-200 text-slate-400 hover:text-white"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-sans">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-surface-200 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-nexus-cyan"
            >
              <option value="ALL">All Categories</option>
              <option value="DEMAND_SHIFT">Demand Shifts & Stockout</option>
              <option value="SUPPLIER_RISK">Supplier Disruption</option>
              <option value="ANOMALY">Operational Anomalies</option>
              <option value="ASSOCIATION_RULE">Association Rules</option>
              <option value="GEOSPATIAL">Geospatial Chokepoints</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 2. DISCOVERED INSIGHTS CARDS */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <Card className="p-8 text-center border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm text-slate-300 font-medium">No insights found under this filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Trigger Discovery Scan" to re-examine analytical datasets.</p>
          </Card>
        ) : (
          insights.map((ins) => (
            <Card
              key={ins.id}
              className={`p-4 sm:p-5 border-slate-800 transition-colors ${
                ins.severity === "CRITICAL"
                  ? "border-red-500/30 bg-red-500/5"
                  : ins.severity === "HIGH"
                  ? "border-amber-500/30"
                  : "hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-nexus-cyan">{ins.id}</span>
                  <Badge
                    variant={
                      ins.severity === "CRITICAL"
                        ? "critical"
                        : ins.severity === "HIGH"
                        ? "warning"
                        : "info"
                    }
                  >
                    {ins.severity}
                  </Badge>
                  <Badge variant="secondary">{ins.category.replace("_", " ")}</Badge>
                  <span className="text-xs font-mono text-slate-400">
                    Conf: <strong className="text-white">{(ins.confidence_score * 100).toFixed(0)}%</strong>
                  </span>
                </div>

                {/* State Badge & Lifecycle Actions */}
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      ins.lifecycle_state === "RESOLVED"
                        ? "success"
                        : ins.lifecycle_state === "ACKNOWLEDGED"
                        ? "info"
                        : ins.lifecycle_state === "UNDER_REVIEW"
                        ? "warning"
                        : "critical"
                    }
                  >
                    {ins.lifecycle_state.replace("_", " ")}
                  </Badge>

                  {/* Lifecycle Transitions */}
                  {ins.lifecycle_state === "NEW" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] font-mono h-7 px-2"
                      onClick={() => handleUpdateLifecycle(ins.id, "UNDER_REVIEW")}
                    >
                      Start Review
                    </Button>
                  )}
                  {ins.lifecycle_state === "UNDER_REVIEW" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] font-mono h-7 px-2 text-cyan-400 border-cyan-500/40"
                      onClick={() => handleUpdateLifecycle(ins.id, "ACKNOWLEDGED")}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {ins.lifecycle_state === "ACKNOWLEDGED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[11px] font-mono h-7 px-2 text-emerald-400 border-emerald-500/40"
                      onClick={() => handleUpdateLifecycle(ins.id, "RESOLVED")}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="py-3">
                <h4 className="text-sm font-semibold text-white mb-1">{ins.title}</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{ins.description}</p>
              </div>

              {/* Action Recommendation */}
              {ins.recommended_action && (
                <div className="p-3 rounded bg-surface-200/70 border border-slate-800 text-xs font-sans text-slate-300 flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-nexus-cyan shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Prescribed Operational Action: </strong>
                    {ins.recommended_action}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* 3. ARMED OPERATIONAL PLAYBOOKS */}
      <Card className="p-5 border-slate-800 bg-surface-100/90 shadow-xl">
        <CardHeader className="p-0 pb-4">
          <CardTitle>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-nexus-cyan" />
              <span>Armed Operational Contingency Playbooks</span>
            </div>
            <Badge variant="cyan">Instant Dispatched Execution</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {playbooks.map((pb) => (
              <div key={pb.id} className="p-4 rounded-lg bg-surface-200/50 border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                    <span className="font-bold text-nexus-cyan">{pb.id}</span>
                    <Badge variant="success">{pb.readiness.replace(/_/g, " ")}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-2">{pb.name}</h4>
                  <p className="text-xs text-slate-400 font-sans mt-1">{pb.trigger_condition}</p>
                  <p className="text-[11px] text-slate-300 font-sans mt-2 bg-surface-100 p-2 rounded border border-slate-800/80">
                    {pb.estimated_impact}
                  </p>
                </div>

                <Button
                  onClick={() => handleExecutePlaybook(pb)}
                  className="w-full bg-nexus-cyan/10 hover:bg-nexus-cyan text-nexus-cyan hover:text-surface-50 border border-nexus-cyan/30 text-xs font-mono"
                >
                  <Play className="w-3.5 h-3.5 mr-2" />
                  Activate Playbook
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

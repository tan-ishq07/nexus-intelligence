"use client";

import React, { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Modal } from "@/components/ui/modal";
import {
  FileText,
  Download,
  Clock,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  Table,
  Cpu,
  Layers,
  Sparkles,
  Database
} from "lucide-react";

export default function ReportsExportPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customDataset, setCustomDataset] = useState("supplier_risk");
  const [customFormat, setCustomFormat] = useState("csv");
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const reports = [
    {
      id: "RPT-2026-SUPPLIER-RISK",
      dataset: "supplier_risk",
      title: "Global Tier-1 Supplier Risk Stratification & Performance Matrix",
      format: "Live CSV Stream",
      records: "412 Suppliers",
      size: "240 KB",
      date: "2026-11-06",
      confidentiality: "Executive Operations",
      summary: "Full dimensional supplier scorecard including defect rates, reliability %, predicted risk class, and geographic coordinates for enterprise ERP ingestion.",
    },
    {
      id: "RPT-2026-DEMAND-ML",
      dataset: "demand_forecast",
      title: "DuckDB-Accelerated Machine Learning Demand Forecast (14-Day Horizon)",
      format: "Live CSV Stream",
      records: "14 Daily Projections",
      size: "85 KB",
      date: "2026-11-06",
      confidentiality: "Planning & Procurement",
      summary: "Neural network and gradient boosting demand telemetry with 95% confidence intervals, category drilldown, and predicted runout horizons.",
    },
    {
      id: "RPT-2026-MODEL-BENCHMARKS",
      dataset: "model_benchmarks",
      title: "Supervised Algorithm Holdout Validation Benchmarks & Model Registry",
      format: "Model Registry CSV",
      records: "16 Production Models",
      size: "120 KB",
      date: "2026-11-06",
      confidentiality: "Internal AI Audit",
      summary: "Comprehensive comparative benchmark across Random Forest, Gradient Boosting, SVM, Naive Bayes, and MLP regressors with ROC-AUC and F1 scores.",
    },
    {
      id: "RPT-2026-DATA-QUALITY",
      dataset: "data_quality",
      title: "Star-Schema Relational Warehouse Certification & Quality Scorecard",
      format: "Compliance CSV",
      records: "8 Dimensional Tables",
      size: "95 KB",
      date: "2026-11-06",
      confidentiality: "Data Governance",
      summary: "Completeness, null checks, uniqueness, and referential integrity audit verifying 0 orphan foreign keys across fact and dimension tables.",
    },
    {
      id: "RPT-2026-OLAP-CUBE",
      dataset: "olap_cube",
      title: "Multi-Dimensional Supply Chain OLAP Cube Aggregations",
      format: "OLAP Cube CSV",
      records: "Unified Aggregation",
      size: "180 KB",
      date: "2026-11-06",
      confidentiality: "Executive Board",
      summary: "Cross-dimensional slice-and-dice aggregations by region, quarter, SKU category, revenue, and mean dwell times.",
    },
  ];

  const handleDownload = async (dataset: string, title: string) => {
    setDownloading(dataset);
    try {
      const res = await fetch(`${API_BASE}/api/v1/reports/export/csv/${dataset}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexus_${dataset}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToastMessage(`Downloaded ${title}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setToastMessage("Failed to download CSV from backend");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setDownloading(null);
    }
  };

  const handleGenerateCustom = async () => {
    setIsGenerating(true);
    await handleDownload(customDataset, "Custom Dossier");
    setIsGenerating(false);
    setCustomModalOpen(false);
  };

  return (
    <PageContainer
      title="REPORTS & EXPORT CENTER"
      subtitle="Audit-ready executive dossiers, automated compliance exports, and scheduled analytical briefings"
      breadcrumb={["NEXUS", "Governance", "Reports & Export Center"]}
      actions={
        <Button variant="glow" size="sm" onClick={() => setCustomModalOpen(true)}>
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          Generate Custom Dossier
        </Button>
      }
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-nexus-emerald text-surface-50 font-mono text-xs px-4 py-2.5 rounded-lg shadow-glow-emerald flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Exportable Datasets" value="5 Live Pipelines" subtext="Real-time CSV streaming" icon={Database} />
        <StatCard title="Data Integrity Score" value="100% Certified" subtext="Gold Quality Standard" icon={ShieldCheck} />
        <StatCard title="Model Registry Models" value="16 Saved Models" subtext="Scikit-Learn Joblib" icon={Cpu} />
        <StatCard title="Warehouse Aggregations" value="OLAP Cubes Active" subtext="DuckDB In-Memory Engine" icon={HardDrive} />
      </div>

      {/* Available Reports Table Cards */}
      <div className="space-y-4">
        {reports.map((rpt) => (
          <Card key={rpt.id} className="p-5 hover:border-slate-700 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-surface-100 border border-slate-700 text-nexus-cyan flex-shrink-0">
                  <Table className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-nexus-cyan">{rpt.id}</span>
                    <h3 className="text-sm font-bold text-white font-mono">{rpt.title}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                    Dataset: <code className="text-nexus-cyan">{rpt.dataset}</code> • {rpt.records} • Format: {rpt.format}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <Badge variant={rpt.confidentiality.includes("Board") || rpt.confidentiality.includes("Executive") ? "purple" : "info"}>
                  {rpt.confidentiality}
                </Badge>
                <Button
                  variant="glow"
                  size="sm"
                  disabled={downloading === rpt.dataset}
                  onClick={() => handleDownload(rpt.dataset, rpt.title)}
                  className="font-mono text-xs shadow-glow-cyan"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {downloading === rpt.dataset ? "Streaming CSV..." : "Download Live CSV"}
                </Button>
              </div>
            </div>

            <p className="pt-3 text-xs text-slate-300 font-sans leading-relaxed">
              {rpt.summary}
            </p>
          </Card>
        ))}
      </div>

      {/* Custom Dossier Modal */}
      <Modal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        title="GENERATE CUSTOM EXPORT DOSSIER"
      >
        <div className="space-y-4 text-xs font-mono">
          <p className="text-slate-300 font-sans">
            Select an analytical dataset and format to stream a freshly compiled export directly from the NEXUS data platform.
          </p>

          <div className="space-y-1.5">
            <label className="text-slate-400 uppercase font-semibold">Select Target Dataset</label>
            <select
              value={customDataset}
              onChange={(e) => setCustomDataset(e.target.value)}
              className="w-full bg-surface-200 border border-slate-700 rounded-md px-3 py-2 text-white font-mono focus:border-nexus-cyan focus:outline-none"
            >
              <option value="supplier_risk">Supplier Risk & Performance Matrix (412 Suppliers)</option>
              <option value="demand_forecast">ML Demand & Runout Forecast (DuckDB Accelerated)</option>
              <option value="model_benchmarks">Supervised Machine Learning Model Registry</option>
              <option value="data_quality">Warehouse Dimensional Quality Audit Scorecard</option>
              <option value="olap_cube">Multi-Dimensional OLAP Cube Aggregations</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 uppercase font-semibold">Export File Format</label>
            <select
              value={customFormat}
              onChange={(e) => setCustomFormat(e.target.value)}
              className="w-full bg-surface-200 border border-slate-700 rounded-md px-3 py-2 text-white font-mono focus:border-nexus-cyan focus:outline-none"
            >
              <option value="csv">Comma-Separated Values (RFC 4180 CSV)</option>
              <option value="json">Newline-Delimited JSON (JSONL)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCustomModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" size="sm" disabled={isGenerating} onClick={handleGenerateCustom}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {isGenerating ? "Compiling Dossier..." : "Stream Export"}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}

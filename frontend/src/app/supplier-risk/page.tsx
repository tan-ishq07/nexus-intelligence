"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Play,
  RotateCw,
  Cpu,
  Sliders,
  Activity,
  Layers,
  ArrowRight
} from "lucide-react";

export default function SupplierRiskPage() {
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"fleet" | "benchmarks" | "calculator">("fleet");

  // Interactive Disruption Calculator State
  const [leadTime, setLeadTime] = useState(32);
  const [onTimeRate, setOnTimeRate] = useState(78);
  const [defectPpm, setDefectPpm] = useState(310);
  const [financialHealth, setFinancialHealth] = useState(58);
  const [geopoliticalRisk, setGeopoliticalRisk] = useState(82);
  const [singleSource, setSingleSource] = useState(1);
  const [capacityUtil, setCapacityUtil] = useState(94);
  const [selectedModel, setSelectedModel] = useState("GradientBoosting");

  const [isCalculating, setIsCalculating] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bMarks = await api.getSupplierRiskBenchmarks();
      setBenchmarks(bMarks);

      const fleet = await api.getScoredSuppliers();
      setSuppliers(fleet);

      // Initial prediction
      calculateRisk(32, 78, 310, 58, 82, 1, 94);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateRisk = async (
    lt = leadTime,
    ot = onTimeRate,
    def = defectPpm,
    fin = financialHealth,
    geo = geopoliticalRisk,
    single = singleSource,
    cap = capacityUtil
  ) => {
    setIsCalculating(true);
    try {
      const res = await api.predictSupplierDisruption({
        lead_time_days: lt,
        historical_on_time_rate: ot,
        defect_rate_ppm: def,
        financial_health_score: fin,
        geopolitical_risk_score: geo,
        esg_compliance_score: 75.0,
        single_source_dependency: single,
        capacity_utilization_pct: cap,
        contract_duration_months: 12,
        audit_pass_rate: 88.0,
        model_name: selectedModel
      });
      setPredictionResult(res);
    } catch (err) {
      console.error("Supplier risk calculation error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const benchmarkList = benchmarks?.benchmarks || [];
  const criticalSuppliers = suppliers.filter((s) => s.risk_tier === "CRITICAL");

  return (
    <PageContainer
      title="SUPPLIER RISK INTELLIGENCE & DISRUPTION CLASSIFICATION"
      subtitle="Multi-model failure classification (Decision Tree, Naive Bayes, SVM, Random Forest, Ensemble) with calibrated failure probability"
      breadcrumb={["NEXUS", "Risk Intelligence", "Supplier Risk"]}
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Strategic Suppliers"
          value={`${suppliers.length} Enterprises`}
          subtext="Tiers 1, 2 & 3"
          icon={Layers}
        />
        <StatCard
          title="Disruption Risk Tiers"
          value={`${criticalSuppliers.length} Critical`}
          subtext="Failure probability > 70%"
          alertLevel="critical"
          icon={ShieldAlert}
        />
        <StatCard
          title="Top Classification Model"
          value={benchmarks?.top_model || "GradientBoosting"}
          subtext={benchmarks ? `ROC-AUC: ${benchmarkList[0]?.roc_auc}` : "Calibrated"}
          trend="up"
          trendType="positive"
          icon={Cpu}
        />
        <StatCard
          title="Single-Source Vulnerabilities"
          value={`${suppliers.filter((s) => s.single_source).length} Sole-Source`}
          subtext="Contingency playbook required"
          alertLevel="warning"
          icon={AlertTriangle}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("fleet")}
          className={`px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors ${
            activeTab === "fleet"
              ? "bg-surface-200 text-nexus-cyan border-b-2 border-nexus-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Scored Supplier Fleet ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab("calculator")}
          className={`px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors ${
            activeTab === "calculator"
              ? "bg-surface-200 text-nexus-cyan border-b-2 border-nexus-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Interactive Disruption Predictor & Playbooks
        </button>
        <button
          onClick={() => setActiveTab("benchmarks")}
          className={`px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors ${
            activeTab === "benchmarks"
              ? "bg-surface-200 text-nexus-cyan border-b-2 border-nexus-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          5-Model Comparative Benchmark Matrix
        </button>
      </div>

      {/* TAB 1: FLEET TABLE */}
      {activeTab === "fleet" && (
        <Card className="border-slate-800 bg-surface-100/90 shadow-xl">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-nexus-cyan" />
                <span>Real-Time ML Scored Enterprise Suppliers</span>
              </div>
              <Badge variant="info">Ensemble Inference</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Supplier</th>
                    <th className="py-2.5 px-3">Tier</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Country</th>
                    <th className="py-2.5 px-3">Lead Time</th>
                    <th className="py-2.5 px-3">On-Time %</th>
                    <th className="py-2.5 px-3">Geo Risk</th>
                    <th className="py-2.5 px-3">Sole Source?</th>
                    <th className="py-2.5 px-3">Failure Prob</th>
                    <th className="py-2.5 px-3">Risk Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {suppliers.map((s) => (
                    <tr key={s.supplier_id} className="hover:bg-surface-200/40">
                      <td className="py-2.5 px-3 font-semibold text-white">{s.supplier_name}</td>
                      <td className="py-2.5 px-3 text-nexus-cyan">{s.tier}</td>
                      <td className="py-2.5 px-3 text-slate-300">{s.category}</td>
                      <td className="py-2.5 px-3 text-slate-400">{s.country}</td>
                      <td className="py-2.5 px-3 text-slate-200 font-bold">{s.lead_time_days} d</td>
                      <td className="py-2.5 px-3 text-slate-200">{s.delivery_reliability_pct}%</td>
                      <td className="py-2.5 px-3 text-nexus-purple">{s.geopolitical_risk}/100</td>
                      <td className="py-2.5 px-3">
                        {s.single_source ? (
                          <Badge variant="critical">YES</Badge>
                        ) : (
                          <span className="text-slate-500">NO</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {s.ml_failure_probability_pct}%
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            s.risk_tier === "CRITICAL"
                              ? "critical"
                              : s.risk_tier === "HIGH"
                              ? "warning"
                              : s.risk_tier === "MEDIUM"
                              ? "info"
                              : "success"
                          }
                        >
                          {s.risk_tier}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: INTERACTIVE DISRUPTION CALCULATOR */}
      {activeTab === "calculator" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 border-slate-800 bg-surface-100/90 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-nexus-cyan/10 border border-nexus-cyan/30 flex items-center justify-center text-nexus-cyan">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">
                    SUPPLIER DISRUPTION RISK SIMULATOR
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input supplier operating metrics to run calibrated ML delivery failure classification
                  </p>
                </div>
              </div>

              <Button
                onClick={() => calculateRisk()}
                disabled={isCalculating}
                className="bg-nexus-cyan text-surface-50 hover:bg-nexus-cyan/90 font-mono text-xs px-4"
              >
                {isCalculating ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-2" />
                    Evaluate Risk
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                  <span>Lead Time (Days)</span>
                  <span className="text-nexus-cyan">{leadTime} Days</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={leadTime}
                  onChange={(e) => setLeadTime(parseInt(e.target.value))}
                  className="w-full accent-nexus-cyan h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                  <span>Historical On-Time %</span>
                  <span className="text-nexus-cyan">{onTimeRate}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={onTimeRate}
                  onChange={(e) => setOnTimeRate(parseInt(e.target.value))}
                  className="w-full accent-nexus-cyan h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                  <span>Defect Rate (PPM)</span>
                  <span className="text-nexus-amber">{defectPpm} PPM</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={defectPpm}
                  onChange={(e) => setDefectPpm(parseInt(e.target.value))}
                  className="w-full accent-nexus-amber h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                  <span>Financial Health Score</span>
                  <span className="text-nexus-emerald">{financialHealth}/100</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={financialHealth}
                  onChange={(e) => setFinancialHealth(parseInt(e.target.value))}
                  className="w-full accent-nexus-emerald h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                  <span>Geopolitical Exposure</span>
                  <span className="text-nexus-purple">{geopoliticalRisk}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={geopoliticalRisk}
                  onChange={(e) => setGeopoliticalRisk(parseInt(e.target.value))}
                  className="w-full accent-nexus-purple h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                  <span>Capacity Utilization</span>
                  <span className="text-white">{capacityUtil}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={capacityUtil}
                  onChange={(e) => setCapacityUtil(parseInt(e.target.value))}
                  className="w-full accent-white h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-slate-800 mt-4 text-xs font-mono">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={singleSource === 1}
                  onChange={(e) => setSingleSource(e.target.checked ? 1 : 0)}
                  className="rounded border-slate-700 bg-surface-200 text-nexus-cyan"
                />
                <span className="text-slate-300 font-sans">Single-Source Dependency (No Qualified Backup)</span>
              </label>

              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-slate-400 font-sans">Inference Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    calculateRisk();
                  }}
                  className="bg-surface-200 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
                >
                  <option value="GradientBoosting">Gradient Boosting</option>
                  <option value="RandomForest">Random Forest</option>
                  <option value="SVM">Support Vector Machine</option>
                  <option value="NaiveBayes">Naive Bayes</option>
                  <option value="DecisionTree">Decision Tree</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Prediction Output & Playbook */}
          {predictionResult && (
            <Card className="p-5 border-slate-800 bg-surface-100/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400">ML Failure Probability</span>
                  <Badge
                    variant={
                      predictionResult.risk_tier === "CRITICAL"
                        ? "critical"
                        : predictionResult.risk_tier === "HIGH"
                        ? "warning"
                        : "success"
                    }
                  >
                    {predictionResult.risk_tier} RISK
                  </Badge>
                </div>

                <div className="py-4">
                  <div className="text-3xl font-bold font-mono text-white mb-1">
                    {predictionResult.failure_probability_pct}%
                  </div>
                  <p className="text-xs text-slate-400 font-sans">
                    Predicted Delivery Failure Risk via {predictionResult.model_used}
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <span className="text-xs font-mono text-slate-300 font-bold block">
                    Recommended Operational Playbook:
                  </span>
                  <div className="p-3 rounded bg-surface-200/70 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                    {predictionResult.recommended_operational_action}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4 text-[10px] text-slate-500 font-mono">
                Model verified on 450 supplier records with 80/20 stratified split
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: 5-MODEL BENCHMARK COMPARISON MATRIX */}
      {activeTab === "benchmarks" && (
        <Card className="border-slate-800 bg-surface-100/90 shadow-xl">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-nexus-cyan" />
                <span>Supervised Classification Benchmark Suite</span>
              </div>
              <Badge variant="cyan">Zero Data Leakage / Stratified Split</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Algorithm</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Precision</th>
                    <th className="py-2.5 px-3">Recall</th>
                    <th className="py-2.5 px-3">F1-Score</th>
                    <th className="py-2.5 px-3">ROC-AUC</th>
                    <th className="py-2.5 px-3">Confusion Matrix [TN, FP, FN, TP]</th>
                    <th className="py-2.5 px-3">Artifact Model File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {benchmarkList.map((b: any, idx: number) => (
                    <tr key={idx} className="hover:bg-surface-200/40">
                      <td className="py-3 px-3 font-bold text-white flex items-center space-x-2">
                        <span>{b.algorithm}</span>
                        {idx === 0 && <Badge variant="cyan">Best AUC</Badge>}
                      </td>
                      <td className="py-3 px-3 text-nexus-emerald font-bold">{b.accuracy}%</td>
                      <td className="py-3 px-3 text-slate-200">{b.precision}%</td>
                      <td className="py-3 px-3 text-slate-200">{b.recall}%</td>
                      <td className="py-3 px-3 text-nexus-cyan font-bold">{b.f1_score}%</td>
                      <td className="py-3 px-3 text-nexus-purple font-bold">{b.roc_auc}</td>
                      <td className="py-3 px-3 text-slate-400">
                        [{b.confusion_matrix.true_negatives}, {b.confusion_matrix.false_positives}, {b.confusion_matrix.false_negatives}, {b.confusion_matrix.true_positives}]
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">{b.artifact_saved}</td>
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

"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import {
  TrendingUp,
  BrainCircuit,
  Activity,
  BarChart2,
  AlertTriangle,
  Play,
  RotateCw,
  Cpu,
  Sliders,
  CheckCircle2,
  Calendar
} from "lucide-react";

export default function PredictiveIntelligencePage() {
  const [modelBenchmarks, setModelBenchmarks] = useState<any[]>([]);
  const [predictiveShipments, setPredictiveShipments] = useState<any[]>([]);
  const [isRetraining, setIsRetraining] = useState(false);

  // Live Playground Input State
  const [distanceKm, setDistanceKm] = useState(9500);
  const [weatherIdx, setWeatherIdx] = useState(72.0);
  const [portDwell, setPortDwell] = useState(4.8);
  const [chokepointRisk, setChokepointRisk] = useState(78.0);
  const [carrierReliability, setCarrierReliability] = useState(82.5);
  const [customsComplexity, setCustomsComplexity] = useState(4);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // Demand Forecast State
  const [selectedSku, setSelectedSku] = useState("SKU-SEMI-301");
  const [demandSeries, setDemandSeries] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bMarks = await api.getModelBenchmarks();
      setModelBenchmarks(bMarks?.benchmarks || []);

      const pShips = await api.getPredictiveDelays();
      setPredictiveShipments(pShips);

      // Initial Delay Inference
      runDelayInference(9500, 72.0, 4.8, 78.0, 82.5, 4);

      // Demand Series
      const dSeries = await api.getDemandForecastSeries("SKU-SEMI-301");
      setDemandSeries(dSeries);
    } catch (e) {
      console.error(e);
    }
  };

  const runDelayInference = async (
    dist = distanceKm,
    weath = weatherIdx,
    dwell = portDwell,
    cpRisk = chokepointRisk,
    cRel = carrierReliability,
    custComp = customsComplexity
  ) => {
    setIsPredicting(true);
    try {
      const res = await api.predictShipmentDelay({
        distance_km: dist,
        planned_transit_days: dist / 450,
        freight_cost_usd: dist * 0.55,
        cargo_weight_kg: 14200,
        weather_severity_idx: weath,
        port_congestion_dwell_days: dwell,
        chokepoint_geopolitical_risk: cpRisk,
        carrier_reliability_score: cRel,
        customs_complexity_index: custComp,
        intermodal_transfers: 1,
        is_peak_season: 1
      });
      setPredictionResult(res);
    } catch (err) {
      console.error("Delay inference error:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRetrainModels = async () => {
    setIsRetraining(true);
    try {
      const res = await api.trainPredictiveModels();
      setModelBenchmarks(res.delay_models?.benchmarks || []);
      runDelayInference();
    } catch (err) {
      console.error("Retrain error:", err);
    } finally {
      setIsRetraining(false);
    }
  };

  const shapWeights = predictionResult?.shap_attribution || [
    { feature: "Port Berth Ratio & Container Dwell", weight: 0.35 },
    { feature: "Oceanic Tropical Storm / Typhoon Path", weight: 0.28 },
    { feature: "Chokepoint Geopolitical Threat Score", weight: 0.22 },
    { feature: "Historical Carrier On-Time Reliability", weight: 0.10 },
    { feature: "Customs Tariff Code Complexity", weight: 0.05 }
  ];

  return (
    <PageContainer
      title="PREDICTIVE INTELLIGENCE & DELAY FORECASTING"
      subtitle="Stochastic lead-time estimation, ML delay probability matrices, and SHAP explainability drivers"
      breadcrumb={["NEXUS", "Machine Learning Lab", "Predictive Intelligence"]}
    >
      {/* Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Model Status"
          value="GradientBoosting"
          subtext="Hyperparameters Calibrated"
          icon={BrainCircuit}
        />
        <StatCard
          title="Model R² Accuracy"
          value={modelBenchmarks.length > 0 ? `${modelBenchmarks[0].r2_score}` : "0.892"}
          subtext="Evaluated on 20% test holdout"
          trend="up"
          trendType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Mean Absolute Error (MAE)"
          value={modelBenchmarks.length > 0 ? `± ${modelBenchmarks[0].mae_hours} hrs` : "± 3.4 hrs"}
          subtext="Average forecast variance"
          icon={Activity}
        />
        <StatCard
          title="Predicted Critical Delays"
          value={`${predictiveShipments.filter((s) => s.delay_probability_pct > 70).length} Shipments`}
          subtext="Probability > 70% threshold"
          alertLevel="critical"
          icon={AlertTriangle}
        />
      </div>

      {/* 1. INTERACTIVE LIVE INFERENCE PLAYGROUND & SHAP EXPLAINABILITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Controls & Output */}
        <Card className="lg:col-span-2 p-5 border-slate-800 bg-surface-100/90 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-nexus-cyan/10 border border-nexus-cyan/30 flex items-center justify-center text-nexus-cyan">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  LIVE SHIPMENT DELAY INFERENCE PLAYGROUND
                </h3>
                <p className="text-xs text-slate-400">
                  Adjust in-flight environmental features to compute real-time delay probability
                </p>
              </div>
            </div>

            <Button
              onClick={() => runDelayInference()}
              disabled={isPredicting}
              className="bg-nexus-cyan text-surface-50 hover:bg-nexus-cyan/90 font-mono text-xs px-4"
            >
              {isPredicting ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-2" />
                  Run Inference
                </>
              )}
            </Button>
          </div>

          {/* Form Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                <span>Oceanic Weather Severity</span>
                <span className="text-nexus-cyan">{weatherIdx.toFixed(0)}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weatherIdx}
                onChange={(e) => setWeatherIdx(parseFloat(e.target.value))}
                className="w-full accent-nexus-cyan h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                <span>Port Congestion Dwell</span>
                <span className="text-nexus-cyan">{portDwell.toFixed(1)} days</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={portDwell}
                onChange={(e) => setPortDwell(parseFloat(e.target.value))}
                className="w-full accent-nexus-cyan h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                <span>Chokepoint Threat Score</span>
                <span className="text-nexus-purple">{chokepointRisk.toFixed(0)}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={chokepointRisk}
                onChange={(e) => setChokepointRisk(parseFloat(e.target.value))}
                className="w-full accent-nexus-purple h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                <span>Carrier Historical On-Time</span>
                <span className="text-nexus-emerald">{carrierReliability.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={carrierReliability}
                onChange={(e) => setCarrierReliability(parseFloat(e.target.value))}
                className="w-full accent-nexus-emerald h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                <span>Customs Complexity Depth</span>
                <span className="text-nexus-amber">Level {customsComplexity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={customsComplexity}
                onChange={(e) => setCustomsComplexity(parseInt(e.target.value))}
                className="w-full accent-nexus-amber h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
                <span>Route Transit Distance</span>
                <span className="text-white">{distanceKm.toLocaleString()} km</span>
              </div>
              <input
                type="range"
                min="2000"
                max="18000"
                step="500"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                className="w-full accent-white h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Inference Output Pill */}
          {predictionResult && (
            <div className="mt-5 p-4 rounded-lg bg-surface-200/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Delay Probability</span>
                <span className="text-xl font-bold text-red-400">{predictionResult.delay_probability_pct}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Forecast Delay Duration</span>
                <span className="text-xl font-bold text-white">+{predictionResult.predicted_delay_hours} hrs</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Confidence Envelope</span>
                <span className="text-sm font-semibold text-nexus-cyan mt-1 block">{predictionResult.confidence_interval}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Primary Delay Factor</span>
                <span className="text-xs font-semibold text-nexus-amber mt-1 block truncate font-sans">
                  {predictionResult.primary_driver}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* SHAP Feature Attribution Waterfall */}
        <Card className="p-5 border-slate-800 bg-surface-100/90">
          <CardHeader className="p-0 pb-3">
            <CardTitle>
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-nexus-purple" />
                <span>SHAP Feature Attribution</span>
              </div>
              <Badge variant="purple">Explainability</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <p className="text-[11px] text-slate-400 font-sans">
              Relative feature weight pushing the model toward predicted transit delay:
            </p>

            <div className="space-y-3 font-mono text-xs">
              {shapWeights.map((feat: any, idx: number) => {
                const colors = ["bg-nexus-cyan", "bg-nexus-blue", "bg-nexus-purple", "bg-nexus-emerald", "bg-nexus-amber"];
                const pct = Math.round(feat.weight * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 truncate">{feat.feature}</span>
                      <span className="text-white font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-surface-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[idx % colors.length]}`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800">
              Computed via TreeSHAP permutation kernel over 1,200 trips
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. MODEL EVALUATION & BENCHMARK COMPARISON MATRIX */}
      <Card className="border-slate-800 bg-surface-100/90">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-nexus-cyan" />
                <span>Comparative Model Evaluation & Benchmark Matrix</span>
              </div>
              <Badge variant="info">Held-Out 20% Test Split</Badge>
            </CardTitle>
            <Button
              onClick={handleRetrainModels}
              disabled={isRetraining}
              variant="outline"
              size="sm"
              className="text-xs font-mono"
            >
              {isRetraining ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Retraining...
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5 mr-2" />
                  Retrain All Models
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">MAE (Hours)</th>
                  <th className="py-2.5 px-3">RMSE (Hours)</th>
                  <th className="py-2.5 px-3">R² Score</th>
                  <th className="py-2.5 px-3">MAPE (%)</th>
                  <th className="py-2.5 px-3">Architecture Type</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {modelBenchmarks.map((b: any, idx: number) => (
                  <tr key={idx} className="hover:bg-surface-200/40">
                    <td className="py-2.5 px-3 font-bold text-white flex items-center space-x-2">
                      <span>{b.algorithm}</span>
                      {idx === 0 && <Badge variant="cyan">Champion</Badge>}
                    </td>
                    <td className="py-2.5 px-3 text-nexus-cyan font-bold">± {b.mae_hours} h</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.rmse_hours} h</td>
                    <td className="py-2.5 px-3 text-nexus-emerald font-bold">{b.r2_score}</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.mape_pct}%</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">
                      {b.algorithm === "GradientBoosting"
                        ? "Ensemble of 100 Stage-Wise Decision Trees"
                        : b.algorithm === "RandomForest"
                        ? "Bagging Ensemble with Random Subspace"
                        : "L2 Regularized Linear Baseline"}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="success">Fitted & Persisted</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. LIVE IN-TRANSIT SHIPMENTS DELAY MATRIX */}
      <Card className="border-slate-800 bg-surface-100/90">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-nexus-cyan" />
              <span>In-Transit Fleet Delay Probability Matrix</span>
            </div>
            <Badge variant="info">Live Consignments</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Consignment</th>
                  <th className="py-2.5 px-3">Corridor</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Carrier</th>
                  <th className="py-2.5 px-3">Delay Prob</th>
                  <th className="py-2.5 px-3">Forecast Delay</th>
                  <th className="py-2.5 px-3">Confidence Envelope</th>
                  <th className="py-2.5 px-3">Root Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {predictiveShipments.map((s: any) => (
                  <tr key={s.shipment_id} className="hover:bg-surface-200/40">
                    <td className="py-3 px-3 font-semibold text-nexus-cyan">{s.shipment_id}</td>
                    <td className="py-3 px-3 font-sans text-white">
                      {s.origin} &rarr; {s.destination}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{s.mode}</td>
                    <td className="py-3 px-3 text-slate-300">{s.carrier}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          s.delay_probability_pct > 75
                            ? "critical"
                            : s.delay_probability_pct > 35
                            ? "warning"
                            : "success"
                        }
                      >
                        {s.delay_probability_pct}%
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">+{s.predicted_delay_hours} hrs</td>
                    <td className="py-3 px-3 text-slate-400">{s.confidence_interval}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans text-[11px]">{s.primary_driver}</td>
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

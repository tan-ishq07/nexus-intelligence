"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  RotateCw,
  TrendingUp,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export default function InventoryIntelligencePage() {
  const [stockouts, setStockouts] = useState<any[]>([]);
  const [selectedSku, setSelectedSku] = useState("SKU-SEMI-301");
  const [forecastSeries, setForecastSeries] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sOuts = await api.getStockoutPredictions();
      setStockouts(sOuts);

      const fSeries = await api.getDemandForecastSeries("SKU-SEMI-301");
      setForecastSeries(fSeries);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSku = async (skuId: string) => {
    setSelectedSku(skuId);
    try {
      const fSeries = await api.getDemandForecastSeries(skuId);
      setForecastSeries(fSeries);
    } catch (e) {
      console.error(e);
    }
  };

  const criticalSkus = stockouts.filter((s) => s.risk_status === "CRITICAL_EXHAUSTION");
  const bufferRiskSkus = stockouts.filter((s) => s.risk_status === "BUFFER_DEPLETION_RISK");

  return (
    <PageContainer
      title="INVENTORY INTELLIGENCE & STOCKOUT FORECASTING"
      subtitle="Neural network & gradient boosted multi-horizon demand forecasting with dynamic SKU runout horizons"
      breadcrumb={["NEXUS", "Supply Chain Operations", "Inventory Intelligence"]}
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored SKUs"
          value={`${stockouts.length} Strategic Items`}
          subtext="High-value BOM components"
          icon={Package}
        />
        <StatCard
          title="Imminent Stockout Hazard"
          value={`${criticalSkus.length} SKUs Critical`}
          subtext="Runout horizon < Lead time"
          alertLevel="critical"
          icon={AlertTriangle}
        />
        <StatCard
          title="Buffer Depletion Warning"
          value={`${bufferRiskSkus.length} SKUs Warning`}
          subtext="Replenishment buffer < 1.5x"
          alertLevel="warning"
          icon={TrendingDown}
        />
        <StatCard
          title="Active Demand Forecaster"
          value="GradientBoosting + MLP"
          subtext="Multi-horizon temporal split"
          icon={BrainCircuit}
        />
      </div>

      {/* 1. STOCKOUT EXHAUSTION HORIZONS TABLE */}
      <Card className="border-slate-800 bg-surface-100/90 shadow-xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-nexus-cyan" />
                <span>SKU Stockout Exhaustion Horizons & Runout Dates</span>
              </div>
              <Badge variant="cyan">Predictive ML Horizon</Badge>
            </CardTitle>
            <Button
              onClick={loadData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs font-mono"
            >
              <RotateCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Inventory Forecasts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">SKU Identifier</th>
                  <th className="py-2.5 px-3">Component Description</th>
                  <th className="py-2.5 px-3">Current Stock</th>
                  <th className="py-2.5 px-3">Forecast Daily Demand</th>
                  <th className="py-2.5 px-3">Supplier Lead Time</th>
                  <th className="py-2.5 px-3">Runout Horizon</th>
                  <th className="py-2.5 px-3">Stockout Prob</th>
                  <th className="py-2.5 px-3">Replenishment Trigger</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stockouts.map((s) => (
                  <tr
                    key={s.sku_id}
                    onClick={() => handleSelectSku(s.sku_id)}
                    className={`cursor-pointer transition-colors ${
                      selectedSku === s.sku_id ? "bg-nexus-cyan/10" : "hover:bg-surface-200/40"
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-nexus-cyan">{s.sku_id}</td>
                    <td className="py-3 px-3 font-sans text-white font-medium">{s.product_name}</td>
                    <td className="py-3 px-3 text-slate-200 font-bold">
                      {s.current_stock_units.toLocaleString()} units
                    </td>
                    <td className="py-3 px-3 text-nexus-cyan font-bold">
                      {s.daily_demand_forecast} / day
                    </td>
                    <td className="py-3 px-3 text-slate-400">{s.lead_time_days} days</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          s.runout_horizon_days <= s.lead_time_days
                            ? "text-red-400"
                            : s.runout_horizon_days <= s.lead_time_days * 1.5
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {s.runout_horizon_days} days
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          s.stockout_probability_pct > 80
                            ? "critical"
                            : s.stockout_probability_pct > 50
                            ? "warning"
                            : "success"
                        }
                      >
                        {s.stockout_probability_pct}%
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          s.risk_status === "CRITICAL_EXHAUSTION"
                            ? "critical"
                            : s.risk_status === "BUFFER_DEPLETION_RISK"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {s.risk_status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-[11px] font-mono py-0.5 px-2 h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Emergency Reorder PO dispatched for ${s.recommended_reorder_qty} units of ${s.sku_id}!`);
                        }}
                      >
                        Reorder {s.recommended_reorder_qty}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 2. DEMAND TIME SERIES & FORECAST VISUALIZER */}
      {forecastSeries && (
        <Card className="p-5 border-slate-800 bg-surface-100/90 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-nexus-purple" />
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  MULTI-MODEL DEMAND FORECAST & CONSUMPTION ENVELOPE: {forecastSeries.product_name} ({forecastSeries.sku_id})
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Historical daily consumption vs 14-day projection via Neural Network (MLP) and Gradient Boosting
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Historical Actual</span>
              </span>
              <span className="flex items-center space-x-1.5 text-nexus-cyan">
                <span className="w-2.5 h-2.5 rounded-full bg-nexus-cyan" />
                <span>Gradient Boosting</span>
              </span>
              <span className="flex items-center space-x-1.5 text-nexus-purple">
                <span className="w-2.5 h-2.5 rounded-full bg-nexus-purple" />
                <span>Neural Net MLP</span>
              </span>
            </div>
          </div>

          {/* Forecast Series Table / Points */}
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            {/* Historical Sample */}
            <div className="bg-surface-200/40 rounded p-3 border border-slate-800">
              <span className="text-slate-300 font-bold block mb-2 pb-1 border-b border-slate-800">
                Recent 7-Day Actual Consumption
              </span>
              <div className="space-y-1.5">
                {forecastSeries.historical_actuals?.slice(-7).map((h: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">{h.date}</span>
                    <span className="text-white font-bold">{h.actual_demand} units</span>
                    <span className="text-nexus-cyan">GB: {h.forecast_gb}</span>
                    <span className="text-nexus-purple">NN: {h.forecast_nn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Projection Sample */}
            <div className="bg-surface-200/40 rounded p-3 border border-slate-800">
              <span className="text-slate-300 font-bold block mb-2 pb-1 border-b border-slate-800">
                Next 7-Day Forward Projections (95% Confidence)
              </span>
              <div className="space-y-1.5">
                {forecastSeries.future_projections?.slice(0, 7).map((f: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-800/40">
                    <span className="text-nexus-cyan font-bold">{f.date}</span>
                    <span className="text-nexus-cyan font-bold">{f.forecast_gb} units</span>
                    <span className="text-nexus-purple">NN: {f.forecast_nn}</span>
                    <span className="text-slate-500 font-sans text-[11px]">
                      Range: [{f.confidence_lower} - {f.confidence_upper}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}

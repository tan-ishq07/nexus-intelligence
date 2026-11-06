"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import { formatNumber, formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  Database,
  Play,
  Sliders,
  Table,
  Zap,
  Filter,
  Layers,
  ArrowUpDown,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function OLAPStudioPage() {
  const [activeTab, setActiveTab] = useState<"dynamic" | "comparisons">("comparisons");
  const [selectedComparison, setSelectedComparison] = useState("revenue-by-product-and-region");
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryTime, setQueryTime] = useState<number>(14.2);
  const [dynamicResult, setDynamicResult] = useState<any>(null);

  // Dynamic Query State
  const [selectedDimension, setSelectedDimension] = useState("warehouse_region");
  const [selectedMeasure, setSelectedMeasure] = useState("total_amount_usd");
  const [selectedAgg, setSelectedAgg] = useState("SUM");

  const loadComparison = async (compName: string) => {
    setIsQuerying(true);
    const start = performance.now();
    try {
      const data = await api.getOLAPComparison(compName);
      setComparisonData(data);
      setQueryTime(Number((performance.now() - start).toFixed(1)));
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuerying(false);
    }
  };

  useEffect(() => {
    loadComparison(selectedComparison);
  }, [selectedComparison]);

  const handleRunDynamicQuery = async () => {
    setIsQuerying(true);
    try {
      const res = await api.runOLAPQuery({
        dimensions: [selectedDimension],
        measures: [{ agg: selectedAgg, col: selectedMeasure, alias: `${selectedAgg.toLowerCase()}_value` }],
        cube_name: "v_olap_orders_shipments",
      });
      setDynamicResult(res);
      setQueryTime(res.execution_time_ms);
    } catch (e: any) {
      alert(`OLAP Query Failed: ${e.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <PageContainer
      title="OLAP ANALYTICS STUDIO"
      subtitle="Multidimensional slice-and-dice, vector cube pivoting, and sub-second analytical aggregations powered by DuckDB"
      breadcrumb={["NEXUS", "Analytics & Mining", "OLAP Studio"]}
      actions={
        <div className="flex items-center space-x-2">
          <Badge variant="purple">DuckDB In-Memory OLAP</Badge>
          <Button
            variant="glow"
            size="sm"
            disabled={isQuerying}
            onClick={() => {
              if (activeTab === "comparisons") loadComparison(selectedComparison);
              else handleRunDynamicQuery();
            }}
          >
            <Play className={`w-3.5 h-3.5 mr-1.5 ${isQuerying ? "animate-spin" : ""}`} />
            {isQuerying ? "Executing Aggregations..." : "Run OLAP Cube Query"}
          </Button>
        </div>
      }
    >
      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="DuckDB Query Latency"
          value={`${queryTime} ms`}
          subtext="Columnar In-Memory Cache"
          trend="down"
          trendType="positive"
          icon={Zap}
        />
        <StatCard
          title="Analytical Cubes"
          value="2 Multi-Fact Cubes"
          subtext="Orders/Shipments & Logistics"
          icon={Database}
        />
        <StatCard
          title="Supported Operations"
          value="Roll-up & Drill-down"
          subtext="Slice, Dice, and Pivot"
          icon={Sliders}
        />
        <StatCard
          title="Dimensions Available"
          value="7 Enterprise Dimensions"
          subtext="Time, Prod, Supp, Cust, WH, Geo, Trans"
          icon={Layers}
        />
      </div>

      {/* Surface Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("comparisons")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "comparisons"
              ? "bg-nexus-cyan/20 text-nexus-cyan font-bold border border-nexus-cyan/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Pre-Built Enterprise Comparisons
        </button>
        <button
          onClick={() => setActiveTab("dynamic")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
            activeTab === "dynamic"
              ? "bg-nexus-cyan/20 text-nexus-cyan font-bold border border-nexus-cyan/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Dynamic Multidimensional Slicer (DuckDB)
        </button>
      </div>

      {/* TAB 1: Pre-Built Analytical Comparisons */}
      {activeTab === "comparisons" && (
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">
                  Select Analytical Comparison
                </span>
                <p className="text-xs text-slate-400">
                  Pre-compiled dimensional roll-ups across logistics, supply resilience, and demand
                </p>
              </div>
              <select
                value={selectedComparison}
                onChange={(e) => setSelectedComparison(e.target.value)}
                className="bg-surface-200 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-nexus-cyan font-mono"
              >
                <option value="revenue-by-product-and-region">1. Revenue by Product Category & Region</option>
                <option value="supplier-performance-by-region">2. Supplier Performance by Region</option>
                <option value="logistics-cost-by-mode">3. Logistics Cost by Transport Mode</option>
                <option value="product-demand-by-warehouse">4. Product Demand by Warehouse Facility</option>
                <option value="monthly-quarterly-shipments">5. Monthly vs Quarterly Shipments</option>
              </select>
            </div>
          </Card>

          {/* Visualization of Comparison */}
          {comparisonData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-nexus-cyan" />
                    <span>OLAP Visualization: {selectedComparison.replace(/-/g, " ").toUpperCase()}</span>
                  </div>
                  <Badge variant="purple">DuckDB Columnar Aggregation</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData.slice(0, 10)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                      <XAxis
                        dataKey={Object.keys(comparisonData[0])[0]}
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        fontFamily="JetBrains Mono"
                      />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        fontFamily="JetBrains Mono"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F1422",
                          borderColor: "#334155",
                          borderRadius: "8px",
                          color: "#F8FAFC",
                          fontSize: "12px",
                          fontFamily: "JetBrains Mono",
                        }}
                      />
                      <Bar
                        dataKey={
                          Object.keys(comparisonData[0]).find(
                            (k) => typeof comparisonData[0][k] === "number"
                          ) || ""
                        }
                        fill="#0EA5E9"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pivoted Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4 text-nexus-cyan" />
                  <span>Cube Slice & Dice Results</span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Execution: <strong className="text-nexus-cyan">{queryTime} ms</strong> | {comparisonData.length} Rows
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      {comparisonData.length > 0 &&
                        Object.keys(comparisonData[0]).map((col) => (
                          <th key={col} className="py-2.5 px-3 uppercase tracking-wider">
                            {col.replace(/_/g, " ")}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {comparisonData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-200/40 transition-colors">
                        {Object.keys(row).map((col) => {
                          const val = row[col];
                          const isNumeric = typeof val === "number";
                          return (
                            <td key={col} className={`py-3 px-3 ${col.includes("revenue") || col.includes("cost") || col.includes("value") ? "text-nexus-cyan font-bold" : ""}`}>
                              {col.includes("usd") && isNumeric
                                ? formatCurrency(val)
                                : isNumeric && !col.includes("pct")
                                ? formatNumber(val)
                                : String(val)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: Dynamic Multidimensional Slicer */}
      {activeTab === "dynamic" && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Select Dimension (Roll-Up / Drill-Down)
                </label>
                <select
                  value={selectedDimension}
                  onChange={(e) => setSelectedDimension(e.target.value)}
                  className="w-full bg-surface-200 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-nexus-cyan font-mono"
                >
                  <option value="warehouse_region">Geography: Warehouse Region</option>
                  <option value="warehouse_country">Geography: Warehouse Country</option>
                  <option value="product_category">Product: Category Hierarchy</option>
                  <option value="customer_segment">Customer: Market Segment</option>
                  <option value="year">Temporal: Year</option>
                  <option value="quarter">Temporal: Quarter</option>
                  <option value="month_name">Temporal: Month Name</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Aggregation Function
                </label>
                <select
                  value={selectedAgg}
                  onChange={(e) => setSelectedAgg(e.target.value)}
                  className="w-full bg-surface-200 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-nexus-cyan font-mono"
                >
                  <option value="SUM">SUM</option>
                  <option value="AVG">AVG</option>
                  <option value="COUNT">COUNT</option>
                  <option value="MAX">MAX</option>
                  <option value="MIN">MIN</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase text-slate-400 font-semibold">
                  Measure Column
                </label>
                <select
                  value={selectedMeasure}
                  onChange={(e) => setSelectedMeasure(e.target.value)}
                  className="w-full bg-surface-200 border border-slate-700 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-nexus-cyan font-mono"
                >
                  <option value="total_amount_usd">Order Total Amount ($USD)</option>
                  <option value="order_quantity">Order Units Quantity</option>
                  <option value="freight_value_usd">Freight Incurred ($USD)</option>
                  <option value="discount_amount_usd">Discounts Applied ($USD)</option>
                </select>
              </div>
            </div>

            <Button
              variant="glow"
              size="sm"
              disabled={isQuerying}
              onClick={handleRunDynamicQuery}
              className="font-mono text-xs"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Compute Dynamic Slice
            </Button>
          </Card>

          {/* Dynamic Result Table & SQL Code View */}
          {dynamicResult && (
            <div className="space-y-4">
              <Card className="p-3 bg-black/80 border-slate-800 text-xs font-mono text-slate-300">
                <span className="text-nexus-cyan font-bold block mb-1">Generated DuckDB Vector SQL:</span>
                <pre className="text-[11px] text-slate-400 overflow-x-auto">{dynamicResult.query_sql.trim()}</pre>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <span>Aggregated Slice Results</span>
                    <Badge variant="info">{dynamicResult.row_count} Groups</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3 uppercase">{selectedDimension}</th>
                          <th className="py-2.5 px-3 uppercase text-right">
                            {selectedAgg}({selectedMeasure})
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {dynamicResult.data.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-surface-200/40 transition-colors">
                            <td className="py-3 px-3 font-semibold text-white">{row[selectedDimension]}</td>
                            <td className="py-3 px-3 text-right font-bold text-nexus-cyan">
                              {selectedMeasure.includes("usd")
                                ? formatCurrency(row[`${selectedAgg.toLowerCase()}_value`])
                                : formatNumber(row[`${selectedAgg.toLowerCase()}_value`])}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}

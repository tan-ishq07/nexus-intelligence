"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import {
  Network,
  GitFork,
  ArrowRight,
  Activity,
  Filter,
  Cpu,
  Play,
  RotateCw,
  Search,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2
} from "lucide-react";

export default function AssociationDiscoveryPage() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState("product_purchasing");
  const [algorithm, setAlgorithm] = useState("fpgrowth");
  const [minSupport, setMinSupport] = useState(0.04);
  const [minConfidence, setMinConfidence] = useState(0.30);
  const [minLift, setMinLift] = useState(1.0);
  const [searchFilter, setSearchFilter] = useState("");
  
  const [miningResult, setMiningResult] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [isMining, setIsMining] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "graph" | "itemsets" | "comparison">("rules");

  // Initial load
  useEffect(() => {
    loadDatasetsAndRun();
  }, []);

  const loadDatasetsAndRun = async () => {
    try {
      const dsets = await api.getAssociationDatasets();
      setDatasets(dsets);
      runMining("product_purchasing", "fpgrowth", 0.04, 0.30);
    } catch (e) {
      console.error(e);
    }
  };

  const runMining = async (
    dset = selectedDataset,
    algo = algorithm,
    supp = minSupport,
    conf = minConfidence
  ) => {
    setIsMining(true);
    try {
      const res = await api.mineAssociationRules({
        dataset_name: dset,
        algorithm: algo,
        min_support: supp,
        min_confidence: conf,
        min_lift: minLift,
        antecedent_filter: searchFilter || undefined
      });
      setMiningResult(res);

      // Also get algorithm comparison benchmarks
      const comp = await api.compareMiningAlgorithms(dset, supp);
      setComparison(comp);
    } catch (err) {
      console.error("Mining run failed", err);
    } finally {
      setIsMining(false);
    }
  };

  const rules = miningResult?.rules || [];
  const network = miningResult?.network_graph || { nodes: [], links: [] };
  const itemsets = miningResult?.frequent_itemsets || [];

  return (
    <PageContainer
      title="ASSOCIATION RULE DISCOVERY"
      subtitle="Unsupervised Apriori & FP-Growth itemset mining uncovering hidden failure cross-dependencies"
      breadcrumb={["NEXUS", "Analytics & Mining", "Association Discovery"]}
    >
      {/* Top Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Discovered Association Rules"
          value={rules.length > 0 ? `${rules.length} Rules` : "0 Rules"}
          subtext={`Support > ${(minSupport * 100).toFixed(1)}%, Conf > ${(minConfidence * 100).toFixed(0)}%`}
          icon={Network}
        />
        <StatCard
          title="Maximum Rule Lift"
          value={rules.length > 0 ? `${Math.max(...rules.map((r: any) => r.lift)).toFixed(2)}x` : "1.0x"}
          subtext="Strongest cross-item dependency"
          trend="up"
          trendType="positive"
          icon={GitFork}
        />
        <StatCard
          title="Mining Execution Latency"
          value={miningResult ? `${miningResult.runtime_ms} ms` : "0 ms"}
          subtext={miningResult ? `${miningResult.transaction_count} transactions processed` : "Standby"}
          alertLevel="normal"
          icon={Activity}
        />
        <StatCard
          title="Active Algorithm"
          value={algorithm.toUpperCase()}
          subtext={comparison?.speedup_ratio || "Prefix-Tree Optimized"}
          icon={Cpu}
        />
      </div>

      {/* Mining Control Panel */}
      <Card className="p-5 border-slate-800 bg-surface-100/90 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-nexus-cyan/10 border border-nexus-cyan/30 flex items-center justify-center text-nexus-cyan">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">MINING WORKBENCH & PARAMETER CONTROLS</h3>
              <p className="text-xs text-slate-400">Configure transactional corpus, algorithm architecture, and threshold constraints</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => runMining()}
              disabled={isMining}
              className="bg-nexus-cyan text-surface-50 hover:bg-nexus-cyan/90 font-mono text-xs px-4"
            >
              {isMining ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Mining Transactions...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-2" />
                  Execute Mining Engine
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 text-xs font-mono">
          {/* Dataset Selector */}
          <div>
            <label className="text-slate-400 block mb-1 text-[11px] font-sans">1. Transaction Corpus</label>
            <select
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
                runMining(e.target.value);
              }}
              className="w-full bg-surface-200 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-nexus-cyan text-xs"
            >
              <option value="product_purchasing">Product Purchasing Baskets</option>
              <option value="shipment_delays">Shipment Delay Multi-Factor</option>
              <option value="inventory_exhaustion">Inventory Stockout Co-Occurrences</option>
              <option value="supplier_product">Supplier & Component Tiers</option>
            </select>
          </div>

          {/* Algorithm Toggle */}
          <div>
            <label className="text-slate-400 block mb-1 text-[11px] font-sans">2. Mining Algorithm</label>
            <div className="flex rounded border border-slate-700 bg-surface-200 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setAlgorithm("fpgrowth");
                  runMining(selectedDataset, "fpgrowth");
                }}
                className={`flex-1 py-1 rounded text-center text-xs transition-colors ${
                  algorithm === "fpgrowth" ? "bg-nexus-cyan text-surface-50 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                FP-Growth
              </button>
              <button
                type="button"
                onClick={() => {
                  setAlgorithm("apriori");
                  runMining(selectedDataset, "apriori");
                }}
                className={`flex-1 py-1 rounded text-center text-xs transition-colors ${
                  algorithm === "apriori" ? "bg-nexus-cyan text-surface-50 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                Apriori
              </button>
            </div>
          </div>

          {/* Min Support Slider */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
              <span>3. Min Support</span>
              <span className="text-nexus-cyan font-mono">{(minSupport * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.25"
              step="0.01"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="w-full accent-nexus-cyan h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>

          {/* Min Confidence Slider */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px] font-sans">
              <span>4. Min Confidence</span>
              <span className="text-nexus-cyan font-mono">{(minConfidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full accent-nexus-cyan h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
            />
          </div>

          {/* Filter text */}
          <div>
            <label className="text-slate-400 block mb-1 text-[11px] font-sans">5. Search Itemset</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Wafer, Congestion, MCU"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runMining()}
                className="w-full bg-surface-200 border border-slate-700 rounded pl-8 pr-2.5 py-1.5 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-nexus-cyan"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs View Selector */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors ${
            activeTab === "rules"
              ? "bg-surface-200 text-nexus-cyan border-b-2 border-nexus-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Discovered Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab("graph")}
          className={`px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors ${
            activeTab === "graph"
              ? "bg-surface-200 text-nexus-cyan border-b-2 border-nexus-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Interactive Network Graph ({network.nodes?.length || 0} Nodes)
        </button>
        <button
          onClick={() => setActiveTab("itemsets")}
          className={`px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors ${
            activeTab === "itemsets"
              ? "bg-surface-200 text-nexus-cyan border-b-2 border-nexus-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Frequent Itemsets ({itemsets.length})
        </button>
        <button
          onClick={() => setActiveTab("comparison")}
          className={`px-3 py-1.5 rounded-t text-xs font-mono font-medium transition-colors ${
            activeTab === "comparison"
              ? "bg-surface-200 text-nexus-cyan border-b-2 border-nexus-cyan"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Algorithm Benchmark (Apriori vs FP-Growth)
        </button>
      </div>

      {/* TAB 1: RULES LIST */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          {rules.length === 0 ? (
            <Card className="p-8 text-center border-slate-800">
              <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-300 font-medium">No association rules matched the current constraint filters.</p>
              <p className="text-xs text-slate-500 mt-1">Try lowering the minimum support or minimum confidence slider above.</p>
            </Card>
          ) : (
            rules.map((rule: any) => (
              <Card key={rule.id} className="p-4 sm:p-5 hover:border-slate-700 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-nexus-cyan">{rule.id}</span>
                    <Badge variant={rule.severity === "critical" ? "critical" : rule.severity === "warning" ? "warning" : "info"}>
                      Lift: {rule.lift}x
                    </Badge>
                  </div>

                  {/* Statistical Confidence Metrics */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <span>Support: <strong className="text-white">{(rule.support * 100).toFixed(1)}%</strong></span>
                    <span>Confidence: <strong className="text-nexus-cyan">{(rule.confidence * 100).toFixed(1)}%</strong></span>
                    <span>Leverage: <strong className="text-slate-300">{rule.leverage}</strong></span>
                    <span>Conviction: <strong className="text-nexus-purple">{rule.conviction}</strong></span>
                  </div>
                </div>

                {/* Antecedent -> Consequent Flow Visualizer */}
                <div className="py-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {rule.antecedents.map((ant: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-surface-200 border border-slate-700 text-xs font-mono text-slate-200"
                      >
                        IF: {ant}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center text-nexus-cyan px-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {rule.consequents.map((cons: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-nexus-cyan/10 border border-nexus-cyan/30 text-xs font-mono text-nexus-cyan font-medium"
                      >
                        THEN: {cons}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Impact Rationale */}
                <div className="text-xs text-slate-400 bg-surface-200/50 p-3 rounded border border-slate-800 flex items-start space-x-2">
                  <Activity className="w-3.5 h-3.5 text-nexus-purple shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-slate-300">Operational Dependency: </strong>
                    {rule.business_impact}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE NETWORK GRAPH */}
      {activeTab === "graph" && (
        <Card className="p-5 border-slate-800 bg-surface-100/90">
          <CardHeader className="p-0 pb-4">
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-nexus-cyan" />
                <span>Association Rule Dependency Network</span>
              </div>
              <Badge variant="cyan">Directed Lift Graph</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[520px] bg-surface-200/40 rounded-lg border border-slate-800 relative overflow-hidden flex items-center justify-center p-4">
              {network.nodes.length === 0 ? (
                <div className="text-center text-slate-500 font-mono text-xs">
                  No network nodes discovered with current support threshold.
                </div>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 900 500">
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                    </marker>
                  </defs>

                  {/* Render Links */}
                  {network.links.map((link: any, idx: number) => {
                    const sourceIdx = network.nodes.findIndex((n: any) => n.id === link.source);
                    const targetIdx = network.nodes.findIndex((n: any) => n.id === link.target);
                    if (sourceIdx === -1 || targetIdx === -1) return null;

                    const total = network.nodes.length;
                    const angleS = (sourceIdx / total) * 2 * Math.PI;
                    const angleT = (targetIdx / total) * 2 * Math.PI;
                    const cx = 450, cy = 250, radius = 190;

                    const sx = cx + radius * Math.cos(angleS);
                    const sy = cy + radius * Math.sin(angleS);
                    const tx = cx + radius * Math.cos(angleT);
                    const ty = cy + radius * Math.sin(angleT);

                    return (
                      <line
                        key={`link-${idx}`}
                        x1={sx}
                        y1={sy}
                        x2={tx}
                        y2={ty}
                        stroke="#06b6d4"
                        strokeWidth={Math.min(3.5, Math.max(1, link.lift * 0.8))}
                        strokeOpacity={Math.min(0.85, Math.max(0.3, link.confidence))}
                        markerEnd="url(#arrow)"
                      />
                    );
                  })}

                  {/* Render Nodes */}
                  {network.nodes.map((node: any, idx: number) => {
                    const total = network.nodes.length;
                    const angle = (idx / total) * 2 * Math.PI;
                    const cx = 450, cy = 250, radius = 190;
                    const x = cx + radius * Math.cos(angle);
                    const y = cy + radius * Math.sin(angle);

                    return (
                      <g key={`node-${idx}`} className="cursor-pointer group">
                        <circle
                          cx={x}
                          cy={y}
                          r={Math.min(22, 12 + (node.frequency || 1) * 2)}
                          fill={node.type === "antecedent" ? "#0F172A" : "#083344"}
                          stroke={node.type === "antecedent" ? "#38bdf8" : "#06b6d4"}
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y > 250 ? y + 24 : y - 16}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="10"
                          fontFamily="monospace"
                          className="pointer-events-none drop-shadow-md font-medium"
                        >
                          {node.name.length > 20 ? node.name.substring(0, 18) + "..." : node.name}
                        </text>
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fill="#38bdf8"
                          fontSize="9"
                          fontFamily="monospace"
                          className="font-bold pointer-events-none"
                        >
                          {node.frequency}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Legend overlay */}
              <div className="absolute bottom-3 left-3 bg-surface-100/90 border border-slate-800 rounded p-2 text-[10px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full border border-sky-400 bg-slate-900" />
                  <span>Antecedent Trigger Item</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full border border-cyan-400 bg-cyan-950" />
                  <span>Consequent Impact Item</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-0.5 bg-cyan-400" />
                  <span>Directed Rule (Width = Lift, Opacity = Confidence)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: FREQUENT ITEMSETS */}
      {activeTab === "itemsets" && (
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-nexus-cyan" />
                <span>Frequent Itemsets Discovered</span>
              </div>
              <Badge variant="info">Support &ge; {(minSupport * 100).toFixed(1)}%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface-200/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Itemset Elements</th>
                    <th className="py-2.5 px-3">Cardinality (k)</th>
                    <th className="py-2.5 px-3">Support Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {itemsets.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-surface-200/40">
                      <td className="py-2.5 px-3 text-slate-500 font-bold">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {item.items.map((sub: string, sIdx: number) => (
                            <span key={sIdx} className="px-2 py-0.5 rounded bg-surface-200 border border-slate-700 text-white">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-nexus-purple font-bold">{item.length}-item</td>
                      <td className="py-2.5 px-3 text-nexus-cyan font-bold">{(item.support * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: ALGORITHM COMPARISON */}
      {activeTab === "comparison" && comparison && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparison.benchmarks?.map((b: any, idx: number) => (
              <Card key={idx} className={`p-5 border-slate-800 ${b.algorithm === "FP-Growth" ? "border-nexus-cyan/40 bg-nexus-cyan/5" : ""}`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Cpu className={`w-4 h-4 ${b.algorithm === "FP-Growth" ? "text-nexus-cyan" : "text-slate-400"}`} />
                    <h4 className="text-sm font-bold text-white font-mono">{b.algorithm}</h4>
                  </div>
                  <Badge variant={b.algorithm === "FP-Growth" ? "cyan" : "secondary"}>
                    {b.execution_time_ms} ms
                  </Badge>
                </div>
                <div className="py-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Algorithmic Complexity:</span>
                    <span className="text-slate-200">{b.algorithmic_complexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Itemsets Yield:</span>
                    <span className="text-nexus-cyan font-bold">{b.itemsets_found} sets</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Use:</span>
                    <span className="text-slate-300 font-sans">{b.recommended_for}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 bg-surface-200/50 border-slate-800 text-xs font-mono text-slate-300">
            <div className="flex items-center space-x-2 text-nexus-emerald mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-bold">EMPIRICAL BENCHMARK CONCLUSION</span>
            </div>
            <p className="text-slate-400 font-sans leading-relaxed">
              FP-Growth operates <strong className="text-white">{comparison.speedup_ratio}</strong> over Apriori by building a compact FP-tree structure and eliminating combinatorial candidate generation passes over the transaction database. Both algorithms yield 100% itemset parity.
            </p>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import { WarehouseTableMeta } from "@/types";
import { formatNumber } from "@/lib/utils";
import {
  Database,
  Search,
  HardDrive,
  Server,
  Layers,
  Key,
  GitBranch,
  RefreshCw,
  Table,
  CheckCircle2,
  Clock,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";

export default function DataWarehousePage() {
  const [schemaTables, setSchemaTables] = useState<WarehouseTableMeta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedTable, setSelectedTable] = useState<WarehouseTableMeta | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSchema = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getWarehouseSchema();
      setSchemaTables(data);
      if (data.length > 0 && !selectedTable) {
        setSelectedTable(data[0]);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSchema();
  }, []);

  const filteredTables = schemaTables.filter((t) => {
    const matchesSearch =
      t.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.natural_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.surrogate_key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "Facts" && t.type.includes("Fact")) ||
      (typeFilter === "Dimensions" && t.type.includes("Dimension")) ||
      (typeFilter === "SCD2" && t.type.includes("SCD"));
    return matchesSearch && matchesType;
  });

  const factCount = schemaTables.filter((t) => t.type.includes("Fact")).length;
  const dimCount = schemaTables.filter((t) => t.type.includes("Dimension")).length;
  const totalRows = schemaTables.reduce((acc, curr) => acc + (curr.row_count || 0), 0);

  return (
    <PageContainer
      title="POSTGRESQL DATA WAREHOUSE & STAR SCHEMA"
      subtitle="Dimensional modelling, conformed dimensions, Slowly Changing Dimensions (SCD Type 2), and surrogate key lineage"
      breadcrumb={["NEXUS", "Data Platform", "Dimensional Warehouse"]}
      onRefresh={loadSchema}
      isRefreshing={isRefreshing}
      actions={
        <Button variant="glow" size="sm" onClick={loadSchema}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Table Schemas
        </Button>
      }
    >
      {/* Top Architecture Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Dimensional Architecture"
          value="Star / Snowflake"
          subtext="Conformed Dimension Mesh"
          icon={Layers}
        />
        <StatCard
          title="Fact Tables (Centrals)"
          value={`${factCount} Fact Tables`}
          subtext="Orders, Shipments, Inventory, Forecasts"
          icon={Table}
        />
        <StatCard
          title="Dimension Tables"
          value={`${dimCount} Dimensions`}
          subtext="SCD2 on Product & Supplier"
          icon={Database}
        />
        <StatCard
          title="Warehouse Records"
          value={formatNumber(totalRows)}
          subtext="PostgreSQL 16 & DuckDB Engine"
          icon={Server}
        />
      </div>

      {/* Star Schema Interactive ER Map */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-nexus-cyan" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              Star Schema Relational Topology
            </h3>
          </div>
          <Badge variant="purple">PostgreSQL 16 Analytical DDL</Badge>
        </div>

        {/* Visual Star Schema Topology Layout */}
        <div className="py-6 grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
          {/* Left Dimensions */}
          <div className="space-y-3 lg:col-span-1">
            <div className="p-3 rounded-lg bg-surface-200/70 border border-slate-800 text-xs font-mono">
              <span className="text-nexus-cyan font-bold block">dim_product</span>
              <span className="text-[10px] text-slate-400">PK: product_key (SCD2)</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-200/70 border border-slate-800 text-xs font-mono">
              <span className="text-nexus-cyan font-bold block">dim_supplier</span>
              <span className="text-[10px] text-slate-400">PK: supplier_key (SCD2)</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-200/70 border border-slate-800 text-xs font-mono">
              <span className="text-nexus-cyan font-bold block">dim_customer</span>
              <span className="text-[10px] text-slate-400">PK: customer_key</span>
            </div>
          </div>

          {/* Central Fact Core */}
          <div className="lg:col-span-3 p-4 rounded-xl bg-surface-200/40 border border-nexus-cyan/40 shadow-glow-cyan text-center space-y-3">
            <Badge variant="info">Central Analytical Core</Badge>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-surface-300 border border-slate-700">
                <span className="font-bold text-white block">fact_orders</span>
                <span className="text-[10px] text-nexus-emerald">Olist E-Commerce</span>
              </div>
              <div className="p-2.5 rounded bg-surface-300 border border-slate-700">
                <span className="font-bold text-white block">fact_shipments</span>
                <span className="text-[10px] text-nexus-cyan">Multimodal Logistics</span>
              </div>
              <div className="p-2.5 rounded bg-surface-300 border border-slate-700">
                <span className="font-bold text-white block">fact_demand_forecasts</span>
                <span className="text-[10px] text-nexus-purple">M5 Walmart Demand</span>
              </div>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Foreign Key constraints joined via surrogate integer keys for high-throughput OLAP aggregations
            </p>
          </div>

          {/* Right Dimensions */}
          <div className="space-y-3 lg:col-span-1">
            <div className="p-3 rounded-lg bg-surface-200/70 border border-slate-800 text-xs font-mono">
              <span className="text-nexus-cyan font-bold block">dim_warehouse</span>
              <span className="text-[10px] text-slate-400">PK: warehouse_key</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-200/70 border border-slate-800 text-xs font-mono">
              <span className="text-nexus-cyan font-bold block">dim_location</span>
              <span className="text-[10px] text-slate-400">PK: location_key (Snowflake)</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-200/70 border border-slate-800 text-xs font-mono">
              <span className="text-nexus-cyan font-bold block">dim_date</span>
              <span className="text-[10px] text-slate-400">PK: date_key (Conformed)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Schema Tables Directory & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Table Directory */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tables or keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-200 border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-nexus-cyan font-mono"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-surface-200 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-nexus-cyan font-mono"
            >
              <option value="All">All Types</option>
              <option value="Facts">Facts</option>
              <option value="Dimensions">Dimensions</option>
              <option value="SCD2">SCD Type 2</option>
            </select>
          </div>

          <div className="space-y-2 max-h-[560px] overflow-y-auto">
            {filteredTables.map((tbl) => (
              <div
                key={tbl.table_name}
                onClick={() => setSelectedTable(tbl)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  selectedTable?.table_name === tbl.table_name
                    ? "bg-surface-200 border-nexus-cyan/60 shadow-glow-cyan"
                    : "bg-surface-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-white">
                    {tbl.table_name}
                  </span>
                  <Badge
                    variant={
                      tbl.type.includes("Fact")
                        ? "info"
                        : tbl.type.includes("SCD")
                        ? "purple"
                        : "neutral"
                    }
                  >
                    {tbl.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                  <span>PK: {tbl.surrogate_key.split(" ")[0]}</span>
                  <span className="font-bold text-nexus-emerald">
                    {formatNumber(tbl.row_count)} rows
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Table Schema & DDL Details */}
        <Card className="lg:col-span-2">
          {selectedTable ? (
            <>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle>
                    <div className="flex items-center space-x-2">
                      <Table className="w-4 h-4 text-nexus-cyan" />
                      <span>{selectedTable.table_name}</span>
                    </div>
                    <Badge variant="purple">{selectedTable.type}</Badge>
                  </CardTitle>
                  <span className="text-xs font-mono text-nexus-emerald font-bold">
                    Live Record Count: {formatNumber(selectedTable.row_count)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Keys & Grain */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-surface-200/50 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">Surrogate Key (PK):</span>
                    <span className="text-nexus-cyan font-bold">{selectedTable.surrogate_key}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-200/50 border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase">Natural Business Key (NK):</span>
                    <span className="text-white font-bold">{selectedTable.natural_key}</span>
                  </div>
                </div>

                {selectedTable.grain && (
                  <div className="p-3 rounded-lg bg-surface-200/30 border border-slate-800/80 text-xs font-mono">
                    <span className="text-slate-400 block text-[10px] uppercase">Table Grain:</span>
                    <span className="text-slate-200">{selectedTable.grain}</span>
                  </div>
                )}

                {/* Foreign Keys or Measures */}
                {selectedTable.foreign_keys && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                      Star Schema Foreign Key Relationships:
                    </span>
                    <div className="space-y-1.5">
                      {selectedTable.foreign_keys.map((fk, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 p-2 rounded bg-surface-200/70 border border-slate-800 text-xs font-mono text-slate-300"
                        >
                          <LinkIcon className="w-3.5 h-3.5 text-nexus-cyan flex-shrink-0" />
                          <span>{fk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTable.measures && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                      Analytical Measures (Aggregates):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTable.measures.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-nexus-cyan/10 border border-nexus-cyan/30 text-nexus-cyan text-xs font-mono"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTable.attributes && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
                      Dimension Attributes & Hierarchy:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTable.attributes.map((a, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-surface-200 border border-slate-700 text-slate-300 text-xs font-mono"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              Select a table from the directory to inspect dimensional schema details.
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}

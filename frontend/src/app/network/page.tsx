"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlobeNetworkCanvas } from "@/components/network/GlobeNetworkCanvas";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { api } from "@/lib/api";
import { GeoNode, GeoRoute } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Globe2,
  Navigation,
  Anchor,
  Factory,
  Building2,
  ShieldAlert,
  Sliders,
  Filter,
  CheckCircle2,
} from "lucide-react";

export default function GlobalNetworkPage() {
  const [nodes, setNodes] = useState<GeoNode[]>([]);
  const [routes, setRoutes] = useState<GeoRoute[]>([]);
  const [selectedNode, setSelectedNode] = useState<GeoNode | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [n, r] = await Promise.all([api.getNodes(), api.getRoutes()]);
      setNodes(n);
      setRoutes(r);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageContainer
      title="GLOBAL SUPPLY CHAIN NETWORK"
      subtitle="Geospatial situational awareness, interactive routing corridors, and strategic chokepoint telemetry"
      breadcrumb={["NEXUS", "Geospatial Operations", "Global Network"]}
      onRefresh={loadData}
      isRefreshing={isRefreshing}
      actions={
        <div className="flex items-center space-x-2">
          <Badge variant="info">Cesium 3D Earth Ready</Badge>
          <Button variant="outline" size="sm">
            <Sliders className="w-3.5 h-3.5 mr-1.5" />
            Corridor Filters
          </Button>
        </div>
      }
    >
      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Facilities"
          value={nodes.length}
          subtext="48 Warehouses, 412 Suppliers"
          icon={Building2}
        />
        <StatCard
          title="Active Transit Corridors"
          value={routes.length}
          subtext="Maritime, Air & Intermodal"
          icon={Navigation}
        />
        <StatCard
          title="High-Risk Hotspots"
          value="3 Theaters"
          subtext="Bab el-Mandeb, Taiwan Strait, Panama"
          alertLevel="critical"
          icon={ShieldAlert}
        />
        <StatCard
          title="Cargo In Transit"
          value="$84.2M"
          subtext="Protected under active tracking"
          icon={Globe2}
        />
      </div>

      {/* Main 3D / Planar Interactive Earth Visualizer */}
      <GlobeNetworkCanvas
        nodes={nodes}
        routes={routes}
        onSelectNode={(node) => setSelectedNode(node)}
      />

      {/* Corridor Breakdown & Node Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-nexus-cyan" />
                <span>Primary Global Logistics Corridors</span>
              </div>
              <Badge variant="neutral">{routes.length} Active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routes.map((rt) => (
                <div
                  key={rt.id}
                  className="p-3 rounded-lg bg-surface-200/50 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono">
                        {rt.origin_name} &rarr; {rt.dest_name}
                      </span>
                      <Badge variant={rt.status === "Delayed" ? "critical" : "success"}>
                        {rt.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Carrier: {rt.carrier} • Mode: {rt.mode} • Shipments: {rt.active_shipments}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-nexus-cyan">
                      {formatCurrency(rt.total_value_usd)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-nexus-rose" />
                <span>Strategic Maritime Chokepoints & Geopolitical Locks</span>
              </div>
              <Badge variant="critical">High Threat</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-nexus-rose/10 border border-nexus-rose/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    Bab el-Mandeb / Southern Red Sea
                  </span>
                  <Badge variant="critical">Risk 92/100</Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Westbound container ships diverting via Cape of Good Hope (+10-14 days). Surcharges: +$1,200/FEU.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-nexus-amber/10 border border-nexus-amber/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    Panama Canal Gatun Lake Lock Basin
                  </span>
                  <Badge variant="warning">Risk 64/100</Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Draft restrictions limiting neo-panamax dry bulk vessels. Auction transit slots averaging $400k premium.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-200/50 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">
                    Strait of Malacca
                  </span>
                  <Badge variant="success">Flow Nominal</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Unimpeded traffic density. 142 vessels in transit, average speed 16.8 knots.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

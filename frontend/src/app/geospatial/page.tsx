"use client";

import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Compass, Anchor, Navigation, ShieldAlert, Waves, AlertTriangle } from "lucide-react";

export default function GeospatialIntelligencePage() {
  const chokepoints = [
    { name: "Strait of Malacca", coordinates: "1.29°N, 103.85°E", trade_share: "24.5%", status: "Nominal Flow", risk_score: 18.0, vessels: 142, impact: "Vital Pacific-Indian Ocean transit link" },
    { name: "Suez Canal & Red Sea Gateway", coordinates: "27.85°N, 34.30°E", trade_share: "12.0%", status: "Severe Diversion (-68%)", risk_score: 92.0, vessels: 22, impact: "Mandatory Cape circumnavigation (+12d)" },
    { name: "Panama Canal Locks", coordinates: "9.08°N, -79.68°W", trade_share: "5.2%", status: "Slot Regulated", risk_score: 62.0, vessels: 36, impact: "Draft limitations on dry bulk" },
    { name: "Strait of Hormuz", coordinates: "26.56°N, 56.25°E", trade_share: "21.0%", status: "Guarded Passage", risk_score: 58.0, vessels: 88, impact: "Hydrocarbon & crude tanker corridor" },
  ];

  return (
    <PageContainer
      title="GEOSPATIAL INTELLIGENCE & CHOKEPOINT SURVEILLANCE"
      subtitle="Strategic maritime passages, naval exclusion envelopes, and alternate circumnavigation economics"
      breadcrumb={["NEXUS", "Geospatial Operations", "Chokepoint Surveillance"]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tracked Global Chokepoints" value="4 Passages" subtext="62.7% of all ocean trade" icon={Compass} />
        <StatCard title="Critical Threat Passages" value="1 Red Sea" subtext="Bab el-Mandeb / Suez" alertLevel="critical" icon={ShieldAlert} />
        <StatCard title="Average Diversion Transit" value="+11.4 days" subtext="Via Cape of Good Hope" icon={Navigation} />
        <StatCard title="Fuel Surcharge Impact" value="+$1.2M / trip" subtext="Bunker C Heavy Oil" alertLevel="warning" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chokepoints.map((cp) => (
          <Card key={cp.name} className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Anchor className="w-4 h-4 text-nexus-cyan" />
                <h3 className="text-sm font-bold text-white font-mono">{cp.name}</h3>
              </div>
              <Badge variant={cp.risk_score > 70 ? "critical" : cp.risk_score > 30 ? "warning" : "success"}>
                Risk: {cp.risk_score}/100
              </Badge>
            </div>

            <div className="py-4 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-slate-200">{cp.coordinates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Global Trade Share:</span>
                <span className="text-white font-bold">{cp.trade_share}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Fleet Density:</span>
                <span className="text-nexus-cyan font-bold">{cp.vessels} vessels</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Corridor Flow Status:</span>
                <span className="text-slate-300 font-bold">{cp.status}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 font-sans">
              {cp.impact}
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

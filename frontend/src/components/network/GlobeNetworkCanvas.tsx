"use client";

import React, { useState } from "react";
import { GeoNode, GeoRoute } from "@/types";
import { Globe3DCanvas } from "./Globe3DCanvas";
import {
  Layers,
  Compass,
  Navigation,
  Anchor,
  Factory,
  Building2,
  ShieldAlert,
  Sliders,
  Globe2,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface Props {
  nodes: GeoNode[];
  routes: GeoRoute[];
  onSelectNode?: (node: GeoNode) => void;
  onSelectRoute?: (route: GeoRoute) => void;
}

export const GlobeNetworkCanvas: React.FC<Props> = ({
  nodes,
  routes,
  onSelectNode,
  onSelectRoute,
}) => {
  const [viewMode, setViewMode] = useState<"3d_globe" | "planar">("3d_globe");
  const [selectedNode, setSelectedNode] = useState<GeoNode | null>(null);

  // 2D Planar projection coordinates
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 880 + 20;
    const y = ((90 - lat) / 180) * 440 + 20;
    return { x, y };
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher HUD */}
      <div className="flex items-center justify-between bg-surface-200/60 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-nexus-cyan animate-pulse" />
          <span className="text-white font-bold tracking-wide">GLOBAL CONTROL TOWER TELEMETRY</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-surface-300 p-1 rounded-md border border-slate-700">
          <button
            onClick={() => setViewMode("3d_globe")}
            className={`px-3 py-1 rounded text-xs transition-colors font-medium ${
              viewMode === "3d_globe"
                ? "bg-nexus-cyan text-surface-50 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Full Interactive 3D Earth</span>
            </span>
          </button>
          <button
            onClick={() => setViewMode("planar")}
            className={`px-3 py-1 rounded text-xs transition-colors font-medium ${
              viewMode === "planar"
                ? "bg-nexus-cyan text-surface-50 font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>2D Mercator Grid</span>
            </span>
          </button>
        </div>
      </div>

      {/* Render Viewport */}
      {viewMode === "3d_globe" ? (
        <Globe3DCanvas
          nodes={nodes}
          routes={routes}
          onSelectNode={onSelectNode}
          onSelectRoute={onSelectRoute}
        />
      ) : (
        <div className="relative w-full h-[620px] rounded-xl border border-slate-800 bg-[#06080E] overflow-hidden shadow-2xl flex flex-col select-none">
          {/* Planar SVG Mesh Map */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <svg
              className="w-full h-full"
              viewBox="0 0 920 480"
              style={{ filter: "drop-shadow(0 0 20px rgba(6,182,212,0.06))" }}
            >
              {/* Grid Lines */}
              <g stroke="#1e293b" strokeWidth="0.75" strokeDasharray="3 3">
                <line x1="20" y1="240" x2="900" y2="240" stroke="#0ea5e9" strokeOpacity="0.3" strokeDasharray="none" />
                <line x1="460" y1="20" x2="460" y2="460" stroke="#0ea5e9" strokeOpacity="0.3" strokeDasharray="none" />
                {[-60, -30, 30, 60].map((deg) => {
                  const y = ((90 - deg) / 180) * 440 + 20;
                  return <line key={`lat-${deg}`} x1="20" y1={y} x2="900" y2={y} />;
                })}
              </g>

              {/* 2D Routes */}
              {routes.map((route) => {
                const oLat = route.origin_lat ?? (route.origin ? route.origin[0] : 0);
                const oLng = route.origin_lng ?? (route.origin ? route.origin[1] : 0);
                const dLat = route.dest_lat ?? (route.destination ? route.destination[0] : 0);
                const dLng = route.dest_lng ?? (route.destination ? route.destination[1] : 0);
                const p1 = projectCoords(oLat, oLng);
                const p2 = projectCoords(dLat, dLng);
                const isDelayed = route.status === "Delayed";
                const strokeColor = isDelayed ? "#f59e0b" : "#06b6d4";

                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2 - 40;
                const d = `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;

                return (
                  <path
                    key={route.id}
                    d={d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.8"
                    strokeOpacity="0.75"
                  />
                );
              })}

              {/* 2D Nodes */}
              {nodes.map((node) => {
                const { x, y } = projectCoords(node.lat, node.lng);
                const isSupplier = node.type === "supplier";
                const isCritical = (node.riskScore || 0) > 70;
                const fillColor = isCritical ? "#ef4444" : isSupplier ? "#06b6d4" : "#3b82f6";

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedNode(node);
                      onSelectNode?.(node);
                    }}
                  >
                    <circle cx={x} cy={y} r={isSupplier ? 5 : 6} fill={fillColor} />
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      fill="#e2e8f0"
                      fontSize="9"
                      fontFamily="monospace"
                      className="opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

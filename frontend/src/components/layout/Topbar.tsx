"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  User,
  ExternalLink,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { initialAlerts } from "@/lib/mockData";

export const Topbar: React.FC = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [workspace, setWorkspace] = useState("Global Supply Mesh - Tier 1 Production");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toUTCString().replace("GMT", "UTC")
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchIndex = [
    // Core Operational Pages
    { title: "Executive Command Center", path: "/command-center", group: "Pages", subtext: "Real-time situational intelligence dashboard" },
    { title: "Full 3D Earth Network Control Tower", path: "/network", group: "3D Globe", subtext: "Interactive planetary globe with 9 intelligence layers" },
    { title: "Predictive Operations & Delay ML", path: "/predictive", group: "AI / ML", subtext: "Delay classification, SHAP attribution & runout forecasting" },
    { title: "Supplier Risk Intelligence", path: "/supplier-risk", group: "AI / ML", subtext: "Supervised risk stratification & compliance evaluation" },
    { title: "Inventory & Stockout Intelligence", path: "/inventory", group: "Pages", subtext: "Safety buffers, runout horizons & replenishment" },
    { title: "Association Rule Mining (Apriori & FP-Growth)", path: "/association-rules", group: "Data Mining", subtext: "Co-occurrence affinity graph & constraint rules" },
    { title: "Mining Laboratory & Clustering", path: "/mining-lab", group: "Data Mining", subtext: "K-Means, Agglomerative, DBSCAN & GMM projections" },
    { title: "Operational Anomaly Surveillance", path: "/anomalies", group: "AI / ML", subtext: "Isolation Forest, DBSCAN outliers & statistical z-score" },
    { title: "Geospatial Logistics & Chokepoint Defense", path: "/geospatial", group: "Geospatial", subtext: "Suez, Panama, Malacca & Cape of Good Hope rerouting" },
    { title: "OLAP Analytical Studio & Star Schema", path: "/olap", group: "Warehouse", subtext: "DuckDB in-memory aggregations & dimensional slices" },
    { title: "What-If Scenario Simulator", path: "/scenarios", group: "Simulation", subtext: "Monte Carlo crisis stress-testing & Before-vs-After charts" },
    { title: "Autonomous Decisions & Playbooks", path: "/decisions", group: "Decisions", subtext: "Autonomous scanner feed & governance state machine" },
    { title: "Reports & Export Center", path: "/reports", group: "Governance", subtext: "Live CSV exports & compliance dossiers" },
    { title: "System Settings & Cluster Health", path: "/settings", group: "System", subtext: "Cluster telemetry & joblib model persistence registry" },
    
    // Strategic Tier-1 Suppliers
    { title: "TSMC Fab 14 (Hsinchu, Taiwan)", path: "/supplier-risk", group: "Suppliers", subtext: "Tier-1 Strategic Semiconductor Foundry • Risk: 14.5" },
    { title: "Foxconn Technology Group (Shenzhen, China)", path: "/supplier-risk", group: "Suppliers", subtext: "Tier-1 Advanced Electronics Assembly • Risk: 28.2" },
    { title: "GlobalFoundries Dresden (Germany)", path: "/supplier-risk", group: "Suppliers", subtext: "Tier-1 European Wafer Fab • Risk: 11.2" },
    { title: "Murata Passive Electronics (Kyoto, Japan)", path: "/supplier-risk", group: "Suppliers", subtext: "Tier-2 Strategic MLCC Capacitors • Risk: 24.1" },
    { title: "Samsung Electronics Giheung (South Korea)", path: "/supplier-risk", group: "Suppliers", subtext: "Tier-1 Memory & Microcontroller Line • Risk: 19.8" },
    { title: "Texas Instruments (Dallas, USA)", path: "/supplier-risk", group: "Suppliers", subtext: "Tier-1 Analog Power Controllers • Risk: 9.4" },
    { title: "Innolux Display Sub-Assembly (Taiwan)", path: "/supplier-risk", group: "Suppliers", subtext: "Tier-2 Display Fab • Risk: 78.6 CRITICAL" },

    // Global Warehouses & Hubs
    { title: "Rotterdam Gateway DC (Netherlands)", path: "/network", group: "Warehouses", subtext: "Automated European Super-Hub • 84.5% Utilization" },
    { title: "Chicago Intermodal Freight Center (USA)", path: "/network", group: "Warehouses", subtext: "North America Rail Spine Gateway • 79.2% Utilization" },
    { title: "Singapore Jurong Logistics Hub", path: "/network", group: "Warehouses", subtext: "Southeast Asia Transshipment Port • 88.0% Utilization" },
    { title: "Frankfurt Airport Logistics Center (Germany)", path: "/network", group: "Warehouses", subtext: "High-Priority Air Freight Bridge • 92.1% Utilization" },

    // Active Disruption Corridors & Hotspots
    { title: "Suez Canal & Bab el-Mandeb (CP-SUEZ)", path: "/geospatial", group: "Disruptions", subtext: "Active Threat Zone • Rerouting via Cape of Good Hope" },
    { title: "Panama Canal Locks (CP-PANAMA)", path: "/geospatial", group: "Disruptions", subtext: "Freshwater Draft Restriction • 28 Daily Transit Slots" },
    { title: "Strait of Malacca Maritime Corridor (CP-MALACCA)", path: "/geospatial", group: "Disruptions", subtext: "High-Density Vessel Navigation Congestion" },
    { title: "Taiwan Semiconductor Air Corridor (CP-TAIWAN)", path: "/geospatial", group: "Disruptions", subtext: "Emergency Osaka & Guam Rerouting Protocol" }
  ];

  const searchResults = searchIndex.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtext.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="h-16 bg-surface-400/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 select-none">
        {/* Left: Workspace Selector & Status */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <button className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-surface-200/90 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-nexus-cyan/40 hover:text-white transition-all">
              <Layers className="w-3.5 h-3.5 text-nexus-cyan" />
              <span className="font-mono">{workspace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded bg-nexus-emerald/10 border border-nexus-emerald/30 text-[11px] font-mono text-nexus-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-nexus-emerald animate-pulse" />
            <span>MESH SYNC: 100% HEALTHY</span>
          </div>
        </div>

        {/* Center: Global Search Bar Button */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-surface-300/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 transition-colors group"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-nexus-cyan transition-colors" />
              <span>Search telemetry, nodes, shipments, alerts...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-200 border border-slate-700 text-[10px] font-mono text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Live Clock, Notifications, Health, Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* UTC Clock */}
          <div className="hidden xl:flex items-center space-x-1.5 text-xs font-mono text-slate-400 bg-surface-300/60 px-2.5 py-1 rounded border border-slate-800/80">
            <Clock className="w-3.5 h-3.5 text-nexus-cyan" />
            <span>{currentTime || "UTC LIVE"}</span>
          </div>

          {/* Notifications Centre */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg bg-surface-200/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-nexus-rose text-[9px] font-bold font-mono flex items-center justify-center text-white shadow-sm animate-pulse">
                4
              </span>
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-surface-300 shadow-2xl p-4 z-50 text-white animate-in fade-in-0">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-nexus-rose" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Active Critical Alerts
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-nexus-rose/20 text-nexus-rose px-2 py-0.5 rounded">
                    4 Unresolved
                  </span>
                </div>
                <div className="py-2 space-y-2.5 max-h-80 overflow-y-auto">
                  {initialAlerts.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setNotificationsOpen(false);
                        router.push("/anomalies");
                      }}
                      className="p-2.5 rounded-lg bg-surface-200/50 hover:bg-surface-200 border border-slate-800/80 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-nexus-cyan font-semibold">
                          {a.alert_code}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{a.detected_at}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 leading-snug">{a.title}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      router.push("/anomalies");
                    }}
                    className="text-xs text-nexus-cyan hover:underline font-mono"
                  >
                    View All Incident Logs &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nexus-purple to-nexus-blue flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-nexus-cyan/30">
              PA
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-none">
                Alexander Vance
              </span>
              <span className="text-[10px] text-slate-400 font-mono leading-none mt-1">
                Principal Architect
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <Modal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Global NEXUS Telemetry Search"
        description="Search across 16 analytical modules, shipments, global facilities, and active alerts"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Type a page, tracking number, or alert name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-200/90 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-nexus-cyan font-mono"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1">
            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No telemetry matching "{searchQuery}"
              </div>
            ) : (
              searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(item.path);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-200/80 cursor-pointer border border-transparent hover:border-slate-700/60 transition-colors group"
                >
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-xs text-white font-medium group-hover:text-nexus-cyan transition-colors">{item.title}</span>
                    <span className="text-[11px] font-sans text-slate-400">{item.subtext}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-slate-400 border border-slate-800 flex-shrink-0 ml-3">
                    {item.group}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

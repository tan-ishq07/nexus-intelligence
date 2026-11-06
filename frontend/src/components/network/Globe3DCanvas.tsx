"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GeoNode, GeoRoute } from "@/types";
import {
  Compass,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Eye,
  Layers,
  Search,
  Filter,
  X,
  ShieldAlert,
  Building2,
  Factory,
  Navigation,
  Anchor,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Globe3DProps {
  nodes: GeoNode[];
  routes: GeoRoute[];
  onSelectNode?: (node: GeoNode) => void;
  onSelectRoute?: (route: GeoRoute) => void;
  onSelectRegion?: (region: string) => void;
}

// 9 Switchable Intelligence Layers
export type IntelligenceLayerKey =
  | "suppliers"
  | "warehouses"
  | "active_shipments"
  | "logistics_routes"
  | "supplier_risk"
  | "demand_heatmap"
  | "inventory_risk"
  | "disruption_hotspots"
  | "regional_performance";

const LAYER_CONFIGS: Array<{ key: IntelligenceLayerKey; name: string; icon: string; defaultActive: boolean }> = [
  { key: "suppliers", name: "Supplier Network", icon: "Factory", defaultActive: true },
  { key: "warehouses", name: "Warehouse Network", icon: "Building2", defaultActive: true },
  { key: "active_shipments", name: "Active Shipments", icon: "Navigation", defaultActive: true },
  { key: "logistics_routes", name: "Logistics Routes", icon: "Route", defaultActive: true },
  { key: "supplier_risk", name: "Supplier Risk Heatmap", icon: "ShieldAlert", defaultActive: false },
  { key: "demand_heatmap", name: "Demand Heatmap", icon: "Activity", defaultActive: false },
  { key: "inventory_risk", name: "Inventory Risk Heatmap", icon: "AlertTriangle", defaultActive: false },
  { key: "disruption_hotspots", name: "Disruption Hotspots", icon: "Flame", defaultActive: true },
  { key: "regional_performance", name: "Regional Performance", icon: "Globe", defaultActive: false },
];

export const Globe3DCanvas: React.FC<Globe3DProps> = ({
  nodes,
  routes,
  onSelectNode,
  onSelectRoute,
  onSelectRegion,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [entityType, setEntityType] = useState<"supplier" | "warehouse" | "shipment" | "hotspot" | "region" | null>(null);

  // Layer Visibility
  const [activeLayers, setActiveLayers] = useState<Record<IntelligenceLayerKey, boolean>>({
    suppliers: true,
    warehouses: true,
    active_shipments: true,
    logistics_routes: true,
    supplier_risk: false,
    demand_heatmap: false,
    inventory_risk: false,
    disruption_hotspots: true,
    regional_performance: false,
  });

  // UI HUD Controls
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("ALL");
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [hoveredEntity, setHoveredEntity] = useState<any | null>(null);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const dynamicGroupRef = useRef<THREE.Group | null>(null);
  const markersMapRef = useRef<Map<string, { mesh: THREE.Object3D; data: any; type: string }>>(new Map());

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraDistanceRef = useRef(260);
  const rotationVelocityRef = useRef({ x: 0.0008, y: 0 });

  // Coordinate Conversion: Lat/Lng -> 3D Sphere Vector
  const latLngToVector3 = (lat: number, lng: number, radius = 100): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // ==========================================
  // INITIALIZE THREE.JS 3D SCENE
  // ==========================================
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.z = cameraDistanceRef.current;
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 3. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x67e8f9, 2.5); // Electric Cyan Sun
    sunLight.position.set(300, 200, 400);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.2); // Indigo Rim Fill
    fillLight.position.set(-300, -100, -200);
    scene.add(fillLight);

    // 4. Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 1600;
      starPositions[i + 1] = (Math.random() - 0.5) * 1600;
      starPositions[i + 2] = (Math.random() - 0.5) * 1600;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 1.2, transparent: true, opacity: 0.65 });
    scene.add(new THREE.Points(starsGeo, starsMat));

    // 5. Globe Sphere Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 5A. Earth Core Sphere
    const earthRadius = 100;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    
    // Procedural Dark Tech Earth Texture
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    // Deep Space Ocean
    ctx.fillStyle = "#040713";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simplified High-Fidelity Continental Silhouettes
    const continents: Array<{ name: string; points: [number, number][] }> = [
      // North America
      {
        name: "North America",
        points: [
          [70, -165], [72, -135], [60, -95], [62, -75], [52, -55], [45, -63], [30, -82],
          [22, -80], [18, -88], [15, -90], [10, -84], [16, -95], [24, -108], [33, -118],
          [48, -125], [58, -135], [65, -165], [70, -165]
        ]
      },
      // South America
      {
        name: "South America",
        points: [
          [12, -72], [10, -62], [5, -52], [-5, -35], [-12, -38], [-23, -42], [-35, -55],
          [-54, -68], [-52, -75], [-40, -74], [-22, -70], [-5, -81], [5, -77], [12, -72]
        ]
      },
      // Europe
      {
        name: "Europe",
        points: [
          [71, 26], [64, 10], [58, 6], [52, 2], [48, -4], [43, -9], [36, -6], [36, 0],
          [40, 18], [38, 24], [42, 30], [46, 38], [55, 38], [65, 42], [71, 26]
        ]
      },
      // Africa
      {
        name: "Africa",
        points: [
          [36, -6], [37, 10], [32, 32], [22, 38], [12, 44], [12, 51], [-4, 40], [-18, 36],
          [-28, 32], [-34, 20], [-34, 18], [-22, 14], [-5, 10], [5, 2], [4, -8], [14, -17],
          [28, -13], [36, -6]
        ]
      },
      // Eurasia / Asia
      {
        name: "Asia",
        points: [
          [75, 100], [70, 175], [60, 165], [55, 140], [42, 132], [30, 122], [22, 114],
          [10, 106], [2, 102], [8, 92], [15, 82], [8, 77], [22, 69], [25, 56], [38, 48],
          [48, 44], [58, 55], [68, 68], [75, 100]
        ]
      },
      // Australia
      {
        name: "Australia",
        points: [
          [-12, 132], [-15, 145], [-25, 153], [-37, 150], [-38, 140], [-34, 116], [-20, 114],
          [-15, 124], [-12, 132]
        ]
      },
      // Greenland
      {
        name: "Greenland",
        points: [[82, -30], [75, -18], [60, -44], [68, -55], [78, -68], [82, -30]]
      },
      // Japan
      {
        name: "Japan",
        points: [[45, 142], [38, 141], [34, 136], [32, 130], [36, 136], [43, 143], [45, 142]]
      },
      // UK
      {
        name: "United Kingdom",
        points: [[58, -5], [54, 0], [50, -1], [50, -5], [55, -6], [58, -5]]
      }
    ];

    // Draw Landmasses
    continents.forEach((cont) => {
      ctx.fillStyle = "#0c1527";
      ctx.strokeStyle = "rgba(14, 165, 233, 0.45)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      cont.points.forEach(([lat, lng], idx) => {
        const x = ((lng + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Subtle inner land texture pattern
      ctx.fillStyle = "rgba(6, 182, 212, 0.04)";
      ctx.fill();
    });

    // Latitude & Longitude Graticule Mesh Lines
    ctx.strokeStyle = "rgba(14, 165, 233, 0.12)";
    ctx.lineWidth = 1;
    // Parallels
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    // Meridians
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = ((lng + 180) / 360) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    // Equator & Prime Meridian Accent
    ctx.strokeStyle = "rgba(6, 182, 212, 0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    const earthTexture = new THREE.CanvasTexture(canvas);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.05,
      specular: new THREE.Color(0x0e7490),
      shininess: 25,
      color: 0x0a1128
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 5B. Atmospheric Glowing Rim
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.08, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // 6. Dynamic Layer Elements Group
    const dynamicGroup = new THREE.Group();
    globeGroup.add(dynamicGroup);
    dynamicGroupRef.current = dynamicGroup;

    // 7. Mouse Event Handlers (Rotation, Zoom & 3D Raycast Selection)
    let downPos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      downPos = { x: e.clientX, y: e.clientY };
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      globeGroupRef.current.rotation.y += deltaX * 0.005;
      globeGroupRef.current.rotation.x += deltaY * 0.005;
      // Clamp vertical tilt
      globeGroupRef.current.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroupRef.current.rotation.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);

      // Trigger 3D Raycasting only if it was a clean click without significant drag
      if (dist < 6 && dynamicGroupRef.current && cameraRef.current) {
        const rect = container.getBoundingClientRect();
        mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVector, cameraRef.current);
        const intersects = raycaster.intersectObjects(dynamicGroupRef.current.children, true);

        if (intersects.length > 0) {
          const hitObj = intersects[0].object;
          let matched = false;
          markersMapRef.current.forEach((item) => {
            if (matched) return;
            if (item.mesh === hitObj || hitObj.parent === item.mesh) {
              matched = true;
              setSelectedEntity(item.data);
              setEntityType(item.type as any);
              if (item.type === "supplier" || item.type === "warehouse") {
                onSelectNode?.(item.data);
              } else if (item.type === "shipment") {
                onSelectRoute?.(item.data);
              }
            }
          });
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(140, Math.min(480, cameraDistanceRef.current + e.deltaY * 0.25));
      if (cameraRef.current) {
        cameraRef.current.position.z = cameraDistanceRef.current;
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    // 8. Animation Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Auto-rotation when not user-dragging
      if (autoRotate && !isDraggingRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += rotationVelocityRef.current.x;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [autoRotate]);

  // ==========================================
  // RENDER 3D DATA LAYERS ON GLOBE
  // ==========================================
  useEffect(() => {
    if (!dynamicGroupRef.current) return;
    const group = dynamicGroupRef.current;
    
    // Clear previous elements
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }
    markersMapRef.current.clear();

    const earthR = 100;

    // Filter nodes by selected region if active
    const filteredNodes = nodes.filter((n) => {
      if (selectedRegionFilter !== "ALL") {
        if (selectedRegionFilter === "APAC" && !["CN", "TW", "SG", "JP", "KR"].includes(n.country)) return false;
        if (selectedRegionFilter === "EMEA" && !["NL", "DE", "FR", "AE", "CD"].includes(n.country)) return false;
        if (selectedRegionFilter === "Americas" && !["US", "BR", "MX"].includes(n.country)) return false;
      }
      return true;
    });

    // 1. LAYER: SUPPLIER NETWORK
    if (activeLayers.suppliers) {
      filteredNodes
        .filter((n) => n.type === "supplier")
        .forEach((sup) => {
          const pos = latLngToVector3(sup.lat, sup.lng, earthR + 1.5);
          
          // 3D Pin Cylinder
          const pinGeo = new THREE.CylinderGeometry(0.8, 0.2, 5, 8);
          pinGeo.translate(0, 2.5, 0);
          pinGeo.rotateX(Math.PI / 2);
          
          const isCritical = ((sup.risk_score ?? sup.riskScore) || 0) > 70;
          const pinMat = new THREE.MeshBasicMaterial({
            color: isCritical ? 0xef4444 : 0x06b6d4
          });
          const pinMesh = new THREE.Mesh(pinGeo, pinMat);
          pinMesh.position.copy(pos);
          pinMesh.lookAt(0, 0, 0);
          group.add(pinMesh);

          // Glowing Ground Disc
          const discGeo = new THREE.RingGeometry(1.2, 2.4, 16);
          const discMat = new THREE.MeshBasicMaterial({
            color: isCritical ? 0xef4444 : 0x06b6d4,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.65
          });
          const discMesh = new THREE.Mesh(discGeo, discMat);
          discMesh.position.copy(pos);
          discMesh.lookAt(0, 0, 0);
          group.add(discMesh);

          markersMapRef.current.set(sup.id, { mesh: pinMesh, data: sup, type: "supplier" });
        });
    }

    // 2. LAYER: WAREHOUSE NETWORK
    if (activeLayers.warehouses) {
      filteredNodes
        .filter((n) => n.type === "warehouse")
        .forEach((wh) => {
          const pos = latLngToVector3(wh.lat, wh.lng, earthR + 1.5);

          // 3D Hexagonal Tower
          const towerGeo = new THREE.BoxGeometry(2.5, 2.5, 8);
          towerGeo.translate(0, 0, 4);
          const towerMat = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            emissive: 0x1d4ed8,
            specular: 0x93c5fd
          });
          const towerMesh = new THREE.Mesh(towerGeo, towerMat);
          towerMesh.position.copy(pos);
          towerMesh.lookAt(pos.clone().multiplyScalar(2));
          group.add(towerMesh);

          markersMapRef.current.set(wh.id, { mesh: towerMesh, data: wh, type: "warehouse" });
        });
    }

    // 3. LAYER: STRATEGIC CHOKEPOINTS & DISRUPTION HOTSPOTS
    if (activeLayers.disruption_hotspots) {
      const chokepoints = [
        { id: "CP-SUEZ", name: "Suez & Bab el-Mandeb", lat: 27.8, lng: 34.3, risk: 94, reason: "Asymmetric Maritime Threat" },
        { id: "CP-PANAMA", name: "Panama Canal Locks", lat: 9.1, lng: -79.7, risk: 72, reason: "Freshwater Draft Restriction" },
        { id: "CP-MALACCA", name: "Strait of Malacca", lat: 2.2, lng: 102.1, risk: 48, reason: "High-Density Navigation Corridor" },
        { id: "CP-TAIWAN", name: "Taiwan Semiconductor Strait", lat: 24.2, lng: 120.5, risk: 85, reason: "Geopolitical Exclusion Warning" }
      ];

      chokepoints.forEach((cp) => {
        const pos = latLngToVector3(cp.lat, cp.lng, earthR + 2);

        // Pulsing Volumetric Danger Disk
        const ringGeo = new THREE.RingGeometry(2.5, 5.5, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        ringMesh.lookAt(0, 0, 0);
        group.add(ringMesh);

        markersMapRef.current.set(cp.id, { mesh: ringMesh, data: cp, type: "hotspot" });
      });
    }

    // 4. LAYER: LOGISTICS ROUTES & 3D GREAT-CIRCLE ARCS
    if (activeLayers.logistics_routes && routes.length > 0) {
      routes.slice(0, 24).forEach((route) => {
        const oLat = route.origin_lat ?? (route.origin ? route.origin[0] : 0);
        const oLng = route.origin_lng ?? (route.origin ? route.origin[1] : 0);
        const dLat = route.dest_lat ?? (route.destination ? route.destination[0] : 0);
        const dLng = route.dest_lng ?? (route.destination ? route.destination[1] : 0);

        const p1 = latLngToVector3(oLat, oLng, earthR);
        const p2 = latLngToVector3(dLat, dLng, earthR);

        // Calculate Great-Circle 3D Parabolic Arc
        const distance = p1.distanceTo(p2);
        const midPoint = p1.clone().add(p2).multiplyScalar(0.5);
        const elevation = Math.min(35, distance * 0.28);
        const elevatedMid = midPoint.normalize().multiplyScalar(earthR + elevation);

        const curve = new THREE.QuadraticBezierCurve3(p1, elevatedMid, p2);
        const points = curve.getPoints(45);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

        const isDelayed = route.status === "Delayed" || route.risk === "Critical";
        const arcMat = new THREE.LineBasicMaterial({
          color: isDelayed ? 0xf59e0b : 0x06b6d4,
          transparent: true,
          opacity: isDelayed ? 0.85 : 0.55,
          linewidth: 2
        });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        group.add(arcLine);

        // 5. LAYER: MOVING ACTIVE SHIPMENTS PARTICLES
        if (activeLayers.active_shipments) {
          const tProgress = ((Date.now() / 2500 + Math.random()) % 1.0);
          const shipPos = curve.getPoint(tProgress);

          const shipGeo = new THREE.SphereGeometry(1.4, 8, 8);
          const shipMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const shipMesh = new THREE.Mesh(shipGeo, shipMat);
          shipMesh.position.copy(shipPos);
          group.add(shipMesh);

          markersMapRef.current.set(route.id, { mesh: arcLine, data: route, type: "shipment" });
        }
      });
    }

    // 6. LAYER: SUPPLIER RISK HEATMAP
    if (activeLayers.supplier_risk) {
      filteredNodes.forEach((n) => {
        const score = (n.risk_score ?? n.riskScore) || 0;
        if (score > 40) {
          const pos = latLngToVector3(n.lat, n.lng, earthR + 1);
          const heatGeo = new THREE.RingGeometry(3, score * 0.12, 16);
          const heatMat = new THREE.MeshBasicMaterial({
            color: 0xef4444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
          });
          const heatMesh = new THREE.Mesh(heatGeo, heatMat);
          heatMesh.position.copy(pos);
          heatMesh.lookAt(0, 0, 0);
          group.add(heatMesh);
        }
      });
    }

    // 7. LAYER: DEMAND HEATMAP
    if (activeLayers.demand_heatmap) {
      filteredNodes
        .filter((n) => n.type === "warehouse")
        .forEach((wh) => {
          const pos = latLngToVector3(wh.lat, wh.lng, earthR + 1.2);
          const demandGeo = new THREE.RingGeometry(3.5, 9.5, 24);
          const demandMat = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55
          });
          const demandMesh = new THREE.Mesh(demandGeo, demandMat);
          demandMesh.position.copy(pos);
          demandMesh.lookAt(0, 0, 0);
          group.add(demandMesh);
        });
    }

    // 8. LAYER: INVENTORY RISK HEATMAP
    if (activeLayers.inventory_risk) {
      filteredNodes
        .filter((n) => ((n.risk_score ?? n.riskScore) || 0) > 35)
        .forEach((n) => {
          const pos = latLngToVector3(n.lat, n.lng, earthR + 1.8);
          // Vertical Beacon Cylinder
          const beaconGeo = new THREE.CylinderGeometry(0.5, 0.5, 12, 8);
          beaconGeo.translate(0, 6, 0);
          beaconGeo.rotateX(Math.PI / 2);
          const beaconMat = new THREE.MeshBasicMaterial({
            color: 0xc084fc,
            transparent: true,
            opacity: 0.75
          });
          const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
          beaconMesh.position.copy(pos);
          beaconMesh.lookAt(0, 0, 0);
          group.add(beaconMesh);
        });
    }

    // 9. LAYER: REGIONAL PERFORMANCE CORRIDORS
    if (activeLayers.regional_performance) {
      const regionsMeta = [
        { name: "APAC Maritime Corridor", lat: 18.0, lng: 115.0, color: 0x06b6d4, radius: 18.0 },
        { name: "EMEA Trade Spine", lat: 38.0, lng: 15.0, color: 0x818cf8, radius: 16.0 },
        { name: "Americas Trans-Isthmus", lat: 24.0, lng: -90.0, color: 0x10b981, radius: 20.0 }
      ];
      regionsMeta.forEach((reg) => {
        const pos = latLngToVector3(reg.lat, reg.lng, earthR + 1.0);
        const haloGeo = new THREE.RingGeometry(reg.radius * 0.7, reg.radius, 32);
        const haloMat = new THREE.MeshBasicMaterial({
          color: reg.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.35
        });
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.position.copy(pos);
        haloMesh.lookAt(0, 0, 0);
        group.add(haloMesh);
      });
    }
  }, [nodes, routes, activeLayers, selectedRegionFilter]);

  // Handle Layer Toggle
  const toggleLayer = (key: IntelligenceLayerKey) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Zoom Helpers
  const handleZoomIn = () => {
    cameraDistanceRef.current = Math.max(140, cameraDistanceRef.current - 35);
    if (cameraRef.current) cameraRef.current.position.z = cameraDistanceRef.current;
  };

  const handleZoomOut = () => {
    cameraDistanceRef.current = Math.min(480, cameraDistanceRef.current + 35);
    if (cameraRef.current) cameraRef.current.position.z = cameraDistanceRef.current;
  };

  // Focus Camera onto Geographical Target
  const focusOnCoordinates = (lat: number, lng: number) => {
    if (!globeGroupRef.current) return;
    const targetY = -(lng + 180) * (Math.PI / 180) + Math.PI / 2;
    const targetX = (lat) * (Math.PI / 180);

    globeGroupRef.current.rotation.y = targetY;
    globeGroupRef.current.rotation.x = Math.max(-1.2, Math.min(1.2, targetX));
    cameraDistanceRef.current = 200;
    if (cameraRef.current) cameraRef.current.position.z = 200;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase();

    // Match node
    const matchedNode = nodes.find(
      (n) => n.name.toLowerCase().includes(query) || n.country.toLowerCase().includes(query) || (n.city && n.city.toLowerCase().includes(query))
    );
    if (matchedNode) {
      focusOnCoordinates(matchedNode.lat, matchedNode.lng);
      setSelectedEntity(matchedNode);
      setEntityType(matchedNode.type === "supplier" ? "supplier" : "warehouse");
      return;
    }

    // Match route
    const matchedRoute = routes.find(
      (r) =>
        (r.origin_name && r.origin_name.toLowerCase().includes(query)) ||
        (r.dest_name && r.dest_name.toLowerCase().includes(query)) ||
        (r.originPort && r.originPort.toLowerCase().includes(query)) ||
        (r.destPort && r.destPort.toLowerCase().includes(query)) ||
        r.id.toLowerCase().includes(query)
    );
    if (matchedRoute) {
      const oLat = matchedRoute.origin_lat ?? (matchedRoute.origin ? matchedRoute.origin[0] : 0);
      const oLng = matchedRoute.origin_lng ?? (matchedRoute.origin ? matchedRoute.origin[1] : 0);
      focusOnCoordinates(oLat, oLng);
      setSelectedEntity(matchedRoute);
      setEntityType("shipment");
    }
  };

  return (
    <div
      className={`relative w-full rounded-xl border border-slate-800 bg-[#040714] overflow-hidden shadow-2xl flex select-none ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[680px]"
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP HUD: Geolocation Search & Layer Toggles */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search port, supplier, hub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface-300/90 backdrop-blur-md border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-nexus-cyan shadow-xl w-56"
          />
        </form>

        {/* Region Filter */}
        <select
          value={selectedRegionFilter}
          onChange={(e) => {
            setSelectedRegionFilter(e.target.value);
            if (e.target.value !== "ALL") onSelectRegion?.(e.target.value);
          }}
          className="bg-surface-300/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-nexus-cyan shadow-xl"
        >
          <option value="ALL">Global View</option>
          <option value="APAC">APAC Sector</option>
          <option value="EMEA">EMEA Corridor</option>
          <option value="Americas">Americas Corridor</option>
        </select>

        {/* Layers Drawer Trigger */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className={`backdrop-blur-md text-xs font-mono shadow-xl ${
            showLayerPanel ? "border-nexus-cyan text-nexus-cyan bg-nexus-cyan/10" : "bg-surface-300/90 text-slate-300"
          }`}
        >
          <Layers className="w-3.5 h-3.5 mr-1.5" />
          9 Intelligence Layers
        </Button>
      </div>

      {/* TOP RIGHT CONTROLS: Auto-Rotate, Zoom, Fullscreen */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? "Pause Orbit" : "Auto-Orbit Earth"}
          className="bg-surface-300/90 backdrop-blur-md border-slate-700 text-slate-300 hover:text-white h-8 w-8 shadow-xl"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomIn}
          title="Zoom In"
          className="bg-surface-300/90 backdrop-blur-md border-slate-700 text-slate-300 hover:text-white h-8 w-8 shadow-xl"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="bg-surface-300/90 backdrop-blur-md border-slate-700 text-slate-300 hover:text-white h-8 w-8 shadow-xl"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Globe"}
          className="bg-surface-300/90 backdrop-blur-md border-slate-700 text-slate-300 hover:text-white h-8 w-8 shadow-xl"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </Button>
      </div>

      {/* FLOATING 9-LAYER SWITCHER DRAWER */}
      {showLayerPanel && (
        <div className="absolute top-16 left-4 z-20 w-64 bg-surface-400/95 backdrop-blur-xl border border-slate-800 rounded-xl p-3 shadow-2xl space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300">
            <span className="font-bold text-nexus-cyan text-[11px]">WORLDWIDE INTELLIGENCE LAYERS</span>
            <button onClick={() => setShowLayerPanel(false)} className="text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 pt-1 max-h-80 overflow-y-auto">
            {LAYER_CONFIGS.map((layer) => {
              const active = activeLayers[layer.key];
              return (
                <button
                  key={layer.key}
                  onClick={() => toggleLayer(layer.key)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    active ? "bg-nexus-cyan/15 text-white border border-nexus-cyan/40" : "text-slate-400 hover:bg-surface-300"
                  }`}
                >
                  <span className="truncate">{layer.name}</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      active ? "bg-nexus-cyan shadow-glow-cyan" : "bg-slate-700"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* RIGHT CONTEXTUAL TELEMETRY SIDE PANEL */}
      {selectedEntity && (
        <div className="absolute top-4 right-14 z-20 w-80 max-h-[90%] bg-surface-400/95 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-2xl overflow-y-auto text-xs font-mono space-y-3">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-nexus-cyan font-bold block uppercase tracking-wider">
                {entityType || "GEO ENTITY"} TELEMETRY
              </span>
              <h4 className="text-sm font-bold text-white font-sans mt-0.5">
                {selectedEntity.name || selectedEntity.origin_name || selectedEntity.originPort || selectedEntity.id}
              </h4>
            </div>
            <button onClick={() => setSelectedEntity(null)} className="text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Attributes for Supplier */}
          {entityType === "supplier" && (
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Tier:</span>
                <span className="text-nexus-cyan font-bold">{selectedEntity.tier || "Tier 1 Strategic"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Location:</span>
                <span>{selectedEntity.country} ({selectedEntity.lat.toFixed(2)}, {selectedEntity.lng.toFixed(2)})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Delivery Reliability:</span>
                <span className="text-nexus-emerald font-bold">{selectedEntity.reliability || "94.2%"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Disruption Risk:</span>
                <Badge variant={((selectedEntity.risk_score ?? selectedEntity.riskScore) || 0) > 70 ? "critical" : "warning"}>
                  {(selectedEntity.risk_score ?? selectedEntity.riskScore) || 24.5}/100
                </Badge>
              </div>
              <div className="p-2.5 rounded bg-surface-300 border border-slate-800 text-[11px] text-slate-300 font-sans">
                Active telemetry confirms nominal component output. Dual-source allocation verified.
              </div>
            </div>
          )}

          {/* Context Attributes for Warehouse */}
          {entityType === "warehouse" && (
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Facility Type:</span>
                <span className="text-nexus-purple font-bold">Automated Global Distribution</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Capacity:</span>
                <span>{selectedEntity.capacity || "650,000 sqft"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Utilization:</span>
                <span className="text-white font-bold">{selectedEntity.utilization || "84.5%"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Throughput:</span>
                <span className="text-nexus-cyan font-bold">{selectedEntity.throughput || "42,000 units/day"}</span>
              </div>
            </div>
          )}

          {/* Context Attributes for Shipment Route */}
          {entityType === "shipment" && (
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Corridor:</span>
                <span className="text-white font-bold">
                  {selectedEntity.origin_name || selectedEntity.originPort} &rarr; {selectedEntity.dest_name || selectedEntity.destPort}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Carrier:</span>
                <span>{selectedEntity.carrier || "Maersk Line"} ({selectedEntity.mode || "Maritime"})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Status:</span>
                <Badge variant={selectedEntity.status === "Delayed" ? "warning" : "success"}>
                  {selectedEntity.status}
                </Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Delay Forecast:</span>
                <span className="text-nexus-amber font-bold">{selectedEntity.delayForecast || "+42.0 hrs"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Cargo Value:</span>
                <span className="text-nexus-cyan font-bold">{selectedEntity.valueFormatted || "$14,500,000"}</span>
              </div>
            </div>
          )}

          {/* Context Attributes for Disruption Hotspot */}
          {entityType === "hotspot" && (
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Threat Index:</span>
                <Badge variant="critical">{selectedEntity.risk}/100 CRITICAL</Badge>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Disruption Driver:</span>
                <span className="text-red-400 font-bold">{selectedEntity.reason}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-2">
                Commercial vessel rerouting active. Diverted cargo moving via Cape of Good Hope (+12.4 days ETA delta).
              </p>
            </div>
          )}

          <Button
            size="sm"
            className="w-full bg-nexus-cyan text-surface-50 hover:bg-nexus-cyan/90 font-mono text-xs mt-2"
            onClick={() => focusOnCoordinates(selectedEntity.lat || 0, selectedEntity.lng || 0)}
          >
            Target Satellite Telemetry Lock
          </Button>
        </div>
      )}

      {/* BOTTOM BANNER DISCLAIMER */}
      <div className="absolute bottom-3 left-4 z-20 flex items-center space-x-2 text-[10px] font-mono text-slate-400 bg-surface-300/80 backdrop-blur-md px-3 py-1 rounded-md border border-slate-800">
        <Activity className="w-3 h-3 text-nexus-cyan" />
        <span>NEXUS 3D EARTH ORBIT • REAL HISTORICAL COORDINATES & MODELLED TELEMETRY</span>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef, useCallback, useMemo, Suspense, Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Navigation, Locate, AlertCircle, ShoppingCart,
  Search, X, ChevronRight, Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── WebGL availability check ─────────────────────────────────────────────────
function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!ctx;
  } catch {
    return false;
  }
}

class Scene3DErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.warn("3D scene error:", error, info); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ─── Store Anchor (Bangalore SmartCart Superstore) ───────────────────────────
const STORE_ANCHOR = { lat: 12.9716, lng: 77.5946 };
const GPS_SCALE = 100000; // 1 GPS-degree ≈ 100,000 3D units (≈ 11 km/unit)

// ─── Coordinate Conversion ───────────────────────────────────────────────────
const gpsTo3D = (
  lat: number, lng: number,
  originLat: number, originLng: number
): [number, number, number] => [
  (lng - originLng) * GPS_SCALE,  // x: east (+) / west (-)
  0,                               // y: ground level
  (lat - originLat) * GPS_SCALE,  // z: north (+) = into store
];

// ─── Section Definitions (3D positions + GPS offsets) ────────────────────────
const SECTIONS = [
  { id: "fruits",    name: "Fruits & Vegetables", emoji: "🥦", color: "#22c55e", pos3d: [-25, 0, 15] as [number,number,number], size: [18, 0, 13] as [number,number,number], shelves: 4 },
  { id: "dairy",     name: "Dairy & Eggs",         emoji: "🥛", color: "#3b82f6", pos3d: [0, 0, 15]  as [number,number,number], size: [18, 0, 13] as [number,number,number], shelves: 3 },
  { id: "grains",    name: "Grains & Staples",     emoji: "🌾", color: "#f59e0b", pos3d: [25, 0, 15]  as [number,number,number], size: [18, 0, 13] as [number,number,number], shelves: 4 },
  { id: "beverages", name: "Beverages",             emoji: "🍹", color: "#8b5cf6", pos3d: [-25, 0, 35] as [number,number,number], size: [18, 0, 13] as [number,number,number], shelves: 3 },
  { id: "snacks",    name: "Snacks & Namkeen",     emoji: "🍟", color: "#ef4444", pos3d: [0, 0, 35]  as [number,number,number], size: [18, 0, 13] as [number,number,number], shelves: 3 },
  { id: "spices",    name: "Spices & Masala",      emoji: "🌶️", color: "#f97316", pos3d: [25, 0, 35]  as [number,number,number], size: [18, 0, 13] as [number,number,number], shelves: 3 },
  { id: "household", name: "Household",             emoji: "🧹", color: "#06b6d4", pos3d: [-25, 0, 55] as [number,number,number], size: [18, 0, 10] as [number,number,number], shelves: 2 },
  { id: "personal",  name: "Personal Care",         emoji: "💄", color: "#ec4899", pos3d: [0, 0, 55]  as [number,number,number], size: [18, 0, 10] as [number,number,number], shelves: 2 },
  { id: "checkout",  name: "Checkout",              emoji: "💳", color: "#14b8a6", pos3d: [25, 0, 55]  as [number,number,number], size: [18, 0, 10] as [number,number,number], shelves: 0 },
];

// ─── Product → Section Mapping ───────────────────────────────────────────────
const PRODUCT_SECTION: Record<string, string> = {
  broccoli:"fruits", tomato:"fruits", onion:"fruits", potato:"fruits",
  apple:"fruits", banana:"fruits", mango:"fruits", grapes:"fruits", carrot:"fruits",
  "amul butter":"dairy", milk:"dairy", curd:"dairy", paneer:"dairy",
  cheese:"dairy", eggs:"dairy", yogurt:"dairy", ghee:"dairy", butter:"dairy", amul:"dairy",
  rice:"grains", wheat:"grains", atta:"grains", dal:"grains", basmati:"grains",
  sugar:"grains", salt:"grains", flour:"grains", maggi:"grains", noodles:"grains",
  chips:"snacks", namkeen:"snacks", "parle-g":"snacks", biscuit:"snacks",
  haldirams:"snacks", lays:"snacks", kurkure:"snacks", popcorn:"snacks",
  "tata tea":"beverages", coffee:"beverages", juice:"beverages", water:"beverages",
  tea:"beverages", soda:"beverages", pepsi:"beverages", lassi:"beverages",
  "garam masala":"spices", turmeric:"spices", cumin:"spices", haldi:"spices",
  masala:"spices", "mdh":"spices", coriander:"spices", jeera:"spices",
  soap:"household", detergent:"household", broom:"household", vim:"household",
  shampoo:"personal", toothpaste:"personal", deo:"personal", "face wash":"personal",
  lotion:"personal", conditioner:"personal",
};

// ─── 3D Components ────────────────────────────────────────────────────────────

function WarehouseFloor() {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 30]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#e8ecf0" roughness={0.9} />
      </mesh>
      {/* Aisle stripes */}
      {[-12.5, 12.5].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.04, 30]}>
          <planeGeometry args={[1, 80]} />
          <meshStandardMaterial color="#d1d5db" roughness={1} />
        </mesh>
      ))}
      {[25, 45].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, z]}>
          <planeGeometry args={[80, 0.5]} />
          <meshStandardMaterial color="#d1d5db" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function WarehouseWalls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 4, 65]}>
        <boxGeometry args={[82, 10, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-40, 4, 30]}>
        <boxGeometry args={[0.4, 10, 80]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {/* Right wall */}
      <mesh position={[40, 4, 30]}>
        <boxGeometry args={[0.4, 10, 80]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {/* Front wall (entrance) with gap */}
      <mesh position={[-27, 4, -10]}>
        <boxGeometry args={[25, 10, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      <mesh position={[27, 4, -10]}>
        <boxGeometry args={[25, 10, 0.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
    </group>
  );
}

function CeilingLights() {
  const positions: [number, number, number][] = [
    [-20, 8.8, 15], [0, 8.8, 15], [20, 8.8, 15],
    [-20, 8.8, 35], [0, 8.8, 35], [20, 8.8, 35],
    [-20, 8.8, 55], [0, 8.8, 55], [20, 8.8, 55],
  ];
  return (
    <group>
      {/* Ceiling plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 9, 30]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#94a3b8" side={THREE.BackSide} roughness={1} />
      </mesh>
      {/* Light panels */}
      {positions.map((pos, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={pos}>
          <planeGeometry args={[4, 1.5]} />
          <meshStandardMaterial color="#fff" emissive="#ffffff" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function ShelfUnit({ position, length }: { position: [number, number, number]; length: number }) {
  return (
    <group position={position}>
      {[0.8, 1.8, 2.8].map((h, i) => (
        <mesh key={i} position={[0, h, 0]}>
          <boxGeometry args={[length, 0.08, 0.4]} />
          <meshStandardMaterial color="#8b7355" roughness={0.9} />
        </mesh>
      ))}
      {/* Side supports */}
      {[-length / 2 + 0.1, length / 2 - 0.1].map((x, i) => (
        <mesh key={i} position={[x, 1.5, 0]}>
          <boxGeometry args={[0.06, 3.2, 0.45]} />
          <meshStandardMaterial color="#6b5c45" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function SectionZone({ section, isTarget }: { section: typeof SECTIONS[0]; isTarget: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (isTarget) {
        mat.opacity = 0.25 + Math.sin(clock.getElapsedTime() * 3) * 0.15;
        mat.emissiveIntensity = 0.2 + Math.sin(clock.getElapsedTime() * 3) * 0.1;
      } else {
        mat.opacity = hovered ? 0.2 : 0.1;
        mat.emissiveIntensity = 0;
      }
    }
  });

  const [px, , pz] = section.pos3d;
  const [sw, , sd] = section.size;

  // Shelf rows
  const shelfRows = [];
  for (let i = 0; i < section.shelves; i++) {
    const rowZ = pz - sd / 2 + (i + 1) * (sd / (section.shelves + 1));
    shelfRows.push(
      <ShelfUnit key={i} position={[px, 0, rowZ]} length={sw * 0.85} />
    );
  }

  return (
    <group>
      {/* Floor zone */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[px, 0.01, pz]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <planeGeometry args={[sw, sd]} />
        <meshStandardMaterial
          color={section.color}
          emissive={section.color}
          emissiveIntensity={0}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Section border */}
      <Line
        points={[
          [px - sw / 2, 0.02, pz - sd / 2],
          [px + sw / 2, 0.02, pz - sd / 2],
          [px + sw / 2, 0.02, pz + sd / 2],
          [px - sw / 2, 0.02, pz + sd / 2],
          [px - sw / 2, 0.02, pz - sd / 2],
        ]}
        color={section.color}
        lineWidth={isTarget ? 3 : 1.5}
      />

      {/* Shelf units */}
      {shelfRows}

      {/* HTML label */}
      <Html
        position={[px, 4.5, pz]}
        center
        occlude={false}
        zIndexRange={[10, 100]}
      >
        <div
          style={{
            background: isTarget
              ? `${section.color}ee`
              : "rgba(255,255,255,0.92)",
            color: isTarget ? "#fff" : "#1e293b",
            border: `2px solid ${section.color}`,
            borderRadius: "8px",
            padding: "4px 10px",
            fontSize: "11px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
            boxShadow: isTarget ? `0 0 12px ${section.color}88` : "0 2px 8px rgba(0,0,0,0.15)",
            transform: "translateZ(0)",
            animation: isTarget ? "pulse 1.5s infinite" : "none",
          }}
        >
          {section.emoji} {section.name}
        </div>
      </Html>
    </group>
  );
}

function EntranceGate() {
  return (
    <group position={[0, 0, -2]}>
      {/* Gate posts */}
      {[-6, 6].map((x, i) => (
        <mesh key={i} position={[x, 2.5, 0]}>
          <boxGeometry args={[0.4, 5, 0.4]} />
          <meshStandardMaterial color="#10b981" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Gate arch */}
      <mesh position={[0, 5.1, 0]}>
        <boxGeometry args={[13, 0.4, 0.4]} />
        <meshStandardMaterial color="#10b981" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Entrance label */}
      <Html position={[0, 5.8, 0]} center>
        <div style={{
          background: "#10b981",
          color: "#fff",
          borderRadius: "6px",
          padding: "3px 10px",
          fontSize: "11px",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        }}>
          🚪 ENTRANCE — SmartCart
        </div>
      </Html>
    </group>
  );
}

function UserMarker({ position3D }: { position3D: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const currentPos = useRef(new THREE.Vector3(...position3D));
  const targetPos = useRef(new THREE.Vector3(...position3D));

  useEffect(() => {
    targetPos.current.set(...position3D);
  }, [position3D]);

  useFrame(({ clock }) => {
    currentPos.current.lerp(targetPos.current, 0.08);
    if (meshRef.current) {
      meshRef.current.position.copy(currentPos.current);
      meshRef.current.position.y = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.position.copy(currentPos.current);
      ringRef.current.position.y = 0.05;
      const s = 1 + (Math.sin(clock.getElapsedTime() * 2) + 1) * 0.5;
      ringRef.current.scale.setScalar(s);
      (ringRef.current.material as THREE.MeshStandardMaterial).opacity = 0.5 - s * 0.15;
    }
  });

  return (
    <group>
      {/* Pulsing ring on floor */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.8, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} />
      </mesh>
      {/* User sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      {/* YOU label */}
      <Html position={position3D} center>
        <div style={{
          background: "#1d4ed8",
          color: "#fff",
          borderRadius: "20px",
          padding: "2px 8px",
          fontSize: "10px",
          fontWeight: "bold",
          marginBottom: "45px",
          whiteSpace: "nowrap",
          boxShadow: "0 0 10px #3b82f688",
        }}>
          📍 YOU
        </div>
      </Html>
    </group>
  );
}

function DestinationBeacon({ position3D, color }: { position3D: [number, number, number]; color: string }) {
  const beamRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beamRef.current) {
      beamRef.current.position.y = 2 + Math.sin(t * 2) * 0.3;
    }
    if (ringRef.current) {
      const s = 1 + (Math.sin(t * 3) + 1) * 0.8;
      ringRef.current.scale.set(s, 1, s);
      (ringRef.current.material as THREE.MeshStandardMaterial).opacity = 0.6 / s;
    }
  });

  return (
    <group position={position3D}>
      {/* Floor ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.5, 2.5, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>
      {/* Beacon cone */}
      <mesh ref={beamRef} position={[0, 2, 0]}>
        <coneGeometry args={[0.4, 1.5, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent opacity={0.9}
        />
      </mesh>
      {/* Vertical light beam */}
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.05, 0.3, 9, 8, 1, true]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function NavigationPath({ from, to, color }: { from: [number,number,number]; to: [number,number,number]; color: string }) {
  const points: [number,number,number][] = useMemo(() => {
    const pts: [number,number,number][] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      pts.push([
        from[0] + (to[0] - from[0]) * t,
        0.18,
        from[2] + (to[2] - from[2]) * t,
      ]);
    }
    return pts;
  }, [from, to]);

  return (
    <Line
      points={points as any}
      color={color}
      lineWidth={5}
      dashed
      dashScale={3}
      dashSize={1.2}
      gapSize={0.6}
    />
  );
}

function CameraRig({ userPos3D, targetPos3D, navigating }: {
  userPos3D: [number, number, number];
  targetPos3D: [number, number, number] | null;
  navigating: boolean;
}) {
  const { camera } = useThree();
  const controls = useThree(s => (s as any).controls);

  const desiredTarget = useRef(new THREE.Vector3(0, 0, 25));

  useEffect(() => {
    if (navigating && targetPos3D) {
      desiredTarget.current.set(
        (userPos3D[0] + targetPos3D[0]) / 2,
        0,
        (userPos3D[2] + targetPos3D[2]) / 2
      );
    } else {
      desiredTarget.current.set(...userPos3D);
    }
  }, [userPos3D, targetPos3D, navigating]);

  useFrame(() => {
    if (controls && (controls as any).target) {
      (controls as any).target.lerp(desiredTarget.current, 0.03);
      (controls as any).update?.();
    }
  });

  return null;
}

// ─── Full 3D Scene ────────────────────────────────────────────────────────────
function StoreScene({
  userPos3D,
  targetSectionId,
  navigating,
}: {
  userPos3D: [number, number, number];
  targetSectionId: string | null;
  navigating: boolean;
}) {
  const targetSection = SECTIONS.find(s => s.id === targetSectionId) || null;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      <pointLight position={[-20, 8, 15]} intensity={0.4} color="#ffffff" />
      <pointLight position={[20, 8, 35]} intensity={0.4} color="#ffffff" />
      <pointLight position={[-20, 8, 55]} intensity={0.4} color="#ffffff" />

      {/* Warehouse structure */}
      <WarehouseFloor />
      <WarehouseWalls />
      <CeilingLights />
      <EntranceGate />

      {/* Section zones */}
      {SECTIONS.map(section => (
        <SectionZone key={section.id} section={section} isTarget={section.id === targetSectionId} />
      ))}

      {/* Navigation path */}
      {navigating && targetSection && (
        <NavigationPath
          from={[userPos3D[0], 0.15, userPos3D[2]]}
          to={[targetSection.pos3d[0], 0.15, targetSection.pos3d[2]]}
          color={targetSection.color}
        />
      )}

      {/* Destination beacon */}
      {targetSection && (
        <DestinationBeacon
          position3D={targetSection.pos3d}
          color={targetSection.color}
        />
      )}

      {/* User marker */}
      <UserMarker position3D={userPos3D} />

      {/* Camera rig */}
      <CameraRig
        userPos3D={userPos3D}
        targetPos3D={targetSection?.pos3d || null}
        navigating={navigating}
      />

      {/* Orbit controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={120}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

// ─── 2D Canvas Fallback Map ───────────────────────────────────────────────────
function Map2DFallback({
  userPos3D,
  targetSectionId,
}: {
  userPos3D: [number, number, number];
  targetSectionId: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = rect.width, H = rect.height;

      // Background
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, W, H);
      // Grid
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Layout: 3x3 grid + entrance
      const cols = 3, rows = 3;
      const padX = W * 0.04, padY = H * 0.04;
      const cellW = (W - padX * 2) / cols;
      const cellH = (H - padY * 2 - H * 0.1) / rows;

      SECTIONS.forEach((s, idx) => {
        if (s.id === "checkout") return;
        const col = idx % 3, row = Math.floor(idx / 3);
        const x = padX + col * cellW + cellW * 0.05;
        const y = padY + row * cellH + cellH * 0.05;
        const w = cellW * 0.9, h = cellH * 0.9;
        const isTarget = s.id === targetSectionId;
        const alpha = isTarget ? "55" : "22";
        ctx.fillStyle = s.color + alpha;
        ctx.strokeStyle = s.color + (isTarget ? "ff" : "77");
        ctx.lineWidth = isTarget ? 2.5 : 1;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke();
        ctx.font = `${Math.max(12, w * 0.15)}px serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(s.emoji, x + w / 2, y + h * 0.38);
        ctx.fillStyle = isTarget ? s.color : "#94a3b8";
        ctx.font = `${isTarget ? "bold " : ""}${Math.max(8, w * 0.08)}px system-ui`;
        const words = s.name.split(" ");
        const lh = Math.max(10, w * 0.1);
        if (words.length > 2) {
          ctx.fillText(words.slice(0, 2).join(" "), x + w / 2, y + h * 0.66);
          ctx.fillText(words.slice(2).join(" "), x + w / 2, y + h * 0.78);
        } else {
          ctx.fillText(s.name, x + w / 2, y + h * 0.7);
        }
      });

      // Entrance
      const ex = W / 2 - W * 0.08, ey = H - padY * 2 - H * 0.04;
      ctx.fillStyle = "#374151";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(ex, ey, W * 0.16, H * 0.06, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#10b981"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🚪 ENTRANCE", ex + W * 0.08, ey + H * 0.03);

      // User dot
      const sIdx = Math.max(0, Math.min(8, Math.floor(userPos3D[2] / 20) * 3 + Math.floor(userPos3D[0] / 20) + 3));
      const col = Math.max(0, Math.min(2, Math.round((userPos3D[0] + 25) / 25)));
      const row = Math.max(0, Math.min(2, Math.round(userPos3D[2] / 20)));
      const ux = padX + col * cellW + cellW / 2;
      const uy = padY + row * cellH + cellH / 2;
      const pTime = (Date.now() % 1500) / 1500;
      ctx.fillStyle = `rgba(59,130,246,${0.15 - pTime * 0.12})`;
      ctx.beginPath(); ctx.arc(ux, uy, 12 + pTime * 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3b82f6"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ux, uy, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#93c5fd"; ctx.font = "bold 9px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText("YOU", ux, uy - 9);

      // Navigation path + destination
      if (targetSectionId) {
        const tIdx = SECTIONS.findIndex(s => s.id === targetSectionId);
        if (tIdx >= 0) {
          const tcol = tIdx % 3, trow = Math.floor(tIdx / 3);
          const tx = padX + tcol * cellW + cellW / 2;
          const ty = padY + trow * cellH + cellH / 2;
          const ts = SECTIONS[tIdx];
          const grad = ctx.createLinearGradient(ux, uy, tx, ty);
          grad.addColorStop(0, "#6366f1aa"); grad.addColorStop(1, ts.color + "cc");
          ctx.strokeStyle = grad; ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 5]); ctx.lineDashOffset = -(Date.now() / 40) % 13;
          ctx.shadowColor = "#6366f1"; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.moveTo(ux, uy); ctx.lineTo(tx, ty); ctx.stroke();
          ctx.setLineDash([]); ctx.shadowBlur = 0;
          const pulseR = (Date.now() % 1200) / 1200;
          ctx.fillStyle = `rgba(99,102,241,${0.2 - pulseR * 0.18})`;
          ctx.beginPath(); ctx.arc(tx, ty, 16 + pulseR * 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#6366f1"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(tx, ty, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#fff"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("★", tx, ty);
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [userPos3D, targetSectionId]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      data-testid="canvas-store-map-2d"
      style={{ display: "block" }}
    />
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function StoreMapPage() {
  const [webglAvailable] = useState(() => checkWebGL());
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [userPos3D, setUserPos3D] = useState<[number, number, number]>([0, 0, 0]);
  const [currentSection, setCurrentSection] = useState("Entrance");
  const [accuracy, setAccuracy] = useState(0);
  const [speed, setSpeed] = useState(0);
  const originRef = useRef<{ lat: number; lng: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Navigation
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);

  const targetSection = useMemo(
    () => SECTIONS.find(s => s.id === targetSectionId) || null,
    [targetSectionId]
  );

  // ── Find current section from 3D position ──
  const find3DSection = useCallback((pos: [number, number, number]) => {
    for (const s of SECTIONS) {
      const [sx, , sz] = s.pos3d;
      const [sw, , sd] = s.size;
      if (Math.abs(pos[0] - sx) < sw / 2 && Math.abs(pos[2] - sz) < sd / 2)
        return s.name;
    }
    return pos[2] < 5 ? "Entrance" : "Aisle";
  }, []);

  // ── Autocomplete ──
  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    const q = searchQuery.toLowerCase();
    const matches = Object.keys(PRODUCT_SECTION).filter(k => k.includes(q)).slice(0, 6);
    SECTIONS.forEach(s => {
      if (s.name.toLowerCase().includes(q) && !matches.includes(s.name.toLowerCase()))
        matches.push(s.name.toLowerCase());
    });
    setSuggestions(matches.slice(0, 6));
  }, [searchQuery]);

  const navigateTo = useCallback((sectionId: string) => {
    setTargetSectionId(sectionId);
    setNavigating(true);
    setSuggestions([]);
  }, []);

  const handleSearch = useCallback((query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return;
    const found = PRODUCT_SECTION[q];
    if (found) { navigateTo(found); return; }
    for (const [k, v] of Object.entries(PRODUCT_SECTION)) {
      if (k.includes(q) || q.includes(k)) { navigateTo(v); return; }
    }
    for (const s of SECTIONS) {
      if (s.name.toLowerCase().includes(q)) { navigateTo(s.id); return; }
    }
    setGpsError(`No results for "${query}". Try: milk, chips, maggi, turmeric…`);
    setTimeout(() => setGpsError(null), 3000);
  }, [navigateTo]);

  const clearNav = useCallback(() => {
    setTargetSectionId(null);
    setNavigating(false);
    setSearchQuery("");
  }, []);

  // ── GPS Tracking ──
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { setGpsError("Geolocation not supported"); return; }
    setGpsActive(true);
    setGpsError(null);
    originRef.current = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng, accuracy: acc, speed: spd } = coords;
        if (!originRef.current) originRef.current = { lat, lng };
        const origin = originRef.current;
        const pos3d = gpsTo3D(lat, lng, origin.lat, origin.lng);
        setUserPos3D(pos3d);
        setGpsCoords({ lat, lng });
        setAccuracy(Math.round(acc));
        setSpeed(spd || 0);
        setCurrentSection(find3DSection(pos3d));
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Location access denied. Enable permissions.",
          2: "Location unavailable.",
          3: "Location request timed out.",
        };
        setGpsError(msgs[err.code] || "GPS error");
        setGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }, [find3DSection]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
    setGpsCoords(null);
    originRef.current = null;
    setUserPos3D([0, 0, 0]);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-map-title">
          <MapPin className="w-6 h-6 text-primary" /> 3D Store Navigation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real GPS → 3D warehouse · Search a product to navigate · Orbit to explore
        </p>
      </div>

      {/* ── Search Bar ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search product to navigate… e.g. Maggi, Milk, Chips"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch(searchQuery)}
                  className="pl-9"
                  data-testid="input-product-search"
                />
              </div>
              <Button onClick={() => handleSearch(searchQuery)} data-testid="button-search-navigate">
                Navigate
              </Button>
              {targetSectionId && (
                <Button variant="outline" onClick={clearNav} data-testid="button-clear-navigation">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Autocomplete */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 right-24 z-20 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden"
                >
                  {suggestions.map(s => {
                    const sectionId = PRODUCT_SECTION[s] || SECTIONS.find(sec => sec.name.toLowerCase() === s)?.id;
                    const section = SECTIONS.find(sec => sec.id === sectionId);
                    return (
                      <button
                        key={s}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                        onClick={() => { setSearchQuery(s); if (sectionId) navigateTo(sectionId); }}
                      >
                        <span>{section?.emoji || "🔍"}</span>
                        <span className="capitalize">{s}</span>
                        {section && (
                          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" /> {section.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav status */}
          <AnimatePresence>
            {targetSection && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
                style={{ backgroundColor: targetSection.color + "18", color: targetSection.color }}
              >
                <Navigation className="w-4 h-4 animate-pulse" />
                <span>Navigating to {targetSection.emoji} {targetSection.name}</span>
                <Badge variant="outline" className="ml-auto text-xs" style={{ borderColor: targetSection.color, color: targetSection.color }}>
                  Follow the beam →
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Controls Row ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {!gpsActive ? (
          <Button onClick={startTracking} size="sm" data-testid="button-start-tracking">
            <Locate className="w-4 h-4 mr-2" /> Start Real GPS
          </Button>
        ) : (
          <>
            <Button onClick={stopTracking} variant="destructive" size="sm" data-testid="button-stop-tracking">
              <Navigation className="w-4 h-4 mr-2" /> Stop GPS
            </Button>
            <Badge variant="secondary" className="gap-1 font-mono text-xs">
              <Radio className="w-3 h-3 text-green-500 animate-pulse" />
              GPS LIVE · ±{accuracy}m
            </Badge>
          </>
        )}
        {gpsCoords && (
          <Badge variant="outline" className="font-mono text-xs">
            {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
          </Badge>
        )}
        {gpsActive && speed > 0.3 && (
          <Badge variant="outline">{(speed * 3.6).toFixed(1)} km/h</Badge>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          Drag to orbit · Scroll to zoom · Right-drag to pan
        </span>
      </div>

      <AnimatePresence>
        {gpsError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-destructive/30">
              <CardContent className="flex items-center gap-3 py-3">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive" data-testid="text-gps-error">{gpsError}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ── */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">You Are In</p>
            <p className="text-sm font-semibold truncate" data-testid="text-current-section">{currentSection}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Destination</p>
            <p className="text-sm font-semibold truncate">{targetSection ? `${targetSection.emoji} ${targetSection.name}` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">GPS Position (3D)</p>
            <p className="text-sm font-mono truncate">
              {userPos3D[0].toFixed(1)}, {userPos3D[2].toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Anchor</p>
            <p className="text-xs font-mono text-muted-foreground truncate">
              {STORE_ANCHOR.lat}, {STORE_ANCHOR.lng}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── 3D Warehouse Canvas ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> SmartCart Warehouse — 3D Navigation
          </CardTitle>
          <CardDescription>
            {targetSection
              ? `Following the ${targetSection.color} beacon to ${targetSection.emoji} ${targetSection.name}`
              : "Click a section below or search above to see the navigation beacon and path"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className="w-full rounded-b-xl overflow-hidden bg-slate-800"
            style={{ height: "480px" }}
            data-testid="canvas-store-map"
          >
            {webglAvailable ? (
              <Scene3DErrorBoundary
                fallback={
                  <Map2DFallback userPos3D={userPos3D} targetSectionId={targetSectionId} />
                }
              >
                <Canvas
                  camera={{ position: [0, 45, -30], fov: 50, near: 0.1, far: 500 }}
                  gl={{ antialias: true }}
                >
                  <Suspense fallback={null}>
                    <StoreScene
                      userPos3D={userPos3D}
                      targetSectionId={targetSectionId}
                      navigating={navigating}
                    />
                  </Suspense>
                </Canvas>
              </Scene3DErrorBoundary>
            ) : (
              <Map2DFallback userPos3D={userPos3D} targetSectionId={targetSectionId} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Navigate Grid ── */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Quick Navigate — click any section</p>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {SECTIONS.filter(s => s.id !== "checkout").map(section => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo(section.id)}
              data-testid={`card-section-${section.id}`}
            >
              <Card className={`cursor-pointer transition-all text-left h-full ${targetSectionId === section.id ? "ring-2 shadow-md" : ""}`}>
                <CardContent className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{section.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">{section.name}</p>
                      <div className="w-full h-1 rounded-full mt-1" style={{ backgroundColor: section.color + "30" }}>
                        <div
                          className="h-1 rounded-full transition-all duration-500"
                          style={{
                            width: targetSectionId === section.id ? "100%" : "0%",
                            backgroundColor: section.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

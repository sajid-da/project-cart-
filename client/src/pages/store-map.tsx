import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Locate, AlertCircle, ShoppingCart, Clock } from "lucide-react";
import { motion } from "framer-motion";

const STORE_SECTIONS = [
  { id: "entrance", name: "Entrance", x: 0.5, y: 0.95, w: 0.15, h: 0.05, color: "#6b7280" },
  { id: "fruits", name: "Fruits & Vegetables", x: 0.05, y: 0.05, w: 0.28, h: 0.25, color: "#22c55e" },
  { id: "dairy", name: "Dairy & Eggs", x: 0.37, y: 0.05, w: 0.26, h: 0.25, color: "#3b82f6" },
  { id: "grains", name: "Grains & Staples", x: 0.67, y: 0.05, w: 0.28, h: 0.25, color: "#f59e0b" },
  { id: "beverages", name: "Beverages", x: 0.05, y: 0.35, w: 0.28, h: 0.25, color: "#8b5cf6" },
  { id: "snacks", name: "Snacks & Namkeen", x: 0.37, y: 0.35, w: 0.26, h: 0.25, color: "#ef4444" },
  { id: "spices", name: "Spices & Masala", x: 0.67, y: 0.35, w: 0.28, h: 0.25, color: "#f97316" },
  { id: "household", name: "Household", x: 0.05, y: 0.65, w: 0.28, h: 0.2, color: "#06b6d4" },
  { id: "personal", name: "Personal Care", x: 0.37, y: 0.65, w: 0.26, h: 0.2, color: "#ec4899" },
  { id: "checkout", name: "Checkout", x: 0.67, y: 0.65, w: 0.28, h: 0.2, color: "#14b8a6" },
];

const AISLES = [
  { x1: 0.33, y1: 0.05, x2: 0.33, y2: 0.85 },
  { x1: 0.63, y1: 0.05, x2: 0.63, y2: 0.85 },
  { x1: 0.05, y1: 0.3, x2: 0.95, y2: 0.3 },
  { x1: 0.05, y1: 0.6, x2: 0.95, y2: 0.6 },
];

interface Position {
  x: number;
  y: number;
}

export default function StoreMapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userPosition, setUserPosition] = useState<Position>({ x: 0.5, y: 0.9 });
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("Entrance");
  const [positionHistory, setPositionHistory] = useState<Position[]>([{ x: 0.5, y: 0.9 }]);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const originRef = useRef<{ lat: number; lng: number } | null>(null);
  const animFrameRef = useRef<number>(0);

  const gpsToStoreCoords = useCallback((lat: number, lng: number): Position => {
    if (!originRef.current) {
      originRef.current = { lat, lng };
    }
    const origin = originRef.current;
    const dLat = lat - origin.lat;
    const dLng = lng - origin.lng;
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * Math.cos(origin.lat * Math.PI / 180);
    const dx = dLng * metersPerDegreeLng;
    const dy = dLat * metersPerDegreeLat;
    const storeWidth = 50;
    const storeHeight = 60;
    const normX = 0.5 + (dx / storeWidth);
    const normY = 0.5 - (dy / storeHeight);
    return {
      x: Math.max(0.02, Math.min(0.98, normX)),
      y: Math.max(0.02, Math.min(0.98, normY)),
    };
  }, []);

  const findCurrentSection = useCallback((pos: Position): string => {
    for (const section of STORE_SECTIONS) {
      if (pos.x >= section.x && pos.x <= section.x + section.w &&
          pos.y >= section.y && pos.y <= section.y + section.h) {
        return section.name;
      }
    }
    if (pos.y > 0.85) return "Near Entrance";
    return "Aisle";
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported by your browser");
      return;
    }
    setGpsActive(true);
    setGpsError(null);
    originRef.current = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc, speed: spd, heading: hdg } = position.coords;
        const storePos = gpsToStoreCoords(latitude, longitude);
        setUserPosition(storePos);
        setAccuracy(Math.round(acc));
        setSpeed(spd || 0);
        setHeading(hdg || 0);
        setCurrentSection(findCurrentSection(storePos));
        setPositionHistory(prev => {
          const newHistory = [...prev, storePos];
          return newHistory.length > 100 ? newHistory.slice(-100) : newHistory;
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError("Location access denied. Please enable location permissions.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError("Location unavailable. Make sure GPS is enabled.");
            break;
          case error.TIMEOUT:
            setGpsError("Location request timed out. Please try again.");
            break;
        }
        setGpsActive(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  }, [gpsToStoreCoords, findCurrentSection]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  }, []);

  const resetPosition = useCallback(() => {
    originRef.current = null;
    setPositionHistory([]);
    setUserPosition({ x: 0.5, y: 0.9 });
    setCurrentSection("Entrance");
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.strokeRect(2, 2, W - 4, H - 4);

      AISLES.forEach(aisle => {
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(aisle.x1 * W, aisle.y1 * H);
        ctx.lineTo(aisle.x2 * W, aisle.y2 * H);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      STORE_SECTIONS.forEach(section => {
        const sx = section.x * W;
        const sy = section.y * H;
        const sw = section.w * W;
        const sh = section.h * H;

        ctx.fillStyle = section.color + "18";
        ctx.strokeStyle = section.color + "60";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = section.color;
        ctx.font = `bold ${Math.max(10, W * 0.022)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const words = section.name.split(" ");
        const lineHeight = Math.max(12, W * 0.028);
        if (words.length > 1 && sw < W * 0.3) {
          const mid = Math.ceil(words.length / 2);
          const line1 = words.slice(0, mid).join(" ");
          const line2 = words.slice(mid).join(" ");
          ctx.fillText(line1, sx + sw / 2, sy + sh / 2 - lineHeight / 2);
          ctx.fillText(line2, sx + sw / 2, sy + sh / 2 + lineHeight / 2);
        } else {
          ctx.fillText(section.name, sx + sw / 2, sy + sh / 2);
        }
      });

      if (positionHistory.length > 1) {
        ctx.strokeStyle = "#6366f180";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(positionHistory[0].x * W, positionHistory[0].y * H);
        for (let i = 1; i < positionHistory.length; i++) {
          ctx.lineTo(positionHistory[i].x * W, positionHistory[i].y * H);
        }
        ctx.stroke();

        for (let i = 0; i < positionHistory.length; i++) {
          const alpha = (i / positionHistory.length) * 0.4;
          ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.beginPath();
          ctx.arc(positionHistory[i].x * W, positionHistory[i].y * H, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const px = userPosition.x * W;
      const py = userPosition.y * H;

      const pulse = (Date.now() % 2000) / 2000;
      const pulseRadius = 12 + pulse * 15;
      ctx.fillStyle = `rgba(59, 130, 246, ${0.15 - pulse * 0.15})`;
      ctx.beginPath();
      ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#3b82f6";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (heading && speed > 0.3) {
        const headingRad = (heading * Math.PI) / 180;
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.moveTo(px + Math.sin(headingRad) * 16, py - Math.cos(headingRad) * 16);
        ctx.lineTo(px + Math.sin(headingRad + 2.5) * 8, py - Math.cos(headingRad + 2.5) * 8);
        ctx.lineTo(px + Math.sin(headingRad - 2.5) * 8, py - Math.cos(headingRad - 2.5) * 8);
        ctx.closePath();
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [userPosition, positionHistory, heading, speed]);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-map-title">
          <MapPin className="w-6 h-6" /> Store Map
        </h1>
        <p className="text-muted-foreground mt-1">Navigate SmartCart store with real-time location tracking</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {!gpsActive ? (
          <Button onClick={startTracking} data-testid="button-start-tracking">
            <Locate className="w-4 h-4 mr-2" /> Start Live Tracking
          </Button>
        ) : (
          <>
            <Button onClick={stopTracking} variant="destructive" data-testid="button-stop-tracking">
              <Navigation className="w-4 h-4 mr-2" /> Stop Tracking
            </Button>
            <Button onClick={resetPosition} variant="outline" data-testid="button-reset-position">
              <MapPin className="w-4 h-4 mr-2" /> Reset Origin
            </Button>
          </>
        )}
      </div>

      {gpsError && (
        <Card className="border-destructive/30">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive" data-testid="text-gps-error">{gpsError}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Current Location</p>
              <p className="font-medium text-sm" data-testid="text-current-section">{currentSection}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <Navigation className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Speed</p>
              <p className="font-medium text-sm" data-testid="text-speed">{speed > 0 ? `${(speed * 3.6).toFixed(1)} km/h` : "Stationary"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <Locate className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">GPS Accuracy</p>
              <p className="font-medium text-sm" data-testid="text-accuracy">{gpsActive ? `±${accuracy}m` : "Not active"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> SmartCart Store Layout
          </CardTitle>
          <CardDescription>
            {gpsActive
              ? "Blue dot shows your current position. Walk around to see movement!"
              : "Click 'Start Live Tracking' to see your position on the map"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              data-testid="canvas-store-map"
              style={{ display: "block" }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {STORE_SECTIONS.filter(s => s.id !== "entrance").map(section => (
          <motion.div key={section.id} whileHover={{ scale: 1.02 }}>
            <Card className={`cursor-default ${currentSection === section.name ? "ring-2 ring-primary" : ""}`} data-testid={`card-section-${section.id}`}>
              <CardContent className="py-2 px-3 text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: section.color }} />
                <p className="text-xs font-medium leading-tight">{section.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Locate, AlertCircle, ShoppingCart, Search, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORE_SECTIONS = [
  { id: "fruits",    name: "Fruits & Vegetables", emoji: "🥦", x: 0.04, y: 0.04, w: 0.28, h: 0.27, color: "#22c55e", shelfCount: 4 },
  { id: "dairy",     name: "Dairy & Eggs",         emoji: "🥛", x: 0.36, y: 0.04, w: 0.28, h: 0.27, color: "#3b82f6", shelfCount: 3 },
  { id: "grains",    name: "Grains & Staples",     emoji: "🌾", x: 0.68, y: 0.04, w: 0.28, h: 0.27, color: "#f59e0b", shelfCount: 4 },
  { id: "beverages", name: "Beverages",             emoji: "🍹", x: 0.04, y: 0.37, w: 0.28, h: 0.26, color: "#8b5cf6", shelfCount: 3 },
  { id: "snacks",    name: "Snacks & Namkeen",     emoji: "🍟", x: 0.36, y: 0.37, w: 0.28, h: 0.26, color: "#ef4444", shelfCount: 3 },
  { id: "spices",    name: "Spices & Masala",      emoji: "🌶️", x: 0.68, y: 0.37, w: 0.28, h: 0.26, color: "#f97316", shelfCount: 3 },
  { id: "household", name: "Household",             emoji: "🧹", x: 0.04, y: 0.69, w: 0.28, h: 0.22, color: "#06b6d4", shelfCount: 2 },
  { id: "personal",  name: "Personal Care",         emoji: "💄", x: 0.36, y: 0.69, w: 0.28, h: 0.22, color: "#ec4899", shelfCount: 2 },
  { id: "checkout",  name: "Checkout",              emoji: "💳", x: 0.68, y: 0.69, w: 0.28, h: 0.22, color: "#14b8a6", shelfCount: 0 },
  { id: "entrance",  name: "Entrance",              emoji: "🚪", x: 0.42, y: 0.93, w: 0.16, h: 0.06, color: "#6b7280", shelfCount: 0 },
];

const PRODUCT_SECTION_MAP: Record<string, string> = {
  // Fruits & Vegetables
  broccoli: "fruits", tomato: "fruits", onion: "fruits", potato: "fruits",
  apple: "fruits", banana: "fruits", mango: "fruits", grapes: "fruits",
  carrot: "fruits", spinach: "fruits", cauliflower: "fruits", peas: "fruits",
  ladyfinger: "fruits", cucumber: "fruits", "green chili": "fruits",
  // Dairy & Eggs
  "amul butter": "dairy", milk: "dairy", curd: "dairy", paneer: "dairy",
  cheese: "dairy", eggs: "dairy", yogurt: "dairy", ghee: "dairy",
  butter: "dairy", cream: "dairy", "amul": "dairy",
  // Grains & Staples
  rice: "grains", wheat: "grains", atta: "grains", dal: "grains",
  basmati: "grains", sugar: "grains", salt: "grains", flour: "grains",
  rajma: "grains", chana: "grains", lentils: "grains", maggi: "grains",
  noodles: "grains", pasta: "grains", oats: "grains",
  // Snacks
  "haldirams": "snacks", "aloo bhujia": "snacks", "parle-g": "snacks",
  biscuit: "snacks", chips: "snacks", namkeen: "snacks", wafers: "snacks",
  lays: "snacks", kurkure: "snacks", pringles: "snacks", popcorn: "snacks",
  cookies: "snacks", crackers: "snacks",
  // Beverages
  "tata tea": "beverages", coffee: "beverages", juice: "beverages",
  water: "beverages", "soft drink": "beverages", "cold drink": "beverages",
  chai: "beverages", "green tea": "beverages", soda: "beverages",
  pepsi: "beverages", cola: "beverages", lassi: "beverages",
  // Spices
  "mdh": "spices", "garam masala": "spices", turmeric: "spices",
  cumin: "spices", coriander: "spices", chili: "spices", pepper: "spices",
  cardamom: "spices", masala: "spices", "haldi": "spices",
  "jeera": "spices", mustard: "spices",
  // Household
  soap: "household", detergent: "household", broom: "household",
  cleaning: "household", washing: "household", vim: "household",
  mop: "household", dishwash: "household", bleach: "household",
  // Personal Care
  shampoo: "personal", toothpaste: "personal", deo: "personal",
  "face wash": "personal", lotion: "personal", talc: "personal",
  conditioner: "personal", moisturizer: "personal", sunscreen: "personal",
};

interface Position { x: number; y: number; }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

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

  // Navigation / search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [navigating, setNavigating] = useState(false);
  const navProgressRef = useRef(0);
  const navAnimRef = useRef<number>(0);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const targetSection = useMemo(
    () => STORE_SECTIONS.find(s => s.id === targetSectionId) || null,
    [targetSectionId]
  );

  // Autocomplete suggestions
  useEffect(() => {
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    const q = searchQuery.toLowerCase();
    const matches = Object.keys(PRODUCT_SECTION_MAP).filter(k => k.includes(q)).slice(0, 6);
    // Also match section names
    STORE_SECTIONS.forEach(s => {
      if (s.name.toLowerCase().includes(q) && !matches.includes(s.name.toLowerCase()))
        matches.push(s.name.toLowerCase());
    });
    setSuggestions(matches.slice(0, 6));
  }, [searchQuery]);

  const navigateTo = useCallback((sectionId: string) => {
    setTargetSectionId(sectionId);
    setNavigating(true);
    navProgressRef.current = 0;
    clearInterval(navAnimRef.current);
    setSuggestions([]);
  }, []);

  const handleSearch = useCallback((query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return;

    // Check product map
    const foundSection = PRODUCT_SECTION_MAP[q];
    if (foundSection) { navigateTo(foundSection); return; }

    // Fuzzy match
    for (const [product, sectionId] of Object.entries(PRODUCT_SECTION_MAP)) {
      if (product.includes(q) || q.includes(product)) {
        navigateTo(sectionId); return;
      }
    }

    // Match section name
    for (const section of STORE_SECTIONS) {
      if (section.name.toLowerCase().includes(q)) {
        navigateTo(section.id); return;
      }
    }

    setGpsError(`No results for "${query}". Try: milk, chips, rice, maggi...`);
    setTimeout(() => setGpsError(null), 3000);
  }, [navigateTo]);

  const clearNavigation = useCallback(() => {
    setTargetSectionId(null);
    setNavigating(false);
    navProgressRef.current = 0;
    setSearchQuery("");
  }, []);

  const gpsToStoreCoords = useCallback((lat: number, lng: number): Position => {
    if (!originRef.current) originRef.current = { lat, lng };
    const origin = originRef.current;
    const dx = (lng - origin.lng) * 111320 * Math.cos(origin.lat * Math.PI / 180);
    const dy = (lat - origin.lat) * 111320;
    return {
      x: Math.max(0.02, Math.min(0.98, 0.5 + dx / 50)),
      y: Math.max(0.02, Math.min(0.98, 0.5 - dy / 60)),
    };
  }, []);

  const findCurrentSection = useCallback((pos: Position): string => {
    for (const section of STORE_SECTIONS) {
      if (pos.x >= section.x && pos.x <= section.x + section.w &&
        pos.y >= section.y && pos.y <= section.y + section.h) {
        return section.name;
      }
    }
    return pos.y > 0.85 ? "Near Entrance" : "Aisle";
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { setGpsError("Geolocation not supported"); return; }
    setGpsActive(true); setGpsError(null); originRef.current = null;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc, speed: spd, heading: hdg } = pos.coords;
        const storePos = gpsToStoreCoords(latitude, longitude);
        setUserPosition(storePos);
        setAccuracy(Math.round(acc));
        setSpeed(spd || 0);
        setHeading(hdg || 0);
        setCurrentSection(findCurrentSection(storePos));
        setPositionHistory(prev => {
          const n = [...prev, storePos];
          return n.length > 100 ? n.slice(-100) : n;
        });
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "Location access denied. Enable location permissions.",
          2: "Location unavailable. Enable GPS.",
          3: "Location request timed out.",
        };
        setGpsError(msgs[err.code] || "GPS error");
        setGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  }, [gpsToStoreCoords, findCurrentSection]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ─── Canvas draw ────────────────────────────────────────────────────────────
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
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      // ── Background ──
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(0, 0, W, H);

      // Floor tiles
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.5;
      const tileSize = Math.max(30, W / 20);
      for (let x = 0; x < W; x += tileSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += tileSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Store border
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, W - 4, H - 4);

      // ── Sections ──
      STORE_SECTIONS.forEach(section => {
        const sx = section.x * W, sy = section.y * H;
        const sw = section.w * W, sh = section.h * H;
        const isTarget = section.id === targetSectionId;
        const isHovered = section.id === hoveredSection;
        const t = (Date.now() % 1500) / 1500;
        const pulse = isTarget ? 0.5 + Math.sin(t * Math.PI * 2) * 0.5 : 1;

        // Section fill
        const alpha = isTarget ? 0.35 + pulse * 0.25 : isHovered ? 0.22 : 0.12;
        ctx.fillStyle = section.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.strokeStyle = section.color + (isTarget ? "cc" : isHovered ? "99" : "55");
        ctx.lineWidth = isTarget ? 3 : 1.5;
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, 8);
        ctx.fill();
        ctx.stroke();

        // Draw shelves
        if (section.shelfCount > 0) {
          ctx.strokeStyle = section.color + "40";
          ctx.lineWidth = 3;
          const shelfSpacing = sh / (section.shelfCount + 1);
          for (let i = 1; i <= section.shelfCount; i++) {
            const fy = sy + shelfSpacing * i;
            ctx.beginPath();
            ctx.moveTo(sx + 6, fy);
            ctx.lineTo(sx + sw - 6, fy);
            ctx.stroke();
          }
        }

        // Emoji icon
        const emojiSize = Math.max(14, sw * 0.18);
        ctx.font = `${emojiSize}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(section.emoji, sx + sw / 2, sy + sh * 0.35);

        // Section name
        ctx.fillStyle = isTarget ? section.color : "#334155";
        ctx.font = `${isTarget ? "bold " : ""}${Math.max(9, sw * 0.09)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = section.name.split(" ");
        const lh = Math.max(11, sw * 0.11);
        if (words.length <= 2) {
          ctx.fillText(section.name, sx + sw / 2, sy + sh * 0.68);
        } else {
          const mid = Math.ceil(words.length / 2);
          ctx.fillText(words.slice(0, mid).join(" "), sx + sw / 2, sy + sh * 0.65);
          ctx.fillText(words.slice(mid).join(" "), sx + sw / 2, sy + sh * 0.78);
        }
      });

      // ── Navigation path ──
      if (targetSection && navigating) {
        navProgressRef.current = Math.min(1, navProgressRef.current + 0.008);
        const progress = navProgressRef.current;

        const px = userPosition.x * W;
        const py = userPosition.y * H;
        const tx = (targetSection.x + targetSection.w / 2) * W;
        const ty = (targetSection.y + targetSection.h / 2) * H;

        // Glowing path
        const grad = ctx.createLinearGradient(px, py, tx, ty);
        grad.addColorStop(0, "#6366f1aa");
        grad.addColorStop(1, targetSection.color + "cc");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = -(Date.now() / 40) % 16;
        ctx.shadowColor = "#6366f1";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(lerp(px, tx, progress), lerp(py, ty, progress));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Arrow markers along the path
        const steps = 3;
        for (let i = 1; i <= steps; i++) {
          const t = (i / (steps + 1)) * progress;
          const ax = lerp(px, tx, t), ay = lerp(py, ty, t);
          const angle = Math.atan2(ty - py, tx - px);
          ctx.fillStyle = "#6366f1cc";
          ctx.beginPath();
          ctx.moveTo(ax + Math.cos(angle) * 8, ay + Math.sin(angle) * 8);
          ctx.lineTo(ax + Math.cos(angle + 2.4) * 5, ay + Math.sin(angle + 2.4) * 5);
          ctx.lineTo(ax + Math.cos(angle - 2.4) * 5, ay + Math.sin(angle - 2.4) * 5);
          ctx.closePath();
          ctx.fill();
        }

        // Destination marker
        if (progress > 0.8) {
          const pulse2 = (Date.now() % 1200) / 1200;
          const pr = 14 + pulse2 * 12;
          ctx.fillStyle = `rgba(99,102,241,${0.15 - pulse2 * 0.12})`;
          ctx.beginPath(); ctx.arc(tx, ty, pr, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#6366f1";
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#6366f1";
          ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(tx, ty, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("★", tx, ty);
        }
      }

      // ── Position history trail ──
      if (positionHistory.length > 1) {
        ctx.strokeStyle = "#6366f150";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(positionHistory[0].x * W, positionHistory[0].y * H);
        for (let i = 1; i < positionHistory.length; i++) {
          ctx.lineTo(positionHistory[i].x * W, positionHistory[i].y * H);
        }
        ctx.stroke();
      }

      // ── User dot ──
      const px = userPosition.x * W, py = userPosition.y * H;
      const pulse3 = (Date.now() % 2000) / 2000;
      ctx.fillStyle = `rgba(59,130,246,${0.15 - pulse3 * 0.14})`;
      ctx.beginPath(); ctx.arc(px, py, 14 + pulse3 * 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3b82f6";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#3b82f6";
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;

      // Direction arrow
      if (heading && speed > 0.3) {
        const r = (heading * Math.PI) / 180;
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.moveTo(px + Math.sin(r) * 18, py - Math.cos(r) * 18);
        ctx.lineTo(px + Math.sin(r + 2.5) * 9, py - Math.cos(r + 2.5) * 9);
        ctx.lineTo(px + Math.sin(r - 2.5) * 9, py - Math.cos(r - 2.5) * 9);
        ctx.closePath(); ctx.fill();
      }

      // ── "You" label ──
      ctx.fillStyle = "#1e40af";
      ctx.font = "bold 10px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("YOU", px, py - 10);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [userPosition, positionHistory, heading, speed, targetSection, navigating, hoveredSection, targetSectionId]);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-map-title">
          <MapPin className="w-6 h-6 text-primary" /> Store Navigation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search any product to navigate to its aisle — or use Live GPS tracking
        </p>
      </div>

      {/* ── Product Search ── */}
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
                <Button variant="outline" onClick={clearNavigation} data-testid="button-clear-navigation">
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
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-16 z-20 mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden"
                >
                  {suggestions.map(s => {
                    const sectionId = PRODUCT_SECTION_MAP[s] || STORE_SECTIONS.find(sec => sec.name.toLowerCase() === s)?.id;
                    const section = STORE_SECTIONS.find(sec => sec.id === sectionId);
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

          {/* Navigation status */}
          <AnimatePresence>
            {targetSection && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium"
                style={{ backgroundColor: targetSection.color + "18", color: targetSection.color }}
              >
                <Navigation className="w-4 h-4 animate-pulse" />
                <span>Navigating to {targetSection.emoji} {targetSection.name}</span>
                <Badge variant="outline" className="ml-auto text-xs" style={{ borderColor: targetSection.color, color: targetSection.color }}>
                  Follow the path →
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── GPS Controls ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {!gpsActive ? (
          <Button onClick={startTracking} variant="outline" size="sm" data-testid="button-start-tracking">
            <Locate className="w-4 h-4 mr-2" /> Start Live GPS
          </Button>
        ) : (
          <>
            <Button onClick={stopTracking} variant="destructive" size="sm" data-testid="button-stop-tracking">
              <Navigation className="w-4 h-4 mr-2" /> Stop GPS
            </Button>
            <Badge variant="secondary" className="gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              GPS Active · ±{accuracy}m
            </Badge>
          </>
        )}
        {gpsActive && speed > 0.3 && (
          <Badge variant="outline">{(speed * 3.6).toFixed(1)} km/h</Badge>
        )}
      </div>

      {/* Errors */}
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

      {/* Stats row */}
      <div className="grid gap-3 grid-cols-3">
        <Card>
          <CardContent className="py-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">You Are In</p>
              <p className="text-sm font-medium truncate" data-testid="text-current-section">{currentSection}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-sm font-medium truncate">{targetSection ? targetSection.name : "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Speed</p>
              <p className="text-sm font-medium" data-testid="text-speed">{speed > 0.3 ? `${(speed * 3.6).toFixed(1)} km/h` : "Stationary"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Map Canvas ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> SmartCart Store Floor Plan
          </CardTitle>
          <CardDescription>
            {targetSection
              ? `Showing route to ${targetSection.emoji} ${targetSection.name}. Follow the purple dotted path.`
              : "Click any section below or search a product above to get directions."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border bg-slate-50 shadow-inner">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              data-testid="canvas-store-map"
              style={{ display: "block" }}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section Grid ── */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Quick Navigate — click any section</p>
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
          {STORE_SECTIONS.filter(s => s.id !== "entrance").map(section => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigateTo(section.id)}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              data-testid={`card-section-${section.id}`}
            >
              <Card
                className={`cursor-pointer transition-all text-left ${
                  targetSectionId === section.id ? "ring-2 shadow-md" : ""
                }`}
                style={targetSectionId === section.id ? { ringColor: section.color } : {}}
              >
                <CardContent className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-tight truncate">{section.name}</p>
                      <div className="w-full h-1 rounded-full mt-1" style={{ backgroundColor: section.color + "40" }}>
                        <div className="h-1 rounded-full transition-all" style={{
                          width: targetSectionId === section.id ? "100%" : "0%",
                          backgroundColor: section.color
                        }} />
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

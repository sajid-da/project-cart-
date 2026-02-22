import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ScanBarcode, Camera, ShoppingCart, Sparkles, X, Search, Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScannedProduct {
  source: string;
  product: any;
}

interface AIAnalysis {
  healthScore: number;
  summary: string;
  benefits: string[];
  warnings: string[];
  alternatives: string[];
  funFact: string;
}

export default function ScanPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [manualBarcode, setManualBarcode] = useState("");
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [scanning, setScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const scannerRef = useRef<any>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const lookupBarcode = useMutation({
    mutationFn: async (barcode: string) => {
      const res = await fetch(`/api/barcode/${barcode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Product not found");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setScannedProduct(data);
      setAiAnalysis(null);
      toast({ title: "Product Found!", description: data.product?.name || data.product?.product_name });
    },
    onError: (err: Error) => {
      toast({ title: "Not Found", description: err.message, variant: "destructive" });
    },
  });

  const addToCart = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to Cart!", description: "Product added successfully" });
    },
  });

  const analyzeProduct = useMutation({
    mutationFn: async () => {
      if (!scannedProduct) return;
      const p = scannedProduct.product;
      const res = await fetch("/api/ai/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productName: p.name || p.product_name,
          ingredients: p.description || p.ingredients || "",
          barcode: p.barcode || "",
        }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      return res.json();
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
    },
    onError: () => {
      toast({ title: "AI Analysis Failed", description: "Could not analyze product", variant: "destructive" });
    },
  });

  const startScanner = useCallback(async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch {}
        scannerRef.current = null;
      }

      if (scannerContainerRef.current) {
        scannerContainerRef.current.innerHTML = "";
        const readerDiv = document.createElement("div");
        readerDiv.id = "barcode-reader-element";
        scannerContainerRef.current.appendChild(readerDiv);
      }

      const scanner = new Html5Qrcode("barcode-reader-element");
      scannerRef.current = scanner;
      setScanning(true);

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText: string) => {
          lookupBarcode.mutate(decodedText);
          scanner.stop().catch(() => {});
          scannerRef.current = null;
          setScanning(false);
        },
        () => {}
      );
    } catch (err: any) {
      toast({ title: "Camera Error", description: "Could not access camera. Try entering barcode manually.", variant: "destructive" });
      setScanning(false);
    }
  }, [token]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    if (scannerContainerRef.current) {
      scannerContainerRef.current.innerHTML = "";
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
        scannerRef.current = null;
      }
    };
  }, []);

  const handleManualSearch = () => {
    if (manualBarcode.trim()) {
      lookupBarcode.mutate(manualBarcode.trim());
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-scan-title">
          <ScanBarcode className="w-6 h-6" /> Scan Product
        </h1>
        <p className="text-muted-foreground mt-1">Scan a barcode to find product details, price, and AI-powered insights</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5" /> Camera Scanner
            </CardTitle>
            <CardDescription>Point your camera at a product barcode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              ref={scannerContainerRef}
              className="w-full rounded-lg overflow-hidden bg-muted min-h-[200px]"
              data-testid="barcode-reader"
            />
            {!scanning && (
              <div className="text-center text-muted-foreground py-2">
                <ScanBarcode className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Click "Start Scanning" to use camera</p>
              </div>
            )}
            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startScanner} className="flex-1" data-testid="button-start-scan">
                  <Camera className="w-4 h-4 mr-2" /> Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanner} variant="destructive" className="flex-1" data-testid="button-stop-scan">
                  <X className="w-4 h-4 mr-2" /> Stop
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" /> Manual Entry
            </CardTitle>
            <CardDescription>Enter a barcode number manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter barcode (e.g. 8901063010017)"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                data-testid="input-barcode"
              />
              <Button
                onClick={handleManualSearch}
                disabled={lookupBarcode.isPending || !manualBarcode.trim()}
                data-testid="button-search-barcode"
              >
                {lookupBarcode.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Try sample barcodes:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: "8901063010017", name: "Bananas" },
                  { code: "8901262150019", name: "Amul Milk" },
                  { code: "8901725181109", name: "Basmati Rice" },
                  { code: "8901176013488", name: "Tata Tea" },
                  { code: "8904004400163", name: "Aloo Bhujia" },
                  { code: "8901233020297", name: "Dairy Milk" },
                ].map(({ code, name }) => (
                  <Badge
                    key={code}
                    variant="outline"
                    className="cursor-pointer text-xs"
                    onClick={() => { setManualBarcode(code); lookupBarcode.mutate(code); }}
                    data-testid={`badge-sample-barcode-${code}`}
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {scannedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-primary/30" data-testid="card-scanned-product">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg" data-testid="text-product-name">
                    {scannedProduct.product.name}
                  </CardTitle>
                  <Badge variant={scannedProduct.source === "local" ? "default" : "secondary"} data-testid="badge-product-source">
                    {scannedProduct.source === "local" ? "In Store" : "Open Food Facts"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {scannedProduct.source === "local" ? (
                  <div className="space-y-3">
                    <p className="text-muted-foreground">{scannedProduct.product.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-primary" data-testid="text-product-price">
                        ₹{Number(scannedProduct.product.price).toFixed(2)}
                      </div>
                      <Badge variant="outline">{scannedProduct.product.unit}</Badge>
                      <Badge variant="outline">SKU: {scannedProduct.product.sku}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => addToCart.mutate(scannedProduct.product.id)}
                        disabled={addToCart.isPending}
                        data-testid="button-add-scanned-to-cart"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {addToCart.isPending ? "Adding..." : "Add to Cart"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => analyzeProduct.mutate()}
                        disabled={analyzeProduct.isPending}
                        data-testid="button-ai-analyze"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {analyzeProduct.isPending ? "Analyzing..." : "AI Analysis"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scannedProduct.product.imageUrl && (
                      <img src={scannedProduct.product.imageUrl} alt={scannedProduct.product.name} className="w-24 h-24 object-cover rounded-lg" />
                    )}
                    <p className="text-sm"><span className="font-medium">Brand:</span> {scannedProduct.product.brand || "N/A"}</p>
                    <p className="text-sm"><span className="font-medium">Category:</span> {scannedProduct.product.categories || "N/A"}</p>
                    <p className="text-sm"><span className="font-medium">Quantity:</span> {scannedProduct.product.quantity || "N/A"}</p>
                    {scannedProduct.product.ingredients && (
                      <div>
                        <p className="text-sm font-medium mb-1">Ingredients:</p>
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">{scannedProduct.product.ingredients}</p>
                      </div>
                    )}
                    {scannedProduct.product.nutritionGrade && (
                      <Badge className={`text-sm ${
                        scannedProduct.product.nutritionGrade === "a" ? "bg-green-500" :
                        scannedProduct.product.nutritionGrade === "b" ? "bg-lime-500" :
                        scannedProduct.product.nutritionGrade === "c" ? "bg-yellow-500" :
                        scannedProduct.product.nutritionGrade === "d" ? "bg-orange-500" : "bg-red-500"
                      }`}>
                        Nutri-Score: {scannedProduct.product.nutritionGrade.toUpperCase()}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => analyzeProduct.mutate()}
                      disabled={analyzeProduct.isPending}
                      data-testid="button-ai-analyze-external"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {analyzeProduct.isPending ? "Analyzing..." : "AI Analysis"}
                    </Button>
                    <p className="text-xs text-muted-foreground">This product is not in our store inventory. Data from Open Food Facts database.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analyzeProduct.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-purple-500/30">
              <CardContent className="flex items-center gap-4 py-6">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <div>
                  <p className="font-medium">AI is analyzing this product...</p>
                  <p className="text-sm text-muted-foreground">Checking ingredients, health score, and alternatives</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-purple-500/30" data-testid="card-ai-analysis">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" /> AI Product Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-purple-500" data-testid="text-health-score">{aiAnalysis.healthScore}/10</div>
                  <div>
                    <p className="font-medium">Health Score</p>
                    <p className="text-sm text-muted-foreground">{aiAnalysis.summary}</p>
                  </div>
                </div>

                <Separator />

                {aiAnalysis.benefits?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Benefits
                    </h4>
                    <ul className="space-y-1">
                      {aiAnalysis.benefits.map((b, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span> {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.warnings?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> Warnings
                    </h4>
                    <ul className="space-y-1">
                      {aiAnalysis.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.alternatives?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-500" /> Healthier Alternatives
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.alternatives.map((a, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {aiAnalysis.funFact && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm"><span className="font-medium">Fun Fact:</span> {aiAnalysis.funFact}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

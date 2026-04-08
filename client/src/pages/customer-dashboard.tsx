import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  ShoppingCart,
  Package,
  Receipt,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ScanBarcode,
  Gift,
  MapPin,
  Camera,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  const { user, token } = useAuth();

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/customer"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/customer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: recommendations } = useQuery<any[]>({
    queryKey: ["/api/recommendations"],
    queryFn: async () => {
      const res = await fetch("/api/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: offers } = useQuery<any[]>({
    queryKey: ["/api/offers"],
    queryFn: async () => {
      const res = await fetch("/api/offers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const statCards = [
    {
      title: "Active Cart",
      value: stats?.cartItemCount ?? 0,
      label: "items",
      icon: ShoppingCart,
      color: "text-chart-1",
      href: "/cart",
    },
    {
      title: "Total Orders",
      value: stats?.orderCount ?? 0,
      label: "completed",
      icon: Receipt,
      color: "text-chart-2",
      href: "/orders",
    },
    {
      title: "Total Spent",
      value: `₹${Number(stats?.totalSpent ?? 0).toFixed(0)}`,
      label: "lifetime",
      icon: TrendingUp,
      color: "text-chart-4",
      href: "/orders",
    },
    {
      title: "Products",
      value: stats?.productCount ?? 0,
      label: "available",
      icon: Package,
      color: "text-chart-3",
      href: "/products",
    },
  ];

  const todayOffers = offers?.filter((o: any) => o.isApplicableToday) || [];

  return (
    <div className="relative overflow-hidden min-h-full">
      {/* Real store video background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.09 }}
          data-testid="video-store-bg"
        >
          <source src="/videos/store.mp4" type="video/mp4" />
          <source src="/videos/store2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/75 to-background/90" />
      </div>

      {/* Main content */}
      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-welcome">
              Welcome back, {user?.fullName?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Here's what's happening with your shopping today
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/scan">
              <Button variant="default" data-testid="button-scan-product">
                <Camera className="w-4 h-4 mr-2" /> Scan Product
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" data-testid="button-browse-products">
                Browse Products <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        <Link href="/scan">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 cursor-pointer" data-testid="card-scan-cta">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ScanBarcode className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">Scan a Product Barcode</p>
                  <p className="text-sm text-muted-foreground">Use your camera to scan any product barcode for instant price, details, and AI insights</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </CardContent>
            </Card>
          </motion.div>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="hover-elevate cursor-pointer backdrop-blur-sm bg-card/90">
                  <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
                          {stat.value}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/offers">
            <Card className="hover-elevate cursor-pointer h-full backdrop-blur-sm bg-card/90">
              <CardContent className="flex items-center gap-3 py-5">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Gift className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Today's Offers</p>
                  <p className="text-xs text-muted-foreground">
                    {todayOffers.length > 0 ? `${todayOffers.length} active offer${todayOffers.length > 1 ? "s" : ""} available` : "Check available deals"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/ai-assistant">
            <Card className="hover-elevate cursor-pointer h-full backdrop-blur-sm bg-card/90">
              <CardContent className="flex items-center gap-3 py-5">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">AI Shopping Assistant</p>
                  <p className="text-xs text-muted-foreground">Get personalized recommendations</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/store-map">
            <Card className="hover-elevate cursor-pointer h-full backdrop-blur-sm bg-card/90">
              <CardContent className="flex items-center gap-3 py-5">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Store Map</p>
                  <p className="text-xs text-muted-foreground">Navigate to products in-store</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {recommendations && recommendations.length > 0 && (
          <Card className="backdrop-blur-sm bg-card/90">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-chart-4" />
                <CardTitle className="text-lg">Recommended for You</CardTitle>
              </div>
              <Link href="/products">
                <Button variant="ghost" size="sm" data-testid="link-view-all-products">
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.slice(0, 8).map((product: any) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-2 p-3 rounded-md bg-muted/50 hover-elevate"
                    data-testid={`card-recommendation-${product.id}`}
                  >
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-28 object-cover rounded-md"
                      />
                    )}
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-sm truncate">{product.name}</span>
                      <Badge variant="secondary">₹{Number(product.price).toFixed(0)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

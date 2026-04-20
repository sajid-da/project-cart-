import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Radio,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(210, 85%, 35%)",
  "hsl(180, 70%, 30%)",
  "hsl(280, 65%, 32%)",
  "hsl(30, 80%, 35%)",
  "hsl(150, 75%, 28%)",
];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [pulseId, setPulseId] = useState(0);
  const lastRevenueRef = useRef<number | null>(null);
  const lastOrdersRef = useRef<number | null>(null);
  const [flash, setFlash] = useState<{ revenue: boolean; orders: boolean }>({ revenue: false, orders: false });

  const { data: stats, isLoading, dataUpdatedAt } = useQuery<any>({
    queryKey: ["/api/admin/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!stats) return;
    const rev = Number(stats.totalRevenue ?? 0);
    const ord = Number(stats.totalOrders ?? 0);
    const revChanged = lastRevenueRef.current !== null && rev !== lastRevenueRef.current;
    const ordChanged = lastOrdersRef.current !== null && ord !== lastOrdersRef.current;
    if (revChanged || ordChanged) {
      setFlash({ revenue: revChanged, orders: ordChanged });
      setPulseId((p) => p + 1);
      const t = setTimeout(() => setFlash({ revenue: false, orders: false }), 1500);
      return () => clearTimeout(t);
    }
    lastRevenueRef.current = rev;
    lastOrdersRef.current = ord;
  }, [stats]);

  useEffect(() => {
    if (stats) {
      lastRevenueRef.current = Number(stats.totalRevenue ?? 0);
      lastOrdersRef.current = Number(stats.totalOrders ?? 0);
    }
  }, [pulseId]);

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const statCards = [
    { title: "Total Revenue", value: `₹${Number(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-chart-1", flashing: flash.revenue },
    { title: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-chart-2", flashing: flash.orders },
    { title: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-chart-3", flashing: false },
    { title: "Total Products", value: stats?.totalProducts ?? 0, icon: Package, color: "text-chart-4", flashing: false },
    { title: "Active Carts", value: stats?.activeCarts ?? 0, icon: ShoppingCart, color: "text-chart-5", flashing: false },
    { title: "Fraud Alerts", value: stats?.fraudAlerts ?? 0, icon: AlertTriangle, color: "text-destructive", flashing: false },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time overview of your retail system — auto-refreshing every 3 seconds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5"
            data-testid="badge-live"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <Radio className="w-3 h-3" />
            <span className="font-semibold">LIVE</span>
          </Badge>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground" data-testid="text-last-updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className={`transition-all duration-500 ${stat.flashing ? "ring-2 ring-green-500 shadow-lg shadow-green-500/30 scale-[1.02]" : ""}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {stat.title}
                  {stat.flashing && (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-green-500/40 text-green-600 dark:text-green-400 animate-pulse">
                      NEW
                    </Badge>
                  )}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className={`text-2xl font-bold transition-colors ${stat.flashing ? "text-green-600 dark:text-green-400" : ""}`} data-testid={`text-admin-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
                    {stat.value}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats?.revenueByCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Order Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats?.orderTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(stats?.topProducts || []).map((product: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                      <span className="text-sm font-medium truncate">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{product.sold} sold</Badge>
                      <span className="text-sm font-semibold">₹{Number(product.revenue).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(stats?.recentActivity || []).map((activity: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-chart-1" />
                      <span>{activity.description}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

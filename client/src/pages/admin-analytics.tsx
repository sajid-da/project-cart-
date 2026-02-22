import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = [
  "hsl(210, 85%, 35%)",
  "hsl(180, 70%, 30%)",
  "hsl(280, 65%, 32%)",
  "hsl(30, 80%, 35%)",
  "hsl(150, 75%, 28%)",
];

export default function AdminAnalytics() {
  const { token } = useAuth();

  const { data: analytics, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Comprehensive retail insights and performance metrics
        </p>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales" data-testid="tab-sales">Sales</TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">Customers</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sales Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.salesOverTime || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.paymentMethods || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {(analytics?.paymentMethods || []).map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.customerSegments || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="segment" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
                      <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(analytics?.topCustomers || []).map((c: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">#{i + 1}</span>
                          <span className="font-medium">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{c.orders} orders</Badge>
                          <span className="font-semibold">${Number(c.spent).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.categoryPerformance || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px" }} />
                      <Bar dataKey="sales" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inventory Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(analytics?.inventoryStatus || []).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.stock < item.minStock ? "destructive" : "secondary"}>
                            {item.stock} units
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

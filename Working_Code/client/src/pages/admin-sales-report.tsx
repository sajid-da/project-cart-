import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  IndianRupee,
  ShoppingBag,
  Users,
  TrendingUp,
  Calendar,
  Package,
  Printer,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(210, 85%, 45%)",
  "hsl(150, 70%, 35%)",
  "hsl(30, 80%, 45%)",
  "hsl(280, 65%, 42%)",
  "hsl(180, 70%, 35%)",
  "hsl(0, 70%, 45%)",
  "hsl(60, 70%, 40%)",
  "hsl(330, 65%, 42%)",
  "hsl(120, 60%, 35%)",
  "hsl(240, 60%, 45%)",
];

interface CustomerAnalysis {
  customer: {
    id: number;
    fullName: string;
    username: string;
    email: string;
    phone: string;
  };
  totalOrders: number;
  totalSpent: string;
  avgOrderValue: string;
  totalItemsBought: number;
  topProducts: { product: any; count: number; totalSpent: number }[];
  categoryBreakdown: { name: string; count: number; spent: number }[];
  paymentMethods: Record<string, number>;
  lastOrderDate: string;
  recentOrders: { id: number; total: string; status: string; date: string }[];
}

export default function AdminSalesReport() {
  const { token } = useAuth();
  const [sortBy, setSortBy] = useState("spent");
  const [filterCategory, setFilterCategory] = useState("all");

  const { data: analysis, isLoading } = useQuery<CustomerAnalysis[]>({
    queryKey: ["/api/admin/customer-analysis"],
    queryFn: async () => {
      const res = await fetch("/api/admin/customer-analysis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const totalRevenue = analysis?.reduce((acc, a) => acc + Number(a.totalSpent), 0) || 0;
  const totalOrders = analysis?.reduce((acc, a) => acc + a.totalOrders, 0) || 0;
  const totalItems = analysis?.reduce((acc, a) => acc + a.totalItemsBought, 0) || 0;
  const avgOrderVal = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const allCategories = new Set<string>();
  analysis?.forEach(a => a.categoryBreakdown.forEach(c => allCategories.add(c.name)));

  const categoryTotals: Record<string, number> = {};
  analysis?.forEach(a => {
    a.categoryBreakdown.forEach(c => {
      categoryTotals[c.name] = (categoryTotals[c.name] || 0) + c.spent;
    });
  });
  const categoryChartData = Object.entries(categoryTotals)
    .map(([name, spent]) => ({ name: name.length > 12 ? name.slice(0, 12) + "..." : name, fullName: name, spent: Math.round(spent) }))
    .sort((a, b) => b.spent - a.spent);

  const paymentTotals: Record<string, number> = {};
  analysis?.forEach(a => {
    Object.entries(a.paymentMethods).forEach(([method, count]) => {
      paymentTotals[method] = (paymentTotals[method] || 0) + Number(count);
    });
  });
  const paymentChartData = Object.entries(paymentTotals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const sorted = [...(analysis || [])].sort((a, b) => {
    if (sortBy === "spent") return Number(b.totalSpent) - Number(a.totalSpent);
    if (sortBy === "orders") return b.totalOrders - a.totalOrders;
    if (sortBy === "items") return b.totalItemsBought - a.totalItemsBought;
    return Number(b.avgOrderValue) - Number(a.avgOrderValue);
  });

  const filtered = filterCategory === "all"
    ? sorted
    : sorted.filter(a => a.categoryBreakdown.some(c => c.name === filterCategory));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!analysis) return;
    const headers = ["Customer", "Email", "Phone", "Total Orders", "Total Spent (₹)", "Avg Order (₹)", "Items Bought", "Top Category", "Favourite Product", "Last Order"];
    const rows = sorted.map(a => [
      a.customer.fullName,
      a.customer.email,
      a.customer.phone,
      a.totalOrders,
      Number(a.totalSpent).toFixed(2),
      Number(a.avgOrderValue).toFixed(2),
      a.totalItemsBought,
      a.categoryBreakdown[0]?.name || "N/A",
      a.topProducts[0]?.product?.name || "N/A",
      a.lastOrderDate ? new Date(a.lastOrderDate).toLocaleDateString("en-IN") : "N/A",
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-sales-report-title">
            <FileText className="w-6 h-6" /> Customer Sales Report
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Comprehensive sales analysis by customer with category and payment breakdowns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} data-testid="button-print-report">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={handleDownloadCSV} data-testid="button-download-csv">
            <Download className="w-4 h-4 mr-2" /> Download CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold" data-testid="text-report-revenue">₹{totalRevenue.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold" data-testid="text-report-orders">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <p className="text-xl font-bold" data-testid="text-report-avg">₹{avgOrderVal.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Customers</p>
              <p className="text-xl font-bold" data-testid="text-report-customers">{analysis?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4" /> Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(v: any) => [`₹${v}`, "Revenue"]}
                  />
                  <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentChartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {paymentChartData.map((pm, i) => (
                    <div key={pm.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span>{pm.name}</span>
                      <Badge variant="secondary" className="ml-auto">{pm.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base">Customer Sales Details</CardTitle>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spent">Highest Spent</SelectItem>
                  <SelectItem value="orders">Most Orders</SelectItem>
                  <SelectItem value="items">Most Items</SelectItem>
                  <SelectItem value="avg">Highest Avg</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[170px]" data-testid="select-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.from(allCategories).sort().map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Avg Order</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead>Top Category</TableHead>
                  <TableHead>Favourite Product</TableHead>
                  <TableHead>Payment Pref.</TableHead>
                  <TableHead>Last Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((item, i) => {
                  const topPayment = Object.entries(item.paymentMethods).sort((a, b) => b[1] - a[1])[0];
                  return (
                    <TableRow key={item.customer.id} data-testid={`row-report-${item.customer.id}`}>
                      <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.customer.fullName}</p>
                          <p className="text-xs text-muted-foreground">{item.customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{item.totalOrders}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        ₹{Number(item.totalSpent).toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        ₹{Number(item.avgOrderValue).toFixed(0)}
                      </TableCell>
                      <TableCell className="text-center">{item.totalItemsBought}</TableCell>
                      <TableCell>
                        {item.categoryBreakdown[0] && (
                          <Badge variant="outline" className="text-xs">
                            {item.categoryBreakdown[0].name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.topProducts[0]?.product?.imageUrl && (
                            <img
                              src={item.topProducts[0].product.imageUrl}
                              alt=""
                              className="w-6 h-6 rounded object-cover"
                            />
                          )}
                          <span className="text-xs truncate max-w-[100px]">
                            {item.topProducts[0]?.product?.name || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {topPayment && (
                          <Badge variant="secondary" className="text-xs">
                            {topPayment[0].toUpperCase()}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.lastOrderDate ? new Date(item.lastOrderDate).toLocaleDateString("en-IN") : "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

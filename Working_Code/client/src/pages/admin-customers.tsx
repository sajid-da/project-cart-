import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Users, ShoppingBag, IndianRupee, TrendingUp, Package, CreditCard, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

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

export default function AdminCustomers() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAnalysis | null>(null);

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

  const filtered = analysis?.filter(a =>
    a.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.username.toLowerCase().includes(search.toLowerCase()) ||
    a.customer.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = analysis?.reduce((acc, a) => acc + Number(a.totalSpent), 0) || 0;
  const totalOrders = analysis?.reduce((acc, a) => acc + a.totalOrders, 0) || 0;
  const totalItems = analysis?.reduce((acc, a) => acc + a.totalItemsBought, 0) || 0;

  const categoryColors: Record<string, string> = {
    "Fruits & Vegetables": "bg-green-500",
    "Dairy & Eggs": "bg-blue-500",
    "Grains & Staples": "bg-amber-500",
    "Beverages": "bg-purple-500",
    "Snacks & Namkeen": "bg-red-500",
    "Spices & Masala": "bg-orange-500",
    "Household": "bg-cyan-500",
    "Personal Care": "bg-pink-500",
    "Frozen & Ready to Eat": "bg-indigo-500",
    "Baby & Kids": "bg-teal-500",
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-customer-analysis-title">
          <Users className="w-6 h-6" /> Customer Purchase Analysis
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Detailed insights into customer buying behavior and patterns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Customers</p>
              <p className="text-xl font-bold" data-testid="text-total-customers">{analysis?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <IndianRupee className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold" data-testid="text-total-revenue">₹{totalRevenue.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold" data-testid="text-total-orders">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Items Sold</p>
              <p className="text-xl font-bold" data-testid="text-total-items">{totalItems}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, username, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-search-customers"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                  <TableHead className="text-right">Avg Order</TableHead>
                  <TableHead className="text-center">Items Bought</TableHead>
                  <TableHead>Top Category</TableHead>
                  <TableHead>Favourite Product</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((item, i) => (
                  <TableRow
                    key={item.customer.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCustomer(item)}
                    data-testid={`row-customer-${item.customer.id}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{item.customer.fullName}</p>
                        <p className="text-xs text-muted-foreground">@{item.customer.username}</p>
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
                        <Badge className={`${categoryColors[item.categoryBreakdown[0].name] || "bg-gray-500"} text-white text-xs`}>
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
                        <span className="text-xs truncate max-w-[120px]">
                          {item.topProducts[0]?.product?.name || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {selectedCustomer.customer.fullName}
                </DialogTitle>
                <DialogDescription>
                  @{selectedCustomer.customer.username} | {selectedCustomer.customer.email} | {selectedCustomer.customer.phone}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 md:grid-cols-4">
                <Card>
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold text-green-600" data-testid="text-detail-spent">₹{Number(selectedCustomer.totalSpent).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold">₹{Number(selectedCustomer.avgOrderValue).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Avg Order Value</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="py-3 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.totalItemsBought}</p>
                    <p className="text-xs text-muted-foreground">Items Bought</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="w-4 h-4" /> Top Products Purchased
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedCustomer.topProducts.map((tp, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30" data-testid={`detail-product-${i}`}>
                        {tp.product?.imageUrl ? (
                          <img src={tp.product.imageUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{tp.product?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {tp.count} | Spent: ₹{tp.totalSpent.toFixed(0)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">#{i + 1}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" /> Category Spending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedCustomer.categoryBreakdown.map((cat, i) => {
                      const maxSpent = selectedCustomer.categoryBreakdown[0]?.spent || 1;
                      const percentage = (cat.spent / maxSpent) * 100;
                      return (
                        <div key={i} className="space-y-1" data-testid={`detail-category-${i}`}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-muted-foreground">₹{cat.spent.toFixed(0)} ({cat.count} items)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${categoryColors[cat.name] || "bg-gray-500"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Payment Methods
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedCustomer.paymentMethods).map(([method, count]) => (
                        <Badge key={method} variant="secondary" className="text-sm py-1 px-3">
                          {method.toUpperCase()}: {count} order{Number(count) !== 1 ? "s" : ""}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedCustomer.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30" data-testid={`detail-order-${order.id}`}>
                        <div>
                          <p className="text-sm font-medium">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.date ? new Date(order.date).toLocaleDateString("en-IN") : "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">₹{Number(order.total).toFixed(0)}</p>
                          <Badge variant={order.status === "paid" || order.status === "delivered" ? "default" : "secondary"} className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

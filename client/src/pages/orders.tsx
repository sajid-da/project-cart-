import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: "secondary", icon: Clock },
  completed: { color: "default", icon: CheckCircle },
  cancelled: { color: "destructive", icon: XCircle },
  paid: { color: "default", icon: CheckCircle },
};

export default function OrdersPage() {
  const { token } = useAuth();

  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Receipt className="w-6 h-6" />
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Receipt className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-bold mb-2">No orders yet</h2>
          <p className="text-sm text-muted-foreground">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any, i: number) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card data-testid={`card-order-${order.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Order #{order.id}</span>
                          <Badge variant={cfg.color as any}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" data-testid={`text-order-total-${order.id}`}>
                          ₹{Number(order.total).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tax: ₹{Number(order.tax).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="w-3 h-3 text-muted-foreground" />
                              <span>{item.product?.name || `Product #${item.productId}`}</span>
                              <span className="text-muted-foreground">x{item.quantity}</span>
                            </div>
                            <span className="font-medium">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

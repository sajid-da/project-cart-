import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Receipt, CheckCircle, Clock, XCircle } from "lucide-react";

export default function AdminOrders() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated" });
    },
  });

  const statusIcon = (s: string) => {
    switch (s) {
      case "completed": case "paid": return <CheckCircle className="w-3 h-3" />;
      case "cancelled": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6" />
          Order Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">View and manage all orders</p>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order: any) => (
                  <TableRow key={order.id} data-testid={`row-admin-order-${order.id}`}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.user?.fullName || `User #${order.userId}`}</TableCell>
                    <TableCell>{order.itemCount || 0}</TableCell>
                    <TableCell className="font-semibold">₹{Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "completed" || order.status === "paid" ? "default" : order.status === "cancelled" ? "destructive" : "secondary"}>
                        {statusIcon(order.status)}
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={order.status}
                        onValueChange={(v) => updateStatus.mutate({ orderId: order.id, status: v })}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-order-status-${order.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

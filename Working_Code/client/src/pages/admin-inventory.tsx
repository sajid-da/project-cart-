import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Boxes, AlertTriangle, RefreshCcw, Search } from "lucide-react";
import { useState } from "react";

export default function AdminInventory() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [restockDialog, setRestockDialog] = useState<any>(null);
  const [restockQty, setRestockQty] = useState("");

  const { data: inventory, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/inventory"],
    queryFn: async () => {
      const res = await fetch("/api/admin/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const restockMutation = useMutation({
    mutationFn: async ({ inventoryId, quantity }: { inventoryId: number; quantity: number }) => {
      const res = await fetch(`/api/admin/inventory/${inventoryId}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] });
      setRestockDialog(null);
      setRestockQty("");
      toast({ title: "Inventory restocked" });
    },
  });

  const filtered = inventory?.filter((i: any) =>
    i.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = inventory?.filter((i: any) => i.quantity <= i.minStock).length || 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6" />
            Inventory Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track stock levels and restock alerts</p>
        </div>
        {lowStock > 0 && (
          <Badge variant="destructive" className="text-sm">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {lowStock} low stock items
          </Badge>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-inventory" />
      </div>

      {isLoading ? (
        <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Min / Max</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((item: any) => {
                  const pct = item.maxStock > 0 ? (item.quantity / item.maxStock) * 100 : 0;
                  const isLow = item.quantity <= item.minStock;
                  return (
                    <TableRow key={item.id} data-testid={`row-inventory-${item.id}`}>
                      <TableCell className="font-medium">{item.product?.name || `#${item.productId}`}</TableCell>
                      <TableCell>
                        <span className={isLow ? "text-destructive font-semibold" : ""}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress value={pct} className="h-2" />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.minStock} / {item.maxStock}
                      </TableCell>
                      <TableCell className="text-xs">{item.location || "-"}</TableCell>
                      <TableCell className="text-xs">{item.batchNumber || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => { setRestockDialog(item); setRestockQty(""); }}
                          data-testid={`button-restock-${item.id}`}
                        >
                          <RefreshCcw className="w-3 h-3 mr-1" />
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!restockDialog} onOpenChange={(o) => { if (!o) setRestockDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock: {restockDialog?.product?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Current stock: <span className="font-semibold text-foreground">{restockDialog?.quantity}</span>
            </div>
            <div className="space-y-2">
              <Label>Quantity to add</Label>
              <Input
                type="number"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder="Enter quantity"
                data-testid="input-restock-quantity"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => restockMutation.mutate({
                inventoryId: restockDialog.id,
                quantity: Number(restockQty),
              })}
              disabled={!restockQty || Number(restockQty) <= 0 || restockMutation.isPending}
              data-testid="button-confirm-restock"
            >
              {restockMutation.isPending ? "Restocking..." : "Confirm Restock"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

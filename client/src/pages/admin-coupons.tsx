import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Trash2 } from "lucide-react";

export default function AdminCoupons() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: "", discountType: "percentage", discountValue: "", minPurchase: "", maxUses: "",
  });

  const { data: coupons, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coupons", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setDialogOpen(false);
      setForm({ code: "", discountType: "percentage", discountValue: "", minPurchase: "", maxUses: "" });
      toast({ title: "Coupon created" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] }),
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Coupons
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage discount coupons</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-coupon"><Plus className="w-4 h-4 mr-1" /> Create Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({
              ...form,
              discountValue: form.discountValue,
              minPurchase: form.minPurchase || null,
              maxUses: form.maxUses ? Number(form.maxUses) : null,
            }); }} className="space-y-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="e.g. SAVE10" data-testid="input-coupon-code" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                    <SelectTrigger data-testid="select-discount-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input type="number" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required data-testid="input-discount-value" />
                </div>
                <div className="space-y-2">
                  <Label>Min Purchase</Label>
                  <Input type="number" step="0.01" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} data-testid="input-min-purchase" />
                </div>
                <div className="space-y-2">
                  <Label>Max Uses</Label>
                  <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} data-testid="input-max-uses" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-create-coupon">
                {createMutation.isPending ? "Creating..." : "Create Coupon"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Min Purchase</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons?.map((c: any) => (
                  <TableRow key={c.id} data-testid={`row-coupon-${c.id}`}>
                    <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                    <TableCell><Badge variant="secondary">{c.discountType}</Badge></TableCell>
                    <TableCell>{c.discountType === "percentage" ? `${c.discountValue}%` : `₹${Number(c.discountValue).toFixed(2)}`}</TableCell>
                    <TableCell>{c.minPurchase ? `₹${Number(c.minPurchase).toFixed(2)}` : "-"}</TableCell>
                    <TableCell>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</TableCell>
                    <TableCell>
                      <Switch
                        checked={c.isActive}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: c.id, isActive: checked })}
                        data-testid={`switch-coupon-active-${c.id}`}
                      />
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

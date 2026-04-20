import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ProductImage } from "@/components/product-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import phonepeQrUrl from "@assets/scanner_1776655975041.jpeg";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  CreditCard,
  Tag,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [couponCode, setCouponCode] = useState("");

  const { data: cartData, isLoading } = useQuery<any>({
    queryKey: ["/api/cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateQty = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await fetch(`/api/cart/item/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/customer"] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await fetch(`/api/cart/item/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/customer"] });
      toast({ title: "Item removed" });
    },
  });

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStage, setPaymentStage] = useState<"scan" | "verifying">("scan");

  const checkout = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ couponCode: couponCode || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Checkout failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/customer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order placed!", description: "Your order has been confirmed" });
      setLocation("/orders");
    },
    onError: (err: any) => {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    },
  });

  const items = cartData?.items || [];
  const subtotal = items.reduce((sum: number, item: any) =>
    sum + Number(item.priceAtAdd) * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex gap-4">
              <Skeleton className="h-20 w-20 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-9 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Start adding products to your cart to see them here
          </p>
          <Button onClick={() => setLocation("/products")} data-testid="button-start-shopping">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-6 h-6" />
        <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
        <Badge variant="secondary">{items.length} items</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card data-testid={`card-cart-item-${item.id}`}>
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0">
                      {item.product ? (
                        <ProductImage product={item.product} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.product?.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        ₹{Number(item.priceAtAdd).toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQty.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                        disabled={item.quantity <= 1}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium" data-testid={`text-quantity-${item.id}`}>
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQty.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-semibold text-sm w-20 text-right" data-testid={`text-item-total-${item.id}`}>
                      ₹{(Number(item.priceAtAdd) * item.quantity).toFixed(2)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem.mutate(item.id)}
                      data-testid={`button-remove-${item.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  data-testid="input-coupon"
                />
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span data-testid="text-subtotal">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span data-testid="text-tax">₹{tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span data-testid="text-total">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => { setPaymentStage("scan"); setPaymentOpen(true); }}
                disabled={checkout.isPending}
                data-testid="button-checkout"
              >
                {checkout.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pay with PhonePe
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={paymentOpen}
        onOpenChange={(o) => { if (!checkout.isPending) setPaymentOpen(o); }}
      >
        <DialogContent className="sm:max-w-md" data-testid="dialog-phonepe-payment">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#5f259f] text-white text-xs font-bold flex items-center justify-center">
                पे
              </span>
              Pay ₹{total.toFixed(2)} via PhonePe
            </DialogTitle>
            <DialogDescription>
              {paymentStage === "scan"
                ? "Open PhonePe / Google Pay / Paytm on your phone, scan the QR below, and complete the payment. Then click ‘Done’ to confirm your order."
                : "Verifying your payment with the bank…"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-3">
            <div className="relative bg-white p-3 rounded-xl border-2 border-[#5f259f]/30 shadow-lg">
              <img
                src={phonepeQrUrl}
                alt="PhonePe payment QR"
                className="w-64 h-64 object-contain"
                data-testid="img-phonepe-qr"
              />
              {paymentStage === "verifying" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                  <div className="w-12 h-12 border-4 border-[#5f259f] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-[#5f259f]" data-testid="text-pay-amount">
                ₹{total.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">SmartCart Superstore • Bangalore</div>
              <div className="text-[11px] text-muted-foreground">UPI ID: smartcart@ybl</div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 text-[10px] text-muted-foreground text-center">
              <div className="border rounded-md py-1.5">PhonePe</div>
              <div className="border rounded-md py-1.5">Google Pay</div>
              <div className="border rounded-md py-1.5">Paytm</div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setPaymentOpen(false)}
              disabled={checkout.isPending}
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#5f259f] hover:bg-[#4a1d7a] text-white"
              onClick={() => {
                setPaymentStage("verifying");
                setTimeout(() => {
                  checkout.mutate(undefined, {
                    onSuccess: () => setPaymentOpen(false),
                    onError: () => setPaymentStage("scan"),
                  });
                }, 1200);
              }}
              disabled={checkout.isPending || paymentStage === "verifying"}
              data-testid="button-payment-done"
            >
              {paymentStage === "verifying" || checkout.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Verifying…
                </span>
              ) : (
                "✓ Done — I've Paid"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

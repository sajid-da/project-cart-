import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, ShoppingCart, Plus, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: products, isLoading } = useQuery<any[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const addToCart = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/customer"] });
      toast({ title: "Added to cart", description: "Item added successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filtered = products?.filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || String(p.categoryId) === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Product Catalog</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse and add items to your cart</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-products"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((c: any) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-40 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered?.map((product: any, i: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover-elevate group" data-testid={`card-product-${product.id}`}>
                <CardContent className="p-4">
                  <div className="aspect-square rounded-md bg-muted/50 flex items-center justify-center mb-3 relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground/30" />
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2"
                    >
                      {product.unit}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm truncate" data-testid={`text-product-name-${product.id}`}>
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {product.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-lg font-bold" data-testid={`text-product-price-${product.id}`}>
                        ₹{Number(product.price).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => addToCart.mutate(product.id)}
                        disabled={addToCart.isPending}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

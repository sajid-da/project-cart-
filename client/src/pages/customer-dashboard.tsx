import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  ShoppingCart,
  Package,
  Receipt,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  const { user, token } = useAuth();

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboard/customer"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/customer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: recommendations } = useQuery<any[]>({
    queryKey: ["/api/recommendations"],
    queryFn: async () => {
      const res = await fetch("/api/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const statCards = [
    {
      title: "Active Cart",
      value: stats?.cartItemCount ?? 0,
      label: "items",
      icon: ShoppingCart,
      color: "text-chart-1",
      href: "/cart",
    },
    {
      title: "Total Orders",
      value: stats?.orderCount ?? 0,
      label: "completed",
      icon: Receipt,
      color: "text-chart-2",
      href: "/orders",
    },
    {
      title: "Total Spent",
      value: `$${Number(stats?.totalSpent ?? 0).toFixed(2)}`,
      label: "lifetime",
      icon: TrendingUp,
      color: "text-chart-4",
      href: "/orders",
    },
    {
      title: "Products",
      value: stats?.productCount ?? 0,
      label: "available",
      icon: Package,
      color: "text-chart-3",
      href: "/products",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-welcome">
            Welcome back, {user?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your shopping today
          </p>
        </div>
        <Link href="/products">
          <Button data-testid="button-browse-products">
            Browse Products <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={stat.href}>
              <Card className="hover-elevate cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold" data-testid={`text-stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
                        {stat.value}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-chart-4" />
              <CardTitle className="text-lg">Recommended for You</CardTitle>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" data-testid="link-view-all-products">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.slice(0, 4).map((product: any) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-2 p-3 rounded-md bg-muted/50 hover-elevate"
                  data-testid={`card-recommendation-${product.id}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-sm truncate">{product.name}</span>
                    <Badge variant="secondary">${Number(product.price).toFixed(2)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

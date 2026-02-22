import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, ShoppingCart, Lightbulb, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Recommendation {
  productName: string;
  reason: string;
  priority: string;
  product: any;
}

interface AIRecommendations {
  recommendations: Recommendation[];
  tip: string;
}

export default function AIAssistantPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data, isLoading, refetch, isFetching, error } = useQuery<AIRecommendations>({
    queryKey: ["/api/ai/recommendations"],
    queryFn: async () => {
      const res = await fetch("/api/ai/recommendations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to get recommendations");
      return res.json();
    },
    retry: 1,
    staleTime: 60000,
  });

  const addToCart = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({ title: "Added to Cart!", description: "Product added successfully" });
    },
  });

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-green-500 text-white";
      case "medium": return "bg-blue-500 text-white";
      case "low": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-ai-title">
            <Sparkles className="w-6 h-6 text-purple-500" /> AI Shopping Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Personalized recommendations based on your shopping history</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-recommendations"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {(isLoading || isFetching) && (
        <Card className="border-purple-500/30 bg-purple-500/5">
          <CardContent className="flex items-center gap-4 py-8">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin flex-shrink-0" />
            <div>
              <p className="font-medium text-lg">AI is thinking...</p>
              <p className="text-sm text-muted-foreground">Analyzing your shopping patterns and finding the best deals. This may take a few seconds.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && !isFetching && (
        <Card className="border-destructive/30">
          <CardContent className="text-center py-8">
            <p className="text-lg font-medium text-destructive">Could not load recommendations</p>
            <p className="text-muted-foreground mt-1">Please try refreshing</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()} data-testid="button-retry-recommendations">
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isFetching && data?.tip && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardContent className="flex items-start gap-3 py-4">
              <Lightbulb className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">AI Shopping Tip</p>
                <p className="text-sm text-muted-foreground" data-testid="text-ai-tip">{data.tip}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!isLoading && !isFetching && data?.recommendations && data.recommendations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.recommendations.map((rec, index) => (
            <motion.div
              key={rec.productName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full" data-testid={`card-recommendation-${index}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base" data-testid={`text-rec-name-${index}`}>{rec.product?.name || rec.productName}</CardTitle>
                    <Badge className={priorityColor(rec.priority)} data-testid={`badge-priority-${index}`}>{rec.priority}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground" data-testid={`text-rec-reason-${index}`}>{rec.reason}</p>
                  {rec.product && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary" data-testid={`text-rec-price-${index}`}>₹{Number(rec.product.price).toFixed(2)}</span>
                        <Badge variant="outline" className="text-xs">{rec.product.unit}</Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToCart.mutate(rec.product.id)}
                        disabled={addToCart.isPending}
                        data-testid={`button-add-rec-${index}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        Add
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && !isFetching && !error && (!data?.recommendations || data.recommendations.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No recommendations yet</p>
            <p className="text-muted-foreground">Start shopping and we'll learn your preferences!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

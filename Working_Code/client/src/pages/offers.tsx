import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Calendar, Tag, Clock, Percent, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

export default function OffersPage() {
  const { token } = useAuth();

  const { data: offers, isLoading } = useQuery<any[]>({
    queryKey: ["/api/offers"],
    queryFn: async () => {
      const res = await fetch("/api/offers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  const todayOffers = offers?.filter((o: any) => o.isApplicableToday) || [];
  const upcomingOffers = offers?.filter((o: any) => !o.isApplicableToday) || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-offers-title">
          <Gift className="w-6 h-6" /> Offers & Deals
        </h1>
        <p className="text-muted-foreground mt-1">
          Today is <span className="font-medium text-foreground">{today}</span> — check out the best deals!
        </p>
      </div>

      {todayOffers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" /> Active Today
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {todayOffers.map((offer: any, index: number) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-green-500/30 bg-green-500/5 overflow-hidden" data-testid={`card-offer-${offer.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{offer.name}</CardTitle>
                      <Badge className="bg-green-500 text-white">Active Now</Badge>
                    </div>
                    <CardDescription>{offer.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      {offer.discountType === "percentage" ? (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <Percent className="w-5 h-5" />
                          <span className="text-xl font-bold">{Number(offer.discountValue)}% OFF</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <IndianRupee className="w-5 h-5" />
                          <span className="text-xl font-bold">₹{Number(offer.discountValue)} OFF</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {offer.category && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" /> {offer.category.name}
                        </Badge>
                      )}
                      {offer.applicableDays?.map((day: string) => (
                        <Badge key={day} variant="secondary" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" /> {day}
                        </Badge>
                      ))}
                      {offer.minPurchase && (
                        <Badge variant="outline" className="text-xs">
                          Min: ₹{Number(offer.minPurchase)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {upcomingOffers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Coming Up
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingOffers.map((offer: any, index: number) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="opacity-80" data-testid={`card-upcoming-offer-${offer.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{offer.name}</CardTitle>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                    <CardDescription>{offer.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      {offer.discountType === "percentage" ? (
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <Percent className="w-5 h-5" />
                          <span className="text-xl font-bold">{Number(offer.discountValue)}% OFF</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <IndianRupee className="w-5 h-5" />
                          <span className="text-xl font-bold">₹{Number(offer.discountValue)} OFF</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {offer.category && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" /> {offer.category.name}
                        </Badge>
                      )}
                      {offer.applicableDays?.map((day: string) => (
                        <Badge key={day} variant="secondary" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" /> {day}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {(!offers || offers.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No offers available right now</p>
            <p className="text-muted-foreground">Check back on weekends for special deals!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

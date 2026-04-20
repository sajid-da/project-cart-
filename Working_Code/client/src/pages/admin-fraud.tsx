import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Shield, AlertTriangle, AlertOctagon, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminFraud() {
  const { token } = useAuth();

  const { data: fraudLogs, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/fraud-logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/fraud-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { label: "Critical", variant: "destructive" as const, icon: AlertOctagon };
    if (score >= 50) return { label: "High", variant: "destructive" as const, icon: AlertTriangle };
    if (score >= 25) return { label: "Medium", variant: "secondary" as const, icon: AlertTriangle };
    return { label: "Low", variant: "secondary" as const, icon: CheckCircle };
  };

  const stats = {
    total: fraudLogs?.length || 0,
    critical: fraudLogs?.filter((l: any) => Number(l.riskScore) >= 75).length || 0,
    high: fraudLogs?.filter((l: any) => Number(l.riskScore) >= 50 && Number(l.riskScore) < 75).length || 0,
    resolved: fraudLogs?.filter((l: any) => l.action === "resolved").length || 0,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Fraud Detection Monitor
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI-powered fraud detection and monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { title: "Total Alerts", value: stats.total, color: "text-chart-1" },
          { title: "Critical", value: stats.critical, color: "text-destructive" },
          { title: "High Risk", value: stats.high, color: "text-chart-4" },
          { title: "Resolved", value: stats.resolved, color: "text-chart-5" },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardHeader className="pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-8 w-12" /> : (
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {isLoading ? (
        <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
      ) : fraudLogs?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Shield className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium">No fraud alerts</h3>
          <p className="text-sm text-muted-foreground">The system is monitoring for suspicious activity</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fraudLogs?.map((log: any) => {
                  const risk = getRiskLevel(Number(log.riskScore));
                  const RiskIcon = risk.icon;
                  return (
                    <TableRow key={log.id} data-testid={`row-fraud-${log.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Number(log.riskScore)} className="w-16 h-2" />
                          <span className="text-sm font-mono">{Number(log.riskScore).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={risk.variant}>
                          <RiskIcon className="w-3 h-3 mr-1" />
                          {risk.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.user?.fullName || `#${log.userId}`}</TableCell>
                      <TableCell>{log.orderId ? `#${log.orderId}` : "-"}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{log.reason}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

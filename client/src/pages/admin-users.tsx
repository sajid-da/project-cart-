import { useAuth } from "@/lib/auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, User } from "lucide-react";

export default function AdminUsers() {
  const { token } = useAuth();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User role updated" });
    },
  });

  const roleColor = (role: string) => {
    switch (role) {
      case "admin": return "default";
      case "manager": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Management
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage users and their roles</p>
      </div>

      {isLoading ? (
        <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: any) => {
                  const initials = user.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                  return (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={roleColor(user.role) as any}>
                          {user.role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Locked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={user.role}
                          onValueChange={(v) => updateRole.mutate({ userId: user.id, role: v })}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-user-role-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
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

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import {
  ShoppingCart,
  Package,
  LayoutDashboard,
  BarChart3,
  Boxes,
  Shield,
  Tag,
  Users,
  LogOut,
  Store,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const customerItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
  { title: "My Cart", url: "/cart", icon: ShoppingCart },
  { title: "My Orders", url: "/orders", icon: Receipt },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Inventory", url: "/admin/inventory", icon: Boxes },
  { title: "Orders", url: "/admin/orders", icon: Receipt },
  { title: "Coupons", url: "/admin/coupons", icon: Tag },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Fraud Monitor", url: "/admin/fraud", icon: Shield },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const isAdmin = user?.role === "admin" || user?.role === "manager";
  const items = isAdmin ? adminItems : customerItems;

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href={isAdmin ? "/admin" : "/"}>
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">SmartCart</h2>
              <p className="text-xs text-muted-foreground">Retail System</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isAdmin ? "Administration" : "Shopping"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    className="data-[active=true]:bg-sidebar-accent"
                  >
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Customer View</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {customerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={location === item.url}
                      className="data-[active=true]:bg-sidebar-accent"
                    >
                      <Link href={item.url} data-testid={`link-customer-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <Badge variant="secondary" className="text-[10px]">
              {user?.role}
            </Badge>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import CustomerDashboard from "@/pages/customer-dashboard";
import ProductsPage from "@/pages/products";
import CartPage from "@/pages/cart";
import OrdersPage from "@/pages/orders";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminProducts from "@/pages/admin-products";
import AdminInventory from "@/pages/admin-inventory";
import AdminOrders from "@/pages/admin-orders";
import AdminCoupons from "@/pages/admin-coupons";
import AdminUsers from "@/pages/admin-users";
import AdminFraud from "@/pages/admin-fraud";
import { ScrollArea } from "@/components/ui/scroll-area";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-1 p-2 border-b h-12 flex-shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <ScrollArea className="flex-1">
            {children}
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  if (user?.role !== "admin" && user?.role !== "manager") {
    return <Redirect to="/" />;
  }
  return <Component />;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={CustomerDashboard} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
        <Route path="/admin/analytics">{() => <AdminRoute component={AdminAnalytics} />}</Route>
        <Route path="/admin/products">{() => <AdminRoute component={AdminProducts} />}</Route>
        <Route path="/admin/inventory">{() => <AdminRoute component={AdminInventory} />}</Route>
        <Route path="/admin/orders">{() => <AdminRoute component={AdminOrders} />}</Route>
        <Route path="/admin/coupons">{() => <AdminRoute component={AdminCoupons} />}</Route>
        <Route path="/admin/users">{() => <AdminRoute component={AdminUsers} />}</Route>
        <Route path="/admin/fraud">{() => <AdminRoute component={AdminFraud} />}</Route>
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

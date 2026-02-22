import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Store, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { username: form.username, password: form.password }
        : form;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      login(data.token, data.user);
      toast({ title: isLogin ? "Welcome back!" : "Account created!", description: `Logged in as ${data.user.fullName}` });
      
      if (data.user.role === "admin" || data.user.role === "manager") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:flex-1 bg-primary relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        <div className="relative z-10 max-w-lg text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-md bg-primary-foreground/20 backdrop-blur-sm">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">SmartCart</h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Intelligent Retail Cart System
          </h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed mb-8">
            Experience the future of retail with AI-powered recommendations,
            real-time billing, secure payments, and comprehensive inventory management.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              "Smart Scanning",
              "AI Recommendations",
              "Real-time Billing",
              "Fraud Detection",
              "Inventory Tracking",
              "Analytics Dashboard",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/50" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">SmartCart</h1>
          </div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">
                {isLogin ? "Sign in" : "Create account"}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Enter your credentials to access the system"
                  : "Fill in the details to create your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required={!isLogin}
                      data-testid="input-fullname"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    data-testid="input-username"
                  />
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required={!isLogin}
                        data-testid="input-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        placeholder="+1 234 567 890"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        data-testid="input-phone"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      data-testid="input-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading} data-testid="button-submit-auth">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isLogin ? "Sign in" : "Create account"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:underline"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setForm({ username: "", email: "", password: "", fullName: "", phone: "" });
                  }}
                  data-testid="button-toggle-auth-mode"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

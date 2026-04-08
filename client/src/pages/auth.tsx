import { useState, lazy, Suspense, Component, type ErrorInfo, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Eye, EyeOff, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

const CartScene = lazy(() => import("@/components/cart-scene"));

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_: Error, __: ErrorInfo) {}
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function CartFallback({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full cursor-pointer select-none"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-36 h-36 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6 shadow-2xl"
      >
        <ShoppingCart className="w-20 h-20 text-white" strokeWidth={1.2} />
      </motion.div>
    </motion.div>
  );
}

function LeftPanel({ onCartClick }: { onCartClick: () => void }) {
  return (
    <div className="hidden lg:flex lg:flex-1 relative items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(165,180,252,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(165,180,252,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top text */}
      <div className="absolute top-10 left-0 right-0 text-center z-10 px-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase mb-2">Welcome to</p>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">SmartCart</h1>
          <p className="text-indigo-200/80 text-base font-medium">Revolutionizing Retail Experience</p>
        </motion.div>
      </div>

      {/* 3D scene or fallback */}
      <div className="absolute inset-0 w-full h-full">
        <SceneErrorBoundary fallback={
          <div className="w-full h-full flex items-center justify-center">
            <CartFallback onClick={onCartClick} />
          </div>
        }>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-2 border-indigo-300/40 border-t-indigo-300 rounded-full"
              />
            </div>
          }>
            <CartScene onCartClick={onCartClick} />
          </Suspense>
        </SceneErrorBoundary>
      </div>

      {/* Click hint */}
      <motion.div
        className="absolute bottom-14 left-0 right-0 text-center z-10 pointer-events-none"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <p className="text-indigo-300/80 text-sm">🛒 Click the cart to begin</p>
      </motion.div>

      {/* Feature chips */}
      <div className="absolute bottom-5 left-0 right-0 flex flex-wrap justify-center gap-2 px-8 z-10 pointer-events-none">
        {["Smart Scanning", "AI Recommendations", "Live Billing", "Fraud Detection"].map((f) => (
          <span
            key={f}
            className="px-3 py-1 text-xs font-medium bg-white/10 text-indigo-200 rounded-full border border-white/10 backdrop-blur-sm"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

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

  const handleCartClick = () => {
    document.getElementById("username-input")?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { username: form.username, password: form.password } : form;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");
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
      <LeftPanel onCartClick={handleCartClick} />

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
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
                      placeholder="Priya Sharma"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required={!isLogin}
                      data-testid="input-fullname"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username-input">Username</Label>
                  <Input
                    id="username-input"
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
                        placeholder="priya@example.com"
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
                        placeholder="+91 98765 43210"
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-submit-auth"
                >
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
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authMiddleware, adminMiddleware, generateToken, hashPassword, comparePassword, type AuthRequest } from "./auth";
import { loginSchema, registerSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
        role: "customer",
        isActive: true,
      });

      const token = generateToken({ id: user.id, role: user.role });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        return res.status(423).json({ message: "Account temporarily locked. Try again later." });
      }

      const valid = await comparePassword(data.password, user.password);
      if (!valid) {
        const attempts = user.failedAttempts + 1;
        const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await storage.updateUserFailedAttempts(user.id, attempts, lockedUntil);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await storage.updateUserFailedAttempts(user.id, 0, null);
      const token = generateToken({ id: user.id, role: user.role });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Login failed" });
    }
  });

  // Categories
  app.get("/api/categories", authMiddleware as any, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // Products
  app.get("/api/products", authMiddleware as any, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Cart routes
  app.get("/api/cart", authMiddleware as any, async (req: AuthRequest, res) => {
    let cart = await storage.getActiveCart(req.userId!);
    if (!cart) {
      cart = await storage.createCart({ userId: req.userId!, status: "active" });
    }
    const items = await storage.getCartItems(cart.id);
    res.json({ cart, items });
  });

  app.post("/api/cart/add", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const product = await storage.getProduct(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const inv = await storage.getInventoryByProduct(productId);
      if (inv && inv.quantity < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      let cart = await storage.getActiveCart(req.userId!);
      if (!cart) {
        cart = await storage.createCart({ userId: req.userId!, status: "active" });
      }

      const item = await storage.addCartItem({
        cartId: cart.id,
        productId,
        quantity,
        priceAtAdd: product.price,
      });

      await storage.createActivityLog({
        userId: req.userId,
        action: `Added ${product.name} to cart`,
        resource: "cart",
      });

      res.json(item);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/cart/item/:id", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { quantity } = req.body;
      await storage.updateCartItemQuantity(Number(req.params.id), quantity);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/cart/item/:id", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      await storage.removeCartItem(Number(req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Checkout
  app.post("/api/checkout", authMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { couponCode } = req.body;
      const cart = await storage.getActiveCart(req.userId!);
      if (!cart) return res.status(400).json({ message: "No active cart" });

      const items = await storage.getCartItems(cart.id);
      if (items.length === 0) return res.status(400).json({ message: "Cart is empty" });

      let subtotal = items.reduce((sum: number, item: any) =>
        sum + Number(item.priceAtAdd) * item.quantity, 0);

      let discount = 0;
      let couponId = null;

      if (couponCode) {
        const coupon = await storage.getCouponByCode(couponCode);
        if (!coupon || !coupon.isActive) {
          return res.status(400).json({ message: "Invalid coupon code" });
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return res.status(400).json({ message: "Coupon usage limit reached" });
        }
        if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
          return res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchase} required` });
        }

        if (coupon.discountType === "percentage") {
          discount = subtotal * (Number(coupon.discountValue) / 100);
        } else {
          discount = Number(coupon.discountValue);
        }
        couponId = coupon.id;
        await storage.incrementCouponUsage(coupon.id);
      }

      const tax = (subtotal - discount) * 0.08;
      const total = subtotal - discount + tax;

      // Fraud check
      const riskScore = calculateFraudRisk(subtotal, items.length, req.userId!);
      if (riskScore >= 75) {
        await storage.createFraudLog({
          userId: req.userId,
          riskScore: String(riskScore),
          reason: "High risk transaction detected",
          action: "blocked",
          details: { subtotal, itemCount: items.length },
        });
        return res.status(400).json({ message: "Transaction flagged for review. Please contact support." });
      }
      if (riskScore >= 40) {
        await storage.createFraudLog({
          userId: req.userId,
          riskScore: String(riskScore),
          reason: "Elevated risk transaction",
          action: "flagged",
          details: { subtotal, itemCount: items.length },
        });
      }

      const order = await storage.createOrder({
        userId: req.userId!,
        subtotal: String(subtotal),
        tax: String(tax),
        discount: String(discount),
        total: String(total),
        status: "paid",
        couponId,
      });

      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.priceAtAdd,
        });

        const inv = await storage.getInventoryByProduct(item.productId);
        if (inv) {
          await storage.updateInventoryQuantity(inv.id, Math.max(0, inv.quantity - item.quantity));
        }
      }

      await storage.createPayment({
        orderId: order.id,
        amount: String(total),
        method: "card",
        status: "completed",
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      });

      await storage.clearCart(cart.id);

      await storage.createActivityLog({
        userId: req.userId,
        action: `Order #${order.id} placed for $${total.toFixed(2)}`,
        resource: "order",
      });

      res.json({ order, message: "Order placed successfully" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Orders
  app.get("/api/orders", authMiddleware as any, async (req: AuthRequest, res) => {
    const orders = await storage.getUserOrders(req.userId!);
    res.json(orders);
  });

  // Dashboard
  app.get("/api/dashboard/customer", authMiddleware as any, async (req: AuthRequest, res) => {
    const stats = await storage.getCustomerDashboardStats(req.userId!);
    res.json(stats);
  });

  // Recommendations
  app.get("/api/recommendations", authMiddleware as any, async (req: AuthRequest, res) => {
    const recs = await storage.getRecommendations(req.userId!);
    res.json(recs);
  });

  // Admin routes
  app.get("/api/admin/dashboard", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const stats = await storage.getAdminDashboardStats();
    res.json(stats);
  });

  app.get("/api/admin/analytics", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const data = await storage.getAnalyticsData();
    res.json(data);
  });

  app.post("/api/admin/products", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      await storage.createInventory({
        productId: product.id,
        quantity: 100,
        minStock: 10,
        maxStock: 1000,
        location: "Warehouse A",
      });
      res.json(product);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/admin/products/:id", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    try {
      const product = await storage.updateProduct(Number(req.params.id), req.body);
      res.json(product);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/admin/products/:id", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.json({ success: true });
  });

  app.get("/api/admin/inventory", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const inv = await storage.getInventory();
    res.json(inv);
  });

  app.post("/api/admin/inventory/:id/restock", authMiddleware as any, adminMiddleware as any, async (req: AuthRequest, res) => {
    try {
      const { quantity } = req.body;
      await storage.restockInventory(Number(req.params.id), quantity);
      await storage.createActivityLog({
        userId: req.userId,
        action: `Restocked inventory #${req.params.id} with ${quantity} units`,
        resource: "inventory",
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/admin/orders", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const orders = await storage.getAllOrders();
    res.json(orders);
  });

  app.patch("/api/admin/orders/:id/status", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const { status } = req.body;
    await storage.updateOrderStatus(Number(req.params.id), status);
    res.json({ success: true });
  });

  app.get("/api/admin/coupons", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const coupons = await storage.getCoupons();
    res.json(coupons);
  });

  app.post("/api/admin/coupons", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    try {
      const coupon = await storage.createCoupon(req.body);
      res.json(coupon);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/admin/coupons/:id", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    await storage.updateCoupon(Number(req.params.id), req.body);
    res.json({ success: true });
  });

  app.get("/api/admin/users", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...u }) => u);
    res.json(usersWithoutPasswords);
  });

  app.patch("/api/admin/users/:id/role", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const { role } = req.body;
    const user = await storage.updateUserRole(Number(req.params.id), role);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  app.get("/api/admin/fraud-logs", authMiddleware as any, adminMiddleware as any, async (req, res) => {
    const logs = await storage.getFraudLogs();
    res.json(logs);
  });

  return httpServer;
}

function calculateFraudRisk(amount: number, itemCount: number, userId: number): number {
  let risk = 0;

  if (amount > 500) risk += 20;
  if (amount > 1000) risk += 15;
  if (amount > 2000) risk += 20;

  if (itemCount > 10) risk += 10;
  if (itemCount > 20) risk += 15;

  risk += Math.random() * 10;

  return Math.min(100, Math.round(risk));
}

import { db } from "./db";
import { eq, desc, sql, and, count, sum, lt, gt, gte, lte } from "drizzle-orm";
import {
  users, categories, products, inventory, carts, cartItems,
  orders, orderItems, payments, coupons, fraudLogs, activityLogs, offers,
  type User, type InsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type Inventory, type InsertInventory,
  type Cart, type InsertCart, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Payment, type InsertPayment, type Coupon, type InsertCoupon,
  type FraudLog, type InsertFraudLog, type ActivityLog, type InsertActivityLog,
  type Offer, type InsertOffer,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  updateUserFailedAttempts(id: number, attempts: number, lockedUntil?: Date | null): Promise<void>;

  getCategories(): Promise<Category[]>;
  createCategory(cat: InsertCategory): Promise<Category>;

  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getInventory(): Promise<any[]>;
  getInventoryByProduct(productId: number): Promise<Inventory | undefined>;
  createInventory(inv: InsertInventory): Promise<Inventory>;
  updateInventoryQuantity(id: number, quantity: number): Promise<void>;
  restockInventory(id: number, quantity: number): Promise<void>;

  getActiveCart(userId: number): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  getCartItems(cartId: number): Promise<any[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<void>;
  removeCartItem(id: number): Promise<void>;
  clearCart(cartId: number): Promise<void>;

  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getUserOrders(userId: number): Promise<any[]>;
  getAllOrders(): Promise<any[]>;
  updateOrderStatus(id: number, status: string): Promise<void>;

  createPayment(payment: InsertPayment): Promise<Payment>;

  getCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, data: Partial<Coupon>): Promise<void>;
  incrementCouponUsage(id: number): Promise<void>;

  createFraudLog(log: InsertFraudLog): Promise<FraudLog>;
  getFraudLogs(): Promise<any[]>;

  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  getAdminDashboardStats(): Promise<any>;
  getAnalyticsData(): Promise<any>;
  getCustomerDashboardStats(userId: number): Promise<any>;
  getRecommendations(userId: number): Promise<Product[]>;

  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  getOffers(): Promise<Offer[]>;
  getActiveOffers(): Promise<any[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.id));
  }

  async updateUserRole(id: number, role: string) {
    const [updated] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
    return updated;
  }

  async updateUserFailedAttempts(id: number, attempts: number, lockedUntil?: Date | null) {
    await db.update(users).set({ failedAttempts: attempts, lockedUntil }).where(eq(users.id, id));
  }

  async getCategories() {
    return db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(cat: InsertCategory) {
    const [created] = await db.insert(categories).values(cat).returning();
    return created;
  }

  async getProducts() {
    return db.select().from(products).where(eq(products.isActive, true)).orderBy(products.name);
  }

  async getProduct(id: number) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct) {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>) {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number) {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async getInventory() {
    const result = await db.select().from(inventory).orderBy(inventory.id);
    const enriched = [];
    for (const inv of result) {
      const [product] = await db.select().from(products).where(eq(products.id, inv.productId));
      enriched.push({ ...inv, product });
    }
    return enriched;
  }

  async getInventoryByProduct(productId: number) {
    const [inv] = await db.select().from(inventory).where(eq(inventory.productId, productId));
    return inv;
  }

  async createInventory(inv: InsertInventory) {
    const [created] = await db.insert(inventory).values(inv).returning();
    return created;
  }

  async updateInventoryQuantity(id: number, quantity: number) {
    await db.update(inventory).set({ quantity }).where(eq(inventory.id, id));
  }

  async restockInventory(id: number, addQty: number) {
    await db.update(inventory).set({
      quantity: sql`${inventory.quantity} + ${addQty}`,
      lastRestocked: new Date(),
    }).where(eq(inventory.id, id));
  }

  async getActiveCart(userId: number) {
    const [cart] = await db.select().from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")));
    return cart;
  }

  async createCart(cart: InsertCart) {
    const [created] = await db.insert(carts).values(cart).returning();
    return created;
  }

  async getCartItems(cartId: number) {
    const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
    const enriched = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      enriched.push({ ...item, product });
    }
    return enriched;
  }

  async addCartItem(item: InsertCartItem) {
    const existing = await db.select().from(cartItems)
      .where(and(eq(cartItems.cartId, item.cartId), eq(cartItems.productId, item.productId)));
    if (existing.length > 0) {
      await db.update(cartItems).set({
        quantity: sql`${cartItems.quantity} + ${item.quantity}`,
      }).where(eq(cartItems.id, existing[0].id));
      const [updated] = await db.select().from(cartItems).where(eq(cartItems.id, existing[0].id));
      return updated;
    }
    const [created] = await db.insert(cartItems).values(item).returning();
    return created;
  }

  async updateCartItemQuantity(id: number, quantity: number) {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }

  async removeCartItem(id: number) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(cartId: number) {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
    await db.update(carts).set({ status: "checked_out" }).where(eq(carts.id, cartId));
  }

  async createOrder(order: InsertOrder) {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async createOrderItem(item: InsertOrderItem) {
    const [created] = await db.insert(orderItems).values(item).returning();
    return created;
  }

  async getUserOrders(userId: number) {
    const userOrders = await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
    const enriched = [];
    for (const order of userOrders) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      const itemsWithProducts = [];
      for (const item of items) {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        itemsWithProducts.push({ ...item, product });
      }
      enriched.push({ ...order, items: itemsWithProducts });
    }
    return enriched;
  }

  async getAllOrders() {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const enriched = [];
    for (const order of allOrders) {
      const [user] = await db.select().from(users).where(eq(users.id, order.userId));
      const itemCount = await db.select({ count: count() }).from(orderItems).where(eq(orderItems.orderId, order.id));
      enriched.push({ ...order, user: user ? { fullName: user.fullName } : null, itemCount: itemCount[0]?.count || 0 });
    }
    return enriched;
  }

  async updateOrderStatus(id: number, status: string) {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
  }

  async createPayment(payment: InsertPayment) {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  async getCoupons() {
    return db.select().from(coupons).orderBy(desc(coupons.id));
  }

  async getCouponByCode(code: string) {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon) {
    const [created] = await db.insert(coupons).values(coupon).returning();
    return created;
  }

  async updateCoupon(id: number, data: Partial<Coupon>) {
    await db.update(coupons).set(data).where(eq(coupons.id, id));
  }

  async incrementCouponUsage(id: number) {
    await db.update(coupons).set({
      usedCount: sql`${coupons.usedCount} + 1`,
    }).where(eq(coupons.id, id));
  }

  async createFraudLog(log: InsertFraudLog) {
    const [created] = await db.insert(fraudLogs).values(log).returning();
    return created;
  }

  async getFraudLogs() {
    const logs = await db.select().from(fraudLogs).orderBy(desc(fraudLogs.createdAt));
    const enriched = [];
    for (const log of logs) {
      let user = null;
      if (log.userId) {
        const [u] = await db.select().from(users).where(eq(users.id, log.userId));
        user = u ? { fullName: u.fullName } : null;
      }
      enriched.push({ ...log, user });
    }
    return enriched;
  }

  async createActivityLog(log: InsertActivityLog) {
    const [created] = await db.insert(activityLogs).values(log).returning();
    return created;
  }

  async getAdminDashboardStats() {
    const [revenueResult] = await db.select({ total: sum(orders.total) }).from(orders).where(eq(orders.status, "paid"));
    const [orderCount] = await db.select({ count: count() }).from(orders);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [productCount] = await db.select({ count: count() }).from(products).where(eq(products.isActive, true));
    const [activeCartCount] = await db.select({ count: count() }).from(carts).where(eq(carts.status, "active"));
    const [fraudCount] = await db.select({ count: count() }).from(fraudLogs);

    const allCategories = await db.select().from(categories);
    const revenueByCategory = [];
    for (const cat of allCategories) {
      const catProducts = await db.select().from(products).where(eq(products.categoryId, cat.id));
      let revenue = 0;
      for (const p of catProducts) {
        const [r] = await db.select({ total: sum(sql`${orderItems.price} * ${orderItems.quantity}`) })
          .from(orderItems).where(eq(orderItems.productId, p.id));
        revenue += Number(r?.total || 0);
      }
      revenueByCategory.push({ name: cat.name, revenue: Math.round(revenue * 100) / 100 });
    }

    const topProductsData = await db.select({
      productId: orderItems.productId,
      sold: sum(orderItems.quantity),
      revenue: sum(sql`${orderItems.price} * ${orderItems.quantity}`),
    }).from(orderItems).groupBy(orderItems.productId).orderBy(desc(sum(sql`${orderItems.price} * ${orderItems.quantity}`))).limit(5);

    const topProducts = [];
    for (const tp of topProductsData) {
      const [product] = await db.select().from(products).where(eq(products.id, tp.productId));
      topProducts.push({ name: product?.name || "Unknown", sold: Number(tp.sold), revenue: Number(tp.revenue) });
    }

    const recentLogs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(10);
    const recentActivity = recentLogs.map(l => ({
      description: l.action,
      time: l.createdAt ? new Date(l.createdAt).toLocaleTimeString() : "now",
    }));

    return {
      totalRevenue: revenueResult?.total || 0,
      totalOrders: orderCount?.count || 0,
      totalUsers: userCount?.count || 0,
      totalProducts: productCount?.count || 0,
      activeCarts: activeCartCount?.count || 0,
      fraudAlerts: fraudCount?.count || 0,
      revenueByCategory,
      topProducts,
      orderTrends: this.generateTrendData(),
      recentActivity,
    };
  }

  async getAnalyticsData() {
    const salesOverTime = this.generateTrendData().map(d => ({ ...d, sales: d.orders * (50 + Math.random() * 100) }));
    const paymentMethods = [
      { name: "Card", value: 45 },
      { name: "UPI", value: 30 },
      { name: "Wallet", value: 15 },
      { name: "Net Banking", value: 10 },
    ];
    const customerSegments = [
      { segment: "New", count: 25 },
      { segment: "Regular", count: 40 },
      { segment: "VIP", count: 15 },
      { segment: "Inactive", count: 20 },
    ];

    const allUsers = await db.select().from(users).where(eq(users.role, "customer")).limit(5);
    const topCustomers = [];
    for (const u of allUsers) {
      const [orderData] = await db.select({ count: count(), spent: sum(orders.total) })
        .from(orders).where(eq(orders.userId, u.id));
      topCustomers.push({ name: u.fullName, orders: Number(orderData?.count || 0), spent: Number(orderData?.spent || 0) });
    }

    const allCats = await db.select().from(categories);
    const categoryPerformance = allCats.map(c => ({
      name: c.name,
      sales: Math.floor(Math.random() * 100 + 20),
    }));

    const inv = await this.getInventory();
    const inventoryStatus = inv.slice(0, 8).map(i => ({
      name: i.product?.name || "Unknown",
      stock: i.quantity,
      minStock: i.minStock,
    }));

    return { salesOverTime, paymentMethods, customerSegments, topCustomers, categoryPerformance, inventoryStatus };
  }

  async getCustomerDashboardStats(userId: number) {
    const cart = await this.getActiveCart(userId);
    let cartItemCount = 0;
    if (cart) {
      const [c] = await db.select({ count: count() }).from(cartItems).where(eq(cartItems.cartId, cart.id));
      cartItemCount = c?.count || 0;
    }
    const [orderData] = await db.select({ count: count(), spent: sum(orders.total) })
      .from(orders).where(eq(orders.userId, userId));
    const [productCount] = await db.select({ count: count() }).from(products).where(eq(products.isActive, true));

    return {
      cartItemCount,
      orderCount: orderData?.count || 0,
      totalSpent: orderData?.spent || 0,
      productCount: productCount?.count || 0,
    };
  }

  async getRecommendations(userId: number) {
    return db.select().from(products).where(eq(products.isActive, true)).orderBy(sql`RANDOM()`).limit(8);
  }

  async getProductByBarcode(barcode: string) {
    const [product] = await db.select().from(products).where(eq(products.barcode, barcode));
    return product;
  }

  async getOffers() {
    return db.select().from(offers).orderBy(desc(offers.createdAt));
  }

  async getActiveOffers() {
    const allOffers = await db.select().from(offers).where(eq(offers.isActive, true));
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

    const activeOffers = [];
    for (const offer of allOffers) {
      const isApplicableToday = !offer.applicableDays || offer.applicableDays.length === 0 || offer.applicableDays.includes(dayName);
      let category = null;
      if (offer.categoryId) {
        const [cat] = await db.select().from(categories).where(eq(categories.id, offer.categoryId));
        category = cat;
      }
      activeOffers.push({
        ...offer,
        category,
        isApplicableToday,
      });
    }
    return activeOffers;
  }

  async createOffer(offer: InsertOffer) {
    const [created] = await db.insert(offers).values(offer).returning();
    return created;
  }

  private generateTrendData() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map(d => ({ date: d, orders: Math.floor(Math.random() * 30 + 5) }));
  }
}

export const storage = new DatabaseStorage();

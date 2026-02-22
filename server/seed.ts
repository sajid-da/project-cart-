import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { users, categories, products, inventory, coupons } from "@shared/schema";
import { count } from "drizzle-orm";

export async function seedDatabase() {
  const [userCount] = await db.select({ count: count() }).from(users);
  if (Number(userCount.count) > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  await storage.createUser({
    username: "admin",
    email: "admin@smartcart.com",
    password: adminPassword,
    fullName: "Sarah Johnson",
    role: "admin",
    phone: "+1 555 0100",
    isActive: true,
  });

  // Create manager
  const managerPassword = await hashPassword("manager123");
  await storage.createUser({
    username: "manager",
    email: "manager@smartcart.com",
    password: managerPassword,
    fullName: "Michael Chen",
    role: "manager",
    phone: "+1 555 0101",
    isActive: true,
  });

  // Create customers
  const customerPassword = await hashPassword("customer123");
  await storage.createUser({
    username: "alice",
    email: "alice@example.com",
    password: customerPassword,
    fullName: "Alice Williams",
    role: "customer",
    phone: "+1 555 0102",
    isActive: true,
  });

  await storage.createUser({
    username: "bob",
    email: "bob@example.com",
    password: customerPassword,
    fullName: "Bob Martinez",
    role: "customer",
    phone: "+1 555 0103",
    isActive: true,
  });

  await storage.createUser({
    username: "carol",
    email: "carol@example.com",
    password: customerPassword,
    fullName: "Carol Davis",
    role: "customer",
    phone: "+1 555 0104",
    isActive: true,
  });

  // Create categories
  const catFruits = await storage.createCategory({ name: "Fruits & Vegetables", description: "Fresh produce", icon: "apple" });
  const catDairy = await storage.createCategory({ name: "Dairy & Eggs", description: "Milk, cheese, eggs", icon: "milk" });
  const catBakery = await storage.createCategory({ name: "Bakery", description: "Bread, cakes, pastries", icon: "cake" });
  const catBeverages = await storage.createCategory({ name: "Beverages", description: "Drinks and juices", icon: "coffee" });
  const catSnacks = await storage.createCategory({ name: "Snacks", description: "Chips, cookies, nuts", icon: "cookie" });
  const catMeat = await storage.createCategory({ name: "Meat & Seafood", description: "Fresh meats and fish", icon: "beef" });
  const catHousehold = await storage.createCategory({ name: "Household", description: "Cleaning and supplies", icon: "home" });
  const catPersonal = await storage.createCategory({ name: "Personal Care", description: "Health and beauty", icon: "heart" });

  // Create products with inventory
  const seedProducts = [
    { name: "Organic Bananas", description: "Fresh organic bananas, perfect for smoothies and snacks", price: "1.29", categoryId: catFruits.id, sku: "FRU-001", barcode: "1234567890001", unit: "lb", weight: "1.00" },
    { name: "Red Apples", description: "Crisp Fuji apples, locally sourced", price: "2.49", categoryId: catFruits.id, sku: "FRU-002", barcode: "1234567890002", unit: "lb", weight: "1.00" },
    { name: "Baby Spinach", description: "Prewashed organic baby spinach leaves", price: "3.99", categoryId: catFruits.id, sku: "FRU-003", barcode: "1234567890003", unit: "piece", weight: "0.35" },
    { name: "Avocados", description: "Ripe Hass avocados, ready to eat", price: "1.99", categoryId: catFruits.id, sku: "FRU-004", barcode: "1234567890004", unit: "piece", weight: "0.25" },
    { name: "Whole Milk", description: "Farm fresh whole milk, vitamin D fortified", price: "4.29", categoryId: catDairy.id, sku: "DAI-001", barcode: "1234567890005", unit: "piece", weight: "3.78" },
    { name: "Greek Yogurt", description: "Plain non-fat Greek yogurt, high protein", price: "5.49", categoryId: catDairy.id, sku: "DAI-002", barcode: "1234567890006", unit: "piece", weight: "0.90" },
    { name: "Free Range Eggs", description: "Large brown eggs from cage-free hens", price: "4.99", categoryId: catDairy.id, sku: "DAI-003", barcode: "1234567890007", unit: "piece", weight: "0.68" },
    { name: "Cheddar Cheese", description: "Sharp aged cheddar cheese block", price: "6.99", categoryId: catDairy.id, sku: "DAI-004", barcode: "1234567890008", unit: "piece", weight: "0.45" },
    { name: "Sourdough Bread", description: "Artisan sourdough bread, freshly baked", price: "4.49", categoryId: catBakery.id, sku: "BAK-001", barcode: "1234567890009", unit: "piece", weight: "0.68" },
    { name: "Croissants", description: "Butter croissants, pack of 4", price: "5.99", categoryId: catBakery.id, sku: "BAK-002", barcode: "1234567890010", unit: "piece", weight: "0.30" },
    { name: "Chocolate Muffins", description: "Double chocolate muffins, pack of 6", price: "6.49", categoryId: catBakery.id, sku: "BAK-003", barcode: "1234567890011", unit: "piece", weight: "0.50" },
    { name: "Orange Juice", description: "100% pure squeezed orange juice, no pulp", price: "4.99", categoryId: catBeverages.id, sku: "BEV-001", barcode: "1234567890012", unit: "piece", weight: "1.89" },
    { name: "Green Tea", description: "Japanese matcha green tea bags, 20 count", price: "6.99", categoryId: catBeverages.id, sku: "BEV-002", barcode: "1234567890013", unit: "piece", weight: "0.05" },
    { name: "Sparkling Water", description: "Natural mineral sparkling water, 12 pack", price: "7.99", categoryId: catBeverages.id, sku: "BEV-003", barcode: "1234567890014", unit: "piece", weight: "4.26" },
    { name: "Trail Mix", description: "Premium mixed nuts and dried fruits", price: "8.99", categoryId: catSnacks.id, sku: "SNK-001", barcode: "1234567890015", unit: "piece", weight: "0.45" },
    { name: "Potato Chips", description: "Kettle-cooked sea salt potato chips", price: "3.49", categoryId: catSnacks.id, sku: "SNK-002", barcode: "1234567890016", unit: "piece", weight: "0.28" },
    { name: "Dark Chocolate", description: "72% cacao dark chocolate bar", price: "4.49", categoryId: catSnacks.id, sku: "SNK-003", barcode: "1234567890017", unit: "piece", weight: "0.10" },
    { name: "Chicken Breast", description: "Boneless skinless chicken breast, antibiotic-free", price: "8.99", categoryId: catMeat.id, sku: "MEA-001", barcode: "1234567890018", unit: "lb", weight: "1.00" },
    { name: "Atlantic Salmon", description: "Fresh Atlantic salmon fillet, sustainably farmed", price: "12.99", categoryId: catMeat.id, sku: "MEA-002", barcode: "1234567890019", unit: "lb", weight: "1.00" },
    { name: "Ground Turkey", description: "Lean ground turkey, 93% lean", price: "6.49", categoryId: catMeat.id, sku: "MEA-003", barcode: "1234567890020", unit: "lb", weight: "1.00" },
    { name: "All-Purpose Cleaner", description: "Eco-friendly multi-surface cleaner", price: "4.99", categoryId: catHousehold.id, sku: "HOU-001", barcode: "1234567890021", unit: "piece", weight: "0.95" },
    { name: "Paper Towels", description: "Ultra-strong paper towels, 6 rolls", price: "8.99", categoryId: catHousehold.id, sku: "HOU-002", barcode: "1234567890022", unit: "piece", weight: "1.80" },
    { name: "Shampoo", description: "Sulfate-free moisturizing shampoo", price: "7.99", categoryId: catPersonal.id, sku: "PER-001", barcode: "1234567890023", unit: "piece", weight: "0.40" },
    { name: "Toothpaste", description: "Fluoride whitening toothpaste", price: "3.99", categoryId: catPersonal.id, sku: "PER-002", barcode: "1234567890024", unit: "piece", weight: "0.17" },
  ];

  for (const p of seedProducts) {
    const product = await storage.createProduct({
      ...p,
      isActive: true,
    });

    await storage.createInventory({
      productId: product.id,
      quantity: Math.floor(Math.random() * 150) + 20,
      minStock: 10,
      maxStock: 500,
      location: `Aisle ${Math.floor(Math.random() * 12) + 1}`,
      batchNumber: `BATCH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    });
  }

  // Create coupons
  await storage.createCoupon({
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: "10",
    minPurchase: "20",
    maxUses: 100,
    isActive: true,
  });

  await storage.createCoupon({
    code: "SAVE5",
    discountType: "fixed",
    discountValue: "5",
    minPurchase: "30",
    maxUses: 50,
    isActive: true,
  });

  await storage.createCoupon({
    code: "SUMMER20",
    discountType: "percentage",
    discountValue: "20",
    minPurchase: "50",
    maxUses: 25,
    isActive: true,
  });

  // Create some sample orders for analytics
  const alice = await storage.getUserByUsername("alice");
  const bob = await storage.getUserByUsername("bob");
  
  if (alice && bob) {
    // Alice's orders
    const aliceOrder1 = await storage.createOrder({
      userId: alice.id,
      subtotal: "25.77",
      tax: "2.06",
      discount: "0",
      total: "27.83",
      status: "paid",
    });
    await storage.createOrderItem({ orderId: aliceOrder1.id, productId: 1, quantity: 2, price: "1.29" });
    await storage.createOrderItem({ orderId: aliceOrder1.id, productId: 5, quantity: 1, price: "4.29" });
    await storage.createOrderItem({ orderId: aliceOrder1.id, productId: 9, quantity: 3, price: "4.49" });
    await storage.createPayment({ orderId: aliceOrder1.id, amount: "27.83", method: "card", status: "completed", transactionId: "TXN-SEED-001" });

    const aliceOrder2 = await storage.createOrder({
      userId: alice.id,
      subtotal: "42.46",
      tax: "3.40",
      discount: "4.25",
      total: "41.61",
      status: "paid",
      couponId: 1,
    });
    await storage.createOrderItem({ orderId: aliceOrder2.id, productId: 18, quantity: 2, price: "8.99" });
    await storage.createOrderItem({ orderId: aliceOrder2.id, productId: 12, quantity: 1, price: "4.99" });
    await storage.createOrderItem({ orderId: aliceOrder2.id, productId: 15, quantity: 2, price: "8.99" });
    await storage.createPayment({ orderId: aliceOrder2.id, amount: "41.61", method: "upi", status: "completed", transactionId: "TXN-SEED-002" });

    // Bob's order
    const bobOrder1 = await storage.createOrder({
      userId: bob.id,
      subtotal: "33.96",
      tax: "2.72",
      discount: "0",
      total: "36.68",
      status: "paid",
    });
    await storage.createOrderItem({ orderId: bobOrder1.id, productId: 6, quantity: 2, price: "5.49" });
    await storage.createOrderItem({ orderId: bobOrder1.id, productId: 10, quantity: 1, price: "5.99" });
    await storage.createOrderItem({ orderId: bobOrder1.id, productId: 19, quantity: 1, price: "12.99" });
    await storage.createPayment({ orderId: bobOrder1.id, amount: "36.68", method: "card", status: "completed", transactionId: "TXN-SEED-003" });
  }

  // Create sample fraud log
  await storage.createFraudLog({
    userId: bob?.id || 4,
    riskScore: "65",
    reason: "Unusual purchase pattern detected - high value transaction from new account",
    action: "flagged",
    details: { amount: 450, itemCount: 15 },
  });

  await storage.createFraudLog({
    userId: alice?.id || 3,
    riskScore: "28",
    reason: "Minor anomaly - multiple quick transactions",
    action: "monitored",
    details: { transactionCount: 3, timeWindow: "5 minutes" },
  });

  // Activity logs
  await storage.createActivityLog({
    userId: 1,
    action: "System initialized - SmartCart Retail Platform",
    resource: "system",
  });
  await storage.createActivityLog({
    userId: 1,
    action: "Seed data loaded successfully",
    resource: "system",
  });

  console.log("Database seeded successfully!");
}

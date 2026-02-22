import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { users, categories, products, inventory, coupons, offers } from "@shared/schema";
import { count } from "drizzle-orm";

export async function seedDatabase() {
  const [userCount] = await db.select({ count: count() }).from(users);
  if (Number(userCount.count) > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  const adminPassword = await hashPassword("admin123");
  await storage.createUser({
    username: "admin",
    email: "admin@smartcart.in",
    password: adminPassword,
    fullName: "Priya Sharma",
    role: "admin",
    phone: "+91 98765 43210",
    isActive: true,
  });

  const managerPassword = await hashPassword("manager123");
  await storage.createUser({
    username: "manager",
    email: "manager@smartcart.in",
    password: managerPassword,
    fullName: "Rajesh Kumar",
    role: "manager",
    phone: "+91 98765 43211",
    isActive: true,
  });

  const customerPassword = await hashPassword("customer123");
  await storage.createUser({
    username: "anita",
    email: "anita@example.in",
    password: customerPassword,
    fullName: "Anita Desai",
    role: "customer",
    phone: "+91 98765 43212",
    isActive: true,
  });

  await storage.createUser({
    username: "vikram",
    email: "vikram@example.in",
    password: customerPassword,
    fullName: "Vikram Patel",
    role: "customer",
    phone: "+91 98765 43213",
    isActive: true,
  });

  await storage.createUser({
    username: "meera",
    email: "meera@example.in",
    password: customerPassword,
    fullName: "Meera Nair",
    role: "customer",
    phone: "+91 98765 43214",
    isActive: true,
  });

  const catFruits = await storage.createCategory({ name: "Fruits & Vegetables", description: "Fresh produce and greens", icon: "apple" });
  const catDairy = await storage.createCategory({ name: "Dairy & Eggs", description: "Milk, paneer, curd, eggs", icon: "milk" });
  const catGrains = await storage.createCategory({ name: "Grains & Staples", description: "Rice, atta, dal, pulses", icon: "wheat" });
  const catBeverages = await storage.createCategory({ name: "Beverages", description: "Tea, coffee, juices, lassi", icon: "coffee" });
  const catSnacks = await storage.createCategory({ name: "Snacks & Namkeen", description: "Chips, namkeen, biscuits, sweets", icon: "cookie" });
  const catSpices = await storage.createCategory({ name: "Spices & Masala", description: "Masalas, spices, condiments", icon: "flame" });
  const catHousehold = await storage.createCategory({ name: "Household", description: "Cleaning and home supplies", icon: "home" });
  const catPersonal = await storage.createCategory({ name: "Personal Care", description: "Health, beauty and hygiene", icon: "heart" });

  const seedProducts = [
    { name: "Fresh Bananas (Kela)", description: "Farm-fresh ripe bananas, rich in potassium and fiber. Ingredients: 100% Natural Banana. Benefits: Good source of potassium, vitamin B6, and dietary fiber.", price: "49.00", categoryId: catFruits.id, sku: "FRU-001", barcode: "8901063010017", unit: "dozen", weight: "1.00" },
    { name: "Kashmir Apple", description: "Premium Kashmiri red apples, sweet and crunchy. Ingredients: 100% Natural Apple. Benefits: Rich in antioxidants, fiber, and vitamin C.", price: "189.00", categoryId: catFruits.id, sku: "FRU-002", barcode: "8901063010024", unit: "kg", weight: "1.00" },
    { name: "Palak (Spinach)", description: "Fresh organic spinach leaves, washed and cleaned. Ingredients: 100% Organic Spinach. Benefits: High in iron, calcium, vitamin A and K.", price: "30.00", categoryId: catFruits.id, sku: "FRU-003", barcode: "8901063010031", unit: "bunch", weight: "0.25" },
    { name: "Alphonso Mango", description: "Premium Ratnagiri Alphonso mangoes, king of fruits. Ingredients: 100% Natural Mango. Benefits: Rich in vitamin C, vitamin A, and antioxidants.", price: "499.00", categoryId: catFruits.id, sku: "FRU-004", barcode: "8901063010048", unit: "dozen", weight: "3.00" },

    { name: "Amul Taza Milk", description: "Fresh toned milk from Amul. Ingredients: Toned Milk (SNF 8.5%, Fat 3%). Benefits: Good source of calcium, protein, vitamin D.", price: "28.00", categoryId: catDairy.id, sku: "DAI-001", barcode: "8901262150019", unit: "500ml", weight: "0.50" },
    { name: "Mother Dairy Dahi", description: "Fresh plain curd, creamy and smooth. Ingredients: Pasteurized toned milk, Lactic culture. Benefits: Rich in probiotics, aids digestion, good source of calcium.", price: "45.00", categoryId: catDairy.id, sku: "DAI-002", barcode: "8901262150026", unit: "400g", weight: "0.40" },
    { name: "Amul Paneer", description: "Fresh cottage cheese block, ideal for curries and tikka. Ingredients: Pasteurized milk, Citric acid. Benefits: High protein, rich in calcium and phosphorus.", price: "90.00", categoryId: catDairy.id, sku: "DAI-003", barcode: "8901262150033", unit: "200g", weight: "0.20" },
    { name: "Farm Fresh Eggs", description: "Free range brown eggs, pack of 12. Ingredients: Natural Farm Eggs. Benefits: High protein, vitamin D, B12 and choline.", price: "85.00", categoryId: catDairy.id, sku: "DAI-004", barcode: "8901262150040", unit: "pack", weight: "0.72" },

    { name: "India Gate Basmati Rice", description: "Premium aged basmati rice, extra-long grain. Ingredients: 100% Basmati Rice. Benefits: Low glycemic index, gluten-free, good source of carbohydrates.", price: "399.00", categoryId: catGrains.id, sku: "GRN-001", barcode: "8901725181109", unit: "5kg", weight: "5.00" },
    { name: "Aashirvaad Atta", description: "Whole wheat flour, 100% whole wheat. Ingredients: Whole Wheat Flour. Benefits: High fiber, rich in minerals, good for daily chapati.", price: "295.00", categoryId: catGrains.id, sku: "GRN-002", barcode: "8901725133702", unit: "5kg", weight: "5.00" },
    { name: "Toor Dal", description: "Premium quality arhar/toor dal, essential for Indian cooking. Ingredients: 100% Toor Dal (Pigeon Pea). Benefits: High protein, fiber, iron and folic acid.", price: "159.00", categoryId: catGrains.id, sku: "GRN-003", barcode: "8901063010055", unit: "1kg", weight: "1.00" },

    { name: "Tata Tea Gold", description: "Premium leaf tea with 15% long leaves. Ingredients: Tea Leaves (15% Long Leaves). Benefits: Rich in antioxidants, boosts metabolism.", price: "265.00", categoryId: catBeverages.id, sku: "BEV-001", barcode: "8901176013488", unit: "500g", weight: "0.50" },
    { name: "Nescafe Classic Coffee", description: "100% pure instant coffee, aromatic and smooth. Ingredients: 100% Pure Coffee. Benefits: Rich in antioxidants, boosts energy and focus.", price: "210.00", categoryId: catBeverages.id, sku: "BEV-002", barcode: "8901058848052", unit: "200g", weight: "0.20" },
    { name: "Real Mango Juice", description: "100% real fruit juice with no added sugar. Ingredients: Mango Pulp, Water, Sugar. Benefits: Source of vitamin A and C.", price: "99.00", categoryId: catBeverages.id, sku: "BEV-003", barcode: "8901058001785", unit: "1L", weight: "1.00" },
    { name: "Amul Lassi", description: "Sweet flavored lassi, refreshing yogurt drink. Ingredients: Curd, Sugar, Water, Cardamom. Benefits: Probiotics, calcium, aids digestion.", price: "25.00", categoryId: catBeverages.id, sku: "BEV-004", barcode: "8901262150057", unit: "200ml", weight: "0.20" },

    { name: "Haldiram's Aloo Bhujia", description: "Crispy spiced potato noodles, authentic taste. Ingredients: Gram Flour, Potato, Edible Oil, Spices, Salt. Allergens: Contains Gram flour.", price: "55.00", categoryId: catSnacks.id, sku: "SNK-001", barcode: "8904004400163", unit: "200g", weight: "0.20" },
    { name: "Parle-G Biscuits", description: "India's favourite glucose biscuits. Ingredients: Wheat Flour, Sugar, Edible Oil, Invert Syrup, Milk Solids. Benefits: Energy-boosting glucose biscuit.", price: "10.00", categoryId: catSnacks.id, sku: "SNK-002", barcode: "8901725133009", unit: "pack", weight: "0.08" },
    { name: "Lay's Magic Masala Chips", description: "Crunchy potato chips with Indian masala flavor. Ingredients: Potatoes, Edible Oil, Seasoning (Spices, Sugar, Salt). Allergens: May contain traces of milk.", price: "20.00", categoryId: catSnacks.id, sku: "SNK-003", barcode: "8901491101288", unit: "52g", weight: "0.05" },
    { name: "Cadbury Dairy Milk", description: "Classic milk chocolate bar, smooth and creamy. Ingredients: Sugar, Cocoa Butter, Milk Solids, Cocoa Mass. Allergens: Contains Milk, Soy.", price: "40.00", categoryId: catSnacks.id, sku: "SNK-004", barcode: "8901233020297", unit: "50g", weight: "0.05" },

    { name: "MDH Garam Masala", description: "Authentic blend of 12 spices for Indian cooking. Ingredients: Coriander, Cumin, Black Pepper, Cardamom, Cloves, Cinnamon, Bay Leaf, Fennel, Mace, Nutmeg, Ginger, Chili.", price: "72.00", categoryId: catSpices.id, sku: "SPI-001", barcode: "8901063010062", unit: "100g", weight: "0.10" },
    { name: "Everest Turmeric Powder", description: "Pure haldi powder, bright yellow color. Ingredients: 100% Turmeric (Curcuma Longa). Benefits: Anti-inflammatory, antioxidant, boosts immunity.", price: "48.00", categoryId: catSpices.id, sku: "SPI-002", barcode: "8901063010079", unit: "100g", weight: "0.10" },
    { name: "Saffola Gold Oil", description: "Blended edible vegetable oil, heart-healthy. Ingredients: Rice Bran Oil, Sunflower Oil. Benefits: Rich in MUFA and PUFA, Vitamin E, Oryzanol.", price: "199.00", categoryId: catSpices.id, sku: "SPI-003", barcode: "8901063010086", unit: "1L", weight: "0.92" },

    { name: "Vim Dishwash Liquid", description: "Powerful grease-cutting dish wash gel. Ingredients: Water, Sodium Lauryl Sulfate, Cocamidopropyl Betaine, Fragrance.", price: "99.00", categoryId: catHousehold.id, sku: "HOU-001", barcode: "8901030560019", unit: "500ml", weight: "0.55" },
    { name: "Surf Excel Detergent", description: "Top load washing machine detergent. Ingredients: Surfactants, Builders, Enzymes, Optical Brighteners. Benefits: Tough stain removal.", price: "245.00", categoryId: catHousehold.id, sku: "HOU-002", barcode: "8901030560026", unit: "1kg", weight: "1.00" },

    { name: "Himalaya Neem Face Wash", description: "Herbal face wash with neem and turmeric. Ingredients: Neem Extract, Turmeric Extract, Water. Benefits: Prevents pimples, purifies skin, herbal formula.", price: "155.00", categoryId: catPersonal.id, sku: "PER-001", barcode: "8901138511364", unit: "150ml", weight: "0.16" },
    { name: "Colgate MaxFresh Toothpaste", description: "Cooling crystal toothpaste with menthol. Ingredients: Sorbitol, Water, Hydrated Silica, Sodium Lauryl Sulfate, Flavor. Benefits: Fresh breath, cavity protection.", price: "89.00", categoryId: catPersonal.id, sku: "PER-002", barcode: "8901314100115", unit: "150g", weight: "0.16" },
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

  await storage.createCoupon({
    code: "NAMASTE10",
    discountType: "percentage",
    discountValue: "10",
    minPurchase: "200",
    maxUses: 100,
    isActive: true,
  });

  await storage.createCoupon({
    code: "BACHAT50",
    discountType: "fixed",
    discountValue: "50",
    minPurchase: "500",
    maxUses: 50,
    isActive: true,
  });

  await storage.createCoupon({
    code: "DIWALI20",
    discountType: "percentage",
    discountValue: "20",
    minPurchase: "1000",
    maxUses: 25,
    isActive: true,
  });

  await db.insert(offers).values([
    {
      name: "Weekend Grocery Bonanza",
      description: "Flat 15% off on all Fruits & Vegetables every Saturday and Sunday!",
      discountType: "percentage",
      discountValue: "15",
      applicableDays: ["Saturday", "Sunday"],
      categoryId: catFruits.id,
      isActive: true,
    },
    {
      name: "Saturday Snack Fiesta",
      description: "Get 10% off on all Snacks & Namkeen every Saturday",
      discountType: "percentage",
      discountValue: "10",
      applicableDays: ["Saturday"],
      categoryId: catSnacks.id,
      isActive: true,
    },
    {
      name: "Sunday Dairy Deal",
      description: "Buy dairy products on Sunday and save ₹20 on orders above ₹100",
      discountType: "fixed",
      discountValue: "20",
      applicableDays: ["Sunday"],
      categoryId: catDairy.id,
      minPurchase: "100",
      isActive: true,
    },
    {
      name: "Weekend Beverage Blast",
      description: "Enjoy 12% off on all beverages this weekend",
      discountType: "percentage",
      discountValue: "12",
      applicableDays: ["Saturday", "Sunday"],
      categoryId: catBeverages.id,
      isActive: true,
    },
    {
      name: "Festive Spice Special",
      description: "Flat ₹15 off on all spices & masala every Friday and Saturday",
      discountType: "fixed",
      discountValue: "15",
      applicableDays: ["Friday", "Saturday"],
      categoryId: catSpices.id,
      isActive: true,
    },
  ]);

  const anita = await storage.getUserByUsername("anita");
  const vikram = await storage.getUserByUsername("vikram");

  if (anita && vikram) {
    const anitaOrder1 = await storage.createOrder({
      userId: anita.id,
      subtotal: "573.00",
      tax: "45.84",
      discount: "0",
      total: "618.84",
      status: "paid",
    });
    await storage.createOrderItem({ orderId: anitaOrder1.id, productId: 1, quantity: 2, price: "49.00" });
    await storage.createOrderItem({ orderId: anitaOrder1.id, productId: 5, quantity: 1, price: "28.00" });
    await storage.createOrderItem({ orderId: anitaOrder1.id, productId: 9, quantity: 1, price: "399.00" });
    await storage.createPayment({ orderId: anitaOrder1.id, amount: "618.84", method: "upi", status: "completed", transactionId: "TXN-SEED-001" });

    const anitaOrder2 = await storage.createOrder({
      userId: anita.id,
      subtotal: "845.00",
      tax: "67.60",
      discount: "84.50",
      total: "828.10",
      status: "paid",
      couponId: 1,
    });
    await storage.createOrderItem({ orderId: anitaOrder2.id, productId: 12, quantity: 1, price: "265.00" });
    await storage.createOrderItem({ orderId: anitaOrder2.id, productId: 10, quantity: 1, price: "295.00" });
    await storage.createOrderItem({ orderId: anitaOrder2.id, productId: 7, quantity: 1, price: "90.00" });
    await storage.createOrderItem({ orderId: anitaOrder2.id, productId: 20, quantity: 1, price: "72.00" });
    await storage.createPayment({ orderId: anitaOrder2.id, amount: "828.10", method: "card", status: "completed", transactionId: "TXN-SEED-002" });

    const vikramOrder1 = await storage.createOrder({
      userId: vikram.id,
      subtotal: "558.00",
      tax: "44.64",
      discount: "0",
      total: "602.64",
      status: "paid",
    });
    await storage.createOrderItem({ orderId: vikramOrder1.id, productId: 2, quantity: 2, price: "189.00" });
    await storage.createOrderItem({ orderId: vikramOrder1.id, productId: 13, quantity: 1, price: "210.00" });
    await storage.createPayment({ orderId: vikramOrder1.id, amount: "602.64", method: "upi", status: "completed", transactionId: "TXN-SEED-003" });
  }

  await storage.createFraudLog({
    userId: vikram?.id || 4,
    riskScore: "65",
    reason: "Unusual purchase pattern detected - high value transaction",
    action: "flagged",
    details: { amount: 4500, itemCount: 15 },
  });

  await storage.createFraudLog({
    userId: anita?.id || 3,
    riskScore: "28",
    reason: "Minor anomaly - multiple quick transactions",
    action: "monitored",
    details: { transactionCount: 3, timeWindow: "5 minutes" },
  });

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

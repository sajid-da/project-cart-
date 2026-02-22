import { storage } from "./storage";
import { hashPassword } from "./auth";
import { db } from "./db";
import { users, categories, products, inventory, coupons, offers, orders, orderItems, payments } from "@shared/schema";
import { count } from "drizzle-orm";

export async function seedDatabase() {
  const [userCount] = await db.select({ count: count() }).from(users);
  if (Number(userCount.count) > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database with 500+ Indian products...");

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
  const customerUsers = [
    { username: "anita", email: "anita@example.in", fullName: "Anita Desai", phone: "+91 98765 43212" },
    { username: "vikram", email: "vikram@example.in", fullName: "Vikram Patel", phone: "+91 98765 43213" },
    { username: "meera", email: "meera@example.in", fullName: "Meera Nair", phone: "+91 98765 43214" },
    { username: "rohit", email: "rohit@example.in", fullName: "Rohit Sharma", phone: "+91 98765 43215" },
    { username: "sunita", email: "sunita@example.in", fullName: "Sunita Gupta", phone: "+91 98765 43216" },
    { username: "arjun", email: "arjun@example.in", fullName: "Arjun Reddy", phone: "+91 98765 43217" },
    { username: "kavita", email: "kavita@example.in", fullName: "Kavita Singh", phone: "+91 98765 43218" },
    { username: "deepak", email: "deepak@example.in", fullName: "Deepak Verma", phone: "+91 98765 43219" },
    { username: "pooja", email: "pooja@example.in", fullName: "Pooja Mehta", phone: "+91 98765 43220" },
    { username: "ravi", email: "ravi@example.in", fullName: "Ravi Iyer", phone: "+91 98765 43221" },
  ];

  for (const cu of customerUsers) {
    await storage.createUser({ ...cu, password: customerPassword, role: "customer", isActive: true });
  }

  const catFruits = await storage.createCategory({ name: "Fruits & Vegetables", description: "Fresh produce and greens", icon: "apple" });
  const catDairy = await storage.createCategory({ name: "Dairy & Eggs", description: "Milk, paneer, curd, eggs", icon: "milk" });
  const catGrains = await storage.createCategory({ name: "Grains & Staples", description: "Rice, atta, dal, pulses", icon: "wheat" });
  const catBeverages = await storage.createCategory({ name: "Beverages", description: "Tea, coffee, juices, lassi", icon: "coffee" });
  const catSnacks = await storage.createCategory({ name: "Snacks & Namkeen", description: "Chips, namkeen, biscuits, sweets", icon: "cookie" });
  const catSpices = await storage.createCategory({ name: "Spices & Masala", description: "Masalas, spices, condiments", icon: "flame" });
  const catHousehold = await storage.createCategory({ name: "Household", description: "Cleaning and home supplies", icon: "home" });
  const catPersonal = await storage.createCategory({ name: "Personal Care", description: "Health, beauty and hygiene", icon: "heart" });
  const catFrozen = await storage.createCategory({ name: "Frozen & Ready to Eat", description: "Frozen foods, instant meals, ready-to-eat items", icon: "snowflake" });
  const catBaby = await storage.createCategory({ name: "Baby & Kids", description: "Baby food, diapers, kids products", icon: "baby" });

  const seedProducts = [
    // ==================== FRUITS & VEGETABLES (60+ items) ====================
    { name: "Fresh Bananas (Kela)", description: "Farm-fresh ripe bananas, rich in potassium and fiber", price: "49.00", categoryId: catFruits.id, sku: "FRU-001", barcode: "8901063010017", unit: "dozen", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop" },
    { name: "Kashmir Apple", description: "Premium Kashmiri red apples, sweet and crunchy", price: "189.00", categoryId: catFruits.id, sku: "FRU-002", barcode: "8901063010024", unit: "kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop" },
    { name: "Palak (Spinach)", description: "Fresh organic spinach leaves, washed and cleaned", price: "30.00", categoryId: catFruits.id, sku: "FRU-003", barcode: "8901063010031", unit: "bunch", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop" },
    { name: "Alphonso Mango", description: "Premium Ratnagiri Alphonso mangoes, king of fruits", price: "499.00", categoryId: catFruits.id, sku: "FRU-004", barcode: "8901063010048", unit: "dozen", weight: "3.00", imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop" },
    { name: "Shimla Mirch (Capsicum)", description: "Fresh green capsicum, crispy and flavorful", price: "45.00", categoryId: catFruits.id, sku: "FRU-005", barcode: "8901063010055", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop" },
    { name: "Tomato (Tamatar)", description: "Fresh red tomatoes, essential for Indian cooking", price: "35.00", categoryId: catFruits.id, sku: "FRU-006", barcode: "8901063010062", unit: "kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=400&fit=crop" },
    { name: "Onion (Pyaaz)", description: "Fresh red onions, medium size", price: "40.00", categoryId: catFruits.id, sku: "FRU-007", barcode: "8901063010079", unit: "kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop" },
    { name: "Potato (Aloo)", description: "Fresh potatoes, ideal for curries and fries", price: "30.00", categoryId: catFruits.id, sku: "FRU-008", barcode: "8901063010086", unit: "kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82ber90a?w=400&h=400&fit=crop" },
    { name: "Green Chilli (Hari Mirch)", description: "Spicy green chillies, freshly picked", price: "20.00", categoryId: catFruits.id, sku: "FRU-009", barcode: "8901063010093", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&h=400&fit=crop" },
    { name: "Ginger (Adrak)", description: "Fresh ginger root, aromatic and pungent", price: "25.00", categoryId: catFruits.id, sku: "FRU-010", barcode: "8901063010109", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop" },
    { name: "Garlic (Lehsun)", description: "Fresh garlic bulbs, strong flavored", price: "35.00", categoryId: catFruits.id, sku: "FRU-011", barcode: "8901063010116", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2b3c?w=400&h=400&fit=crop" },
    { name: "Cucumber (Kheera)", description: "Cool and crunchy cucumbers, great for salads", price: "25.00", categoryId: catFruits.id, sku: "FRU-012", barcode: "8901063010123", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop" },
    { name: "Carrot (Gajar)", description: "Fresh orange carrots, sweet and nutritious", price: "40.00", categoryId: catFruits.id, sku: "FRU-013", barcode: "8901063010130", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop" },
    { name: "Cauliflower (Gobi)", description: "Fresh white cauliflower, tight florets", price: "35.00", categoryId: catFruits.id, sku: "FRU-014", barcode: "8901063010147", unit: "piece", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1568584711271-6c929f2ae1c3?w=400&h=400&fit=crop" },
    { name: "Cabbage (Patta Gobi)", description: "Fresh green cabbage, tightly packed leaves", price: "28.00", categoryId: catFruits.id, sku: "FRU-015", barcode: "8901063010154", unit: "piece", weight: "0.80", imageUrl: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=400&fit=crop" },
    { name: "Brinjal (Baingan)", description: "Fresh purple brinjal, perfect for bhartha", price: "30.00", categoryId: catFruits.id, sku: "FRU-016", barcode: "8901063010161", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=400&fit=crop" },
    { name: "Ladies Finger (Bhindi)", description: "Tender okra, great for sabzi and frying", price: "45.00", categoryId: catFruits.id, sku: "FRU-017", barcode: "8901063010178", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=400&h=400&fit=crop" },
    { name: "Bitter Gourd (Karela)", description: "Fresh bitter gourd, highly nutritious", price: "35.00", categoryId: catFruits.id, sku: "FRU-018", barcode: "8901063010185", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400&h=400&fit=crop" },
    { name: "Ridge Gourd (Turai)", description: "Fresh ridge gourd, light and healthy", price: "30.00", categoryId: catFruits.id, sku: "FRU-019", barcode: "8901063010192", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1566486009160-6c15e0a7e9f7?w=400&h=400&fit=crop" },
    { name: "Bottle Gourd (Lauki)", description: "Fresh bottle gourd, ideal for dal and curry", price: "25.00", categoryId: catFruits.id, sku: "FRU-020", barcode: "8901063010208", unit: "piece", weight: "0.80", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd0587?w=400&h=400&fit=crop" },
    { name: "Papaya", description: "Ripe sweet papaya, rich in vitamins", price: "55.00", categoryId: catFruits.id, sku: "FRU-021", barcode: "8901063010215", unit: "piece", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&h=400&fit=crop" },
    { name: "Watermelon (Tarbooz)", description: "Sweet and juicy watermelon, summer favourite", price: "45.00", categoryId: catFruits.id, sku: "FRU-022", barcode: "8901063010222", unit: "piece", weight: "3.00", imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop" },
    { name: "Pomegranate (Anaar)", description: "Ruby red pomegranate, packed with antioxidants", price: "120.00", categoryId: catFruits.id, sku: "FRU-023", barcode: "8901063010239", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop" },
    { name: "Guava (Amrood)", description: "Fresh green guavas, high in Vitamin C", price: "60.00", categoryId: catFruits.id, sku: "FRU-024", barcode: "8901063010246", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400&h=400&fit=crop" },
    { name: "Orange (Santra)", description: "Nagpur oranges, sweet and tangy", price: "80.00", categoryId: catFruits.id, sku: "FRU-025", barcode: "8901063010253", unit: "kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop" },
    { name: "Grapes (Angoor)", description: "Fresh seedless green grapes", price: "95.00", categoryId: catFruits.id, sku: "FRU-026", barcode: "8901063010260", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop" },
    { name: "Lemon (Nimbu)", description: "Fresh lemons, tangy and aromatic", price: "15.00", categoryId: catFruits.id, sku: "FRU-027", barcode: "8901063010277", unit: "pack/6", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop" },
    { name: "Coconut (Nariyal)", description: "Fresh mature coconut, ideal for cooking", price: "35.00", categoryId: catFruits.id, sku: "FRU-028", barcode: "8901063010284", unit: "piece", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=400&h=400&fit=crop" },
    { name: "Coriander Leaves (Dhaniya)", description: "Fresh coriander bunch, aromatic garnish", price: "10.00", categoryId: catFruits.id, sku: "FRU-029", barcode: "8901063010291", unit: "bunch", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=400&fit=crop" },
    { name: "Mint Leaves (Pudina)", description: "Fresh mint leaves for chutneys and drinks", price: "10.00", categoryId: catFruits.id, sku: "FRU-030", barcode: "8901063010307", unit: "bunch", weight: "0.08", imageUrl: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400&h=400&fit=crop" },
    { name: "Curry Leaves (Kadi Patta)", description: "Fresh curry leaves, essential for South Indian cooking", price: "10.00", categoryId: catFruits.id, sku: "FRU-031", barcode: "8901063010314", unit: "bunch", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1515586000433-45c4a8c4e1d7?w=400&h=400&fit=crop" },
    { name: "Drumstick (Moringa)", description: "Fresh moringa pods, packed with nutrients", price: "40.00", categoryId: catFruits.id, sku: "FRU-032", barcode: "8901063010321", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1540420828642-fca2c5c18abe?w=400&h=400&fit=crop" },
    { name: "Pumpkin (Kaddu)", description: "Fresh orange pumpkin, sweet and earthy", price: "30.00", categoryId: catFruits.id, sku: "FRU-033", barcode: "8901063010338", unit: "piece", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=400&h=400&fit=crop" },
    { name: "Green Peas (Matar)", description: "Fresh green peas, perfect for pulao and curry", price: "60.00", categoryId: catFruits.id, sku: "FRU-034", barcode: "8901063010345", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1587735243475-46fba7153e63?w=400&h=400&fit=crop" },
    { name: "Sweet Potato (Shakarkandi)", description: "Fresh sweet potatoes, naturally sweet", price: "40.00", categoryId: catFruits.id, sku: "FRU-035", barcode: "8901063010352", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1596097635092-6cf0c08c7178?w=400&h=400&fit=crop" },
    { name: "Mushroom (Button)", description: "Fresh white button mushrooms", price: "55.00", categoryId: catFruits.id, sku: "FRU-036", barcode: "8901063010369", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=400&fit=crop" },
    { name: "Radish (Mooli)", description: "Fresh white radish, mild and crunchy", price: "20.00", categoryId: catFruits.id, sku: "FRU-037", barcode: "8901063010376", unit: "piece", weight: "0.30", imageUrl: "https://images.unsplash.com/photo-1594282486756-a0b7a0b5b9bc?w=400&h=400&fit=crop" },
    { name: "Beetroot (Chukandar)", description: "Fresh red beetroot, earthy and nutritious", price: "35.00", categoryId: catFruits.id, sku: "FRU-038", barcode: "8901063010383", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=400&h=400&fit=crop" },
    { name: "Fenugreek Leaves (Methi)", description: "Fresh methi leaves, slightly bitter and aromatic", price: "15.00", categoryId: catFruits.id, sku: "FRU-039", barcode: "8901063010390", unit: "bunch", weight: "0.15", imageUrl: "https://images.unsplash.com/photo-1585664811087-47f65abb5a56?w=400&h=400&fit=crop" },
    { name: "Jackfruit (Kathal)", description: "Fresh raw jackfruit, great for vegetable curry", price: "70.00", categoryId: catFruits.id, sku: "FRU-040", barcode: "8901063010406", unit: "kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5e5e4e1?w=400&h=400&fit=crop" },
    { name: "Pineapple (Ananas)", description: "Ripe golden pineapple, tropical sweetness", price: "65.00", categoryId: catFruits.id, sku: "FRU-041", barcode: "8901063010413", unit: "piece", weight: "1.50", imageUrl: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=400&fit=crop" },
    { name: "Kiwi Fruit", description: "Fresh green kiwi, tangy and vitamin-rich", price: "140.00", categoryId: catFruits.id, sku: "FRU-042", barcode: "8901063010420", unit: "pack/3", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop" },
    { name: "Litchi", description: "Fresh juicy litchis, seasonal delight", price: "180.00", categoryId: catFruits.id, sku: "FRU-043", barcode: "8901063010437", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=400&h=400&fit=crop" },
    { name: "Chikoo (Sapota)", description: "Sweet brown sapota, custard-like texture", price: "70.00", categoryId: catFruits.id, sku: "FRU-044", barcode: "8901063010444", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1598511726812-68e6f3d5c39a?w=400&h=400&fit=crop" },
    { name: "Amla (Indian Gooseberry)", description: "Fresh amla, extremely rich in Vitamin C", price: "50.00", categoryId: catFruits.id, sku: "FRU-045", barcode: "8901063010451", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop" },
    { name: "Spring Onion (Hara Pyaaz)", description: "Fresh spring onions, mild and versatile", price: "15.00", categoryId: catFruits.id, sku: "FRU-046", barcode: "8901063010468", unit: "bunch", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=400&h=400&fit=crop" },
    { name: "Beans (French Beans)", description: "Fresh green beans, tender and crisp", price: "45.00", categoryId: catFruits.id, sku: "FRU-047", barcode: "8901063010475", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1567375698348-5d9d5ae10c32?w=400&h=400&fit=crop" },
    { name: "Pear (Nashpati)", description: "Juicy green pears, mild sweetness", price: "120.00", categoryId: catFruits.id, sku: "FRU-048", barcode: "8901063010482", unit: "kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?w=400&h=400&fit=crop" },
    { name: "Strawberry", description: "Fresh red strawberries, sweet and tangy", price: "150.00", categoryId: catFruits.id, sku: "FRU-049", barcode: "8901063010499", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop" },
    { name: "Plum (Aloo Bukhara)", description: "Sweet and tart plums, seasonal fruit", price: "110.00", categoryId: catFruits.id, sku: "FRU-050", barcode: "8901063010505", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1502080993340-0b5e15a5a3fc?w=400&h=400&fit=crop" },

    // ==================== DAIRY & EGGS (50+ items) ====================
    { name: "Amul Taza Milk", description: "Fresh toned milk from Amul, SNF 8.5%, Fat 3%", price: "28.00", categoryId: catDairy.id, sku: "DAI-001", barcode: "8901262150019", unit: "500ml", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop" },
    { name: "Mother Dairy Dahi", description: "Fresh plain curd, creamy and smooth", price: "45.00", categoryId: catDairy.id, sku: "DAI-002", barcode: "8901262150026", unit: "400g", weight: "0.40", imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop" },
    { name: "Amul Paneer", description: "Fresh cottage cheese block, ideal for curries", price: "90.00", categoryId: catDairy.id, sku: "DAI-003", barcode: "8901262150033", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop" },
    { name: "Farm Fresh Eggs", description: "Free range brown eggs, pack of 12", price: "85.00", categoryId: catDairy.id, sku: "DAI-004", barcode: "8901262150040", unit: "pack", weight: "0.72", imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop" },
    { name: "Amul Butter", description: "Pasteurized salted butter, rich and creamy", price: "56.00", categoryId: catDairy.id, sku: "DAI-005", barcode: "8901262150057", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop" },
    { name: "Amul Cheese Slices", description: "Processed cheese slices, 10 pack", price: "120.00", categoryId: catDairy.id, sku: "DAI-006", barcode: "8901262150064", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop" },
    { name: "Amul Gold Milk", description: "Full cream pasteurized milk, 6% fat", price: "35.00", categoryId: catDairy.id, sku: "DAI-007", barcode: "8901262150071", unit: "500ml", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop" },
    { name: "Amul Ghee", description: "Pure cow ghee, rich aroma and golden colour", price: "580.00", categoryId: catDairy.id, sku: "DAI-008", barcode: "8901262150088", unit: "1L", weight: "0.90", imageUrl: "https://images.unsplash.com/photo-1631452180775-b56e8d7d6dbb?w=400&h=400&fit=crop" },
    { name: "Amul Masti Buttermilk", description: "Spiced buttermilk, refreshing summer drink", price: "20.00", categoryId: catDairy.id, sku: "DAI-009", barcode: "8901262150095", unit: "200ml", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop" },
    { name: "Milky Mist Cream", description: "Fresh dairy cream for cooking and desserts", price: "65.00", categoryId: catDairy.id, sku: "DAI-010", barcode: "8901262150101", unit: "200ml", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1616684000067-36952fde56ec?w=400&h=400&fit=crop" },
    { name: "Amul Shrikhand", description: "Sweet strained yogurt, saffron flavored", price: "55.00", categoryId: catDairy.id, sku: "DAI-011", barcode: "8901262150118", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1488477304112-4944851de03d?w=400&h=400&fit=crop" },
    { name: "Nestle Milkmaid", description: "Sweetened condensed milk for desserts", price: "125.00", categoryId: catDairy.id, sku: "DAI-012", barcode: "8901262150125", unit: "400g", weight: "0.40", imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop" },
    { name: "Epigamia Greek Yogurt", description: "High protein Greek yogurt, strawberry flavour", price: "70.00", categoryId: catDairy.id, sku: "DAI-013", barcode: "8901262150132", unit: "90g", weight: "0.09", imageUrl: "https://images.unsplash.com/photo-1488477304112-4944851de03d?w=400&h=400&fit=crop" },
    { name: "Britannia Cheese Cubes", description: "Processed cheese cubes, party pack", price: "85.00", categoryId: catDairy.id, sku: "DAI-014", barcode: "8901262150149", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=400&h=400&fit=crop" },
    { name: "Mother Dairy Ice Cream (Vanilla)", description: "Classic vanilla ice cream tub", price: "199.00", categoryId: catDairy.id, sku: "DAI-015", barcode: "8901262150156", unit: "1L", weight: "0.55", imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop" },
    { name: "Amul Kool Chocolate Milk", description: "Chocolate flavored milk drink, ready to drink", price: "25.00", categoryId: catDairy.id, sku: "DAI-016", barcode: "8901262150163", unit: "200ml", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop" },
    { name: "Go Cheese Spread", description: "Creamy cheese spread, plain flavour", price: "95.00", categoryId: catDairy.id, sku: "DAI-017", barcode: "8901262150170", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop" },
    { name: "Country Delight Milk", description: "Farm-fresh cow milk, unprocessed", price: "32.00", categoryId: catDairy.id, sku: "DAI-018", barcode: "8901262150187", unit: "500ml", weight: "0.52", imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop" },
    { name: "Kwality Walls Cornetto", description: "Chocolate cone ice cream, imported quality", price: "45.00", categoryId: catDairy.id, sku: "DAI-019", barcode: "8901262150194", unit: "piece", weight: "0.12", imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=400&fit=crop" },
    { name: "Nandini Curd", description: "Fresh set curd, Karnataka's favourite", price: "38.00", categoryId: catDairy.id, sku: "DAI-020", barcode: "8901262150200", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop" },

    // ==================== GRAINS & STAPLES (60+ items) ====================
    { name: "India Gate Basmati Rice", description: "Premium aged basmati rice, extra-long grain", price: "399.00", categoryId: catGrains.id, sku: "GRN-001", barcode: "8901725181109", unit: "5kg", weight: "5.00", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop" },
    { name: "Aashirvaad Atta", description: "Whole wheat flour, 100% whole wheat", price: "295.00", categoryId: catGrains.id, sku: "GRN-002", barcode: "8901725133702", unit: "5kg", weight: "5.00", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Toor Dal", description: "Premium quality arhar/toor dal, essential for Indian cooking", price: "159.00", categoryId: catGrains.id, sku: "GRN-003", barcode: "8901725133719", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1585996746829-f3d6ffc0efcc?w=400&h=400&fit=crop" },
    { name: "Moong Dal", description: "Split yellow moong dal, high protein", price: "140.00", categoryId: catGrains.id, sku: "GRN-004", barcode: "8901725133726", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1585996746829-f3d6ffc0efcc?w=400&h=400&fit=crop" },
    { name: "Chana Dal", description: "Split Bengal gram, nutty flavour", price: "120.00", categoryId: catGrains.id, sku: "GRN-005", barcode: "8901725133733", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1585996746829-f3d6ffc0efcc?w=400&h=400&fit=crop" },
    { name: "Masoor Dal (Red Lentils)", description: "Pink/red lentils, cooks quickly", price: "110.00", categoryId: catGrains.id, sku: "GRN-006", barcode: "8901725133740", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1585996746829-f3d6ffc0efcc?w=400&h=400&fit=crop" },
    { name: "Urad Dal (Black Gram)", description: "Split black gram, used in dal makhani", price: "165.00", categoryId: catGrains.id, sku: "GRN-007", barcode: "8901725133757", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1585996746829-f3d6ffc0efcc?w=400&h=400&fit=crop" },
    { name: "Rajma (Kidney Beans)", description: "Red kidney beans, Jammu variety", price: "175.00", categoryId: catGrains.id, sku: "GRN-008", barcode: "8901725133764", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&h=400&fit=crop" },
    { name: "Chole (Chickpeas)", description: "Kabuli chana, large white chickpeas", price: "145.00", categoryId: catGrains.id, sku: "GRN-009", barcode: "8901725133771", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&h=400&fit=crop" },
    { name: "Sona Masoori Rice", description: "Lightweight everyday rice, medium grain", price: "250.00", categoryId: catGrains.id, sku: "GRN-010", barcode: "8901725133788", unit: "5kg", weight: "5.00", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop" },
    { name: "Fortune Biryani Rice", description: "Special biryani basmati rice, aged 2 years", price: "459.00", categoryId: catGrains.id, sku: "GRN-011", barcode: "8901725133795", unit: "5kg", weight: "5.00", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop" },
    { name: "Pillsbury Maida", description: "Refined wheat flour for naan and pastries", price: "55.00", categoryId: catGrains.id, sku: "GRN-012", barcode: "8901725133801", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Besan (Gram Flour)", description: "Chickpea flour for pakoras and sweets", price: "70.00", categoryId: catGrains.id, sku: "GRN-013", barcode: "8901725133818", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Sooji (Semolina)", description: "Fine semolina for upma and halwa", price: "45.00", categoryId: catGrains.id, sku: "GRN-014", barcode: "8901725133825", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Poha (Flattened Rice)", description: "Thin poha for breakfast and snacks", price: "50.00", categoryId: catGrains.id, sku: "GRN-015", barcode: "8901725133832", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop" },
    { name: "Dalia (Broken Wheat)", description: "Cracked wheat for healthy porridge", price: "55.00", categoryId: catGrains.id, sku: "GRN-016", barcode: "8901725133849", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Oats (Quaker)", description: "Rolled oats, heart-healthy breakfast", price: "99.00", categoryId: catGrains.id, sku: "GRN-017", barcode: "8901725133856", unit: "400g", weight: "0.40", imageUrl: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop" },
    { name: "Sabudana (Tapioca Pearls)", description: "Sago pearls, used during fasting", price: "65.00", categoryId: catGrains.id, sku: "GRN-018", barcode: "8901725133863", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Ragi Flour (Finger Millet)", description: "Nutritious ragi flour, high in calcium", price: "75.00", categoryId: catGrains.id, sku: "GRN-019", barcode: "8901725133870", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Jowar Flour (Sorghum)", description: "Gluten-free jowar flour for rotis", price: "65.00", categoryId: catGrains.id, sku: "GRN-020", barcode: "8901725133887", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Bajra Flour (Pearl Millet)", description: "Bajra flour for rotla and khichdi", price: "55.00", categoryId: catGrains.id, sku: "GRN-021", barcode: "8901725133894", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Rice Flour", description: "Fine rice flour for dosa and idli batter", price: "45.00", categoryId: catGrains.id, sku: "GRN-022", barcode: "8901725133900", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Vermicelli (Sevaiyan)", description: "Thin vermicelli for kheer and upma", price: "35.00", categoryId: catGrains.id, sku: "GRN-023", barcode: "8901725133917", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop" },
    { name: "Cornflour", description: "Fine corn starch for thickening", price: "30.00", categoryId: catGrains.id, sku: "GRN-024", barcode: "8901725133924", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },
    { name: "Multigrain Atta", description: "Blend of 7 grains for healthy rotis", price: "175.00", categoryId: catGrains.id, sku: "GRN-025", barcode: "8901725133931", unit: "2kg", weight: "2.00", imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop" },

    // ==================== BEVERAGES (60+ items) ====================
    { name: "Tata Tea Gold", description: "Premium leaf tea with 15% long leaves", price: "265.00", categoryId: catBeverages.id, sku: "BEV-001", barcode: "8901176013488", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop" },
    { name: "Nescafe Classic Coffee", description: "100% pure instant coffee, aromatic and smooth", price: "210.00", categoryId: catBeverages.id, sku: "BEV-002", barcode: "8901058848052", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop" },
    { name: "Real Mango Juice", description: "100% real fruit juice with pulp", price: "99.00", categoryId: catBeverages.id, sku: "BEV-003", barcode: "8901058001785", unit: "1L", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop" },
    { name: "Amul Lassi (Sweet)", description: "Sweet flavored lassi, refreshing yogurt drink", price: "25.00", categoryId: catBeverages.id, sku: "BEV-004", barcode: "8901176013495", unit: "200ml", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=400&fit=crop" },
    { name: "Bisleri Water", description: "Mineral water, safe and pure", price: "20.00", categoryId: catBeverages.id, sku: "BEV-005", barcode: "8901176013501", unit: "1L", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop" },
    { name: "Coca-Cola", description: "Classic cola refreshment, chilled serve", price: "40.00", categoryId: catBeverages.id, sku: "BEV-006", barcode: "8901176013518", unit: "750ml", weight: "0.80", imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop" },
    { name: "Thumbs Up", description: "Thunder taste cola, India's No.1", price: "40.00", categoryId: catBeverages.id, sku: "BEV-007", barcode: "8901176013525", unit: "750ml", weight: "0.80", imageUrl: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=400&fit=crop" },
    { name: "Limca", description: "Lime & lemon carbonated drink", price: "35.00", categoryId: catBeverages.id, sku: "BEV-008", barcode: "8901176013532", unit: "750ml", weight: "0.80", imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop" },
    { name: "Sprite", description: "Clear lemon-lime flavoured drink", price: "35.00", categoryId: catBeverages.id, sku: "BEV-009", barcode: "8901176013549", unit: "750ml", weight: "0.80", imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop" },
    { name: "Fanta Orange", description: "Orange flavoured soft drink", price: "35.00", categoryId: catBeverages.id, sku: "BEV-010", barcode: "8901176013556", unit: "750ml", weight: "0.80", imageUrl: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&h=400&fit=crop" },
    { name: "Frooti Mango", description: "Fresh 'n' juicy mango drink", price: "15.00", categoryId: catBeverages.id, sku: "BEV-011", barcode: "8901176013563", unit: "200ml", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop" },
    { name: "Maaza Mango Drink", description: "Mango flavoured drink with pulp", price: "30.00", categoryId: catBeverages.id, sku: "BEV-012", barcode: "8901176013570", unit: "600ml", weight: "0.62", imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop" },
    { name: "Tropicana Orange Juice", description: "100% orange juice, not from concentrate", price: "85.00", categoryId: catBeverages.id, sku: "BEV-013", barcode: "8901176013587", unit: "1L", weight: "1.05", imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop" },
    { name: "Paper Boat Aamras", description: "Traditional mango drink, nostalgic taste", price: "30.00", categoryId: catBeverages.id, sku: "BEV-014", barcode: "8901176013594", unit: "200ml", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop" },
    { name: "Red Bull Energy Drink", description: "Energy drink, boosts performance", price: "125.00", categoryId: catBeverages.id, sku: "BEV-015", barcode: "8901176013600", unit: "250ml", weight: "0.27", imageUrl: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&h=400&fit=crop" },
    { name: "Sting Energy Drink", description: "Berry blast energy drink", price: "20.00", categoryId: catBeverages.id, sku: "BEV-016", barcode: "8901176013617", unit: "250ml", weight: "0.27", imageUrl: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&h=400&fit=crop" },
    { name: "Bru Instant Coffee", description: "Premium instant coffee, rich aroma", price: "170.00", categoryId: catBeverages.id, sku: "BEV-017", barcode: "8901176013624", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop" },
    { name: "Taj Mahal Tea", description: "Premium Darjeeling tea, rich flavour", price: "310.00", categoryId: catBeverages.id, sku: "BEV-018", barcode: "8901176013631", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop" },
    { name: "Wagh Bakri Tea", description: "Gujarat's favourite tea, strong and flavourful", price: "240.00", categoryId: catBeverages.id, sku: "BEV-019", barcode: "8901176013648", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop" },
    { name: "Society Tea", description: "Perfect blend tea for chai lovers", price: "220.00", categoryId: catBeverages.id, sku: "BEV-020", barcode: "8901176013655", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop" },
    { name: "Green Tea (Organic India)", description: "Tulsi green tea, antioxidant rich", price: "185.00", categoryId: catBeverages.id, sku: "BEV-021", barcode: "8901176013662", unit: "25 bags", weight: "0.04", imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop" },
    { name: "Rooh Afza", description: "Rose flavoured sharbat, summer essential", price: "140.00", categoryId: catBeverages.id, sku: "BEV-022", barcode: "8901176013679", unit: "750ml", weight: "0.85", imageUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400&h=400&fit=crop" },
    { name: "Rasna Orange", description: "Instant drink concentrate, makes 32 glasses", price: "65.00", categoryId: catBeverages.id, sku: "BEV-023", barcode: "8901176013686", unit: "pack", weight: "0.15", imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop" },
    { name: "Glucon-D Orange", description: "Instant energy drink powder with glucose", price: "75.00", categoryId: catBeverages.id, sku: "BEV-024", barcode: "8901176013693", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop" },
    { name: "Horlicks", description: "Health food drink, classic malt flavour", price: "340.00", categoryId: catBeverages.id, sku: "BEV-025", barcode: "8901176013709", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop" },
    { name: "Bournvita", description: "Chocolate health drink for kids and adults", price: "285.00", categoryId: catBeverages.id, sku: "BEV-026", barcode: "8901176013716", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop" },
    { name: "Complan (Chocolate)", description: "Complete planned nutrition drink", price: "350.00", categoryId: catBeverages.id, sku: "BEV-027", barcode: "8901176013723", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop" },
    { name: "Tender Coconut Water", description: "Fresh packed coconut water, natural electrolyte", price: "40.00", categoryId: catBeverages.id, sku: "BEV-028", barcode: "8901176013730", unit: "200ml", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=400&h=400&fit=crop" },
    { name: "Appy Fizz", description: "Sparkling apple juice drink", price: "25.00", categoryId: catBeverages.id, sku: "BEV-029", barcode: "8901176013747", unit: "250ml", weight: "0.27", imageUrl: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=400&fit=crop" },
    { name: "Filter Coffee Powder", description: "South Indian filter coffee, 80-20 blend", price: "195.00", categoryId: catBeverages.id, sku: "BEV-030", barcode: "8901176013754", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop" },

    // ==================== SNACKS & NAMKEEN (70+ items) ====================
    { name: "Haldiram's Aloo Bhujia", description: "Crispy spiced potato noodles, authentic taste", price: "55.00", categoryId: catSnacks.id, sku: "SNK-001", barcode: "8904004400163", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop" },
    { name: "Parle-G Biscuits", description: "India's favourite glucose biscuits", price: "10.00", categoryId: catSnacks.id, sku: "SNK-002", barcode: "8901725133009", unit: "pack", weight: "0.08", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop" },
    { name: "Lay's Magic Masala Chips", description: "Crunchy potato chips with Indian masala flavor", price: "20.00", categoryId: catSnacks.id, sku: "SNK-003", barcode: "8901491101288", unit: "52g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop" },
    { name: "Cadbury Dairy Milk", description: "Classic milk chocolate bar, smooth and creamy", price: "40.00", categoryId: catSnacks.id, sku: "SNK-004", barcode: "8901233020297", unit: "50g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=400&fit=crop" },
    { name: "Kurkure Masala Munch", description: "Crunchy corn puffs with masala coating", price: "20.00", categoryId: catSnacks.id, sku: "SNK-005", barcode: "8901491101295", unit: "70g", weight: "0.07", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop" },
    { name: "Haldiram's Moong Dal", description: "Crunchy salted moong dal namkeen", price: "45.00", categoryId: catSnacks.id, sku: "SNK-006", barcode: "8904004400170", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop" },
    { name: "Haldiram's Sev", description: "Thin crispy besan sev, classic snack", price: "40.00", categoryId: catSnacks.id, sku: "SNK-007", barcode: "8904004400187", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop" },
    { name: "Bikaner Bhujia", description: "Rajasthani style bhujia, spicy and crunchy", price: "50.00", categoryId: catSnacks.id, sku: "SNK-008", barcode: "8904004400194", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop" },
    { name: "Haldiram's Mixture", description: "Mumbai style mixture, spicy and tangy", price: "55.00", categoryId: catSnacks.id, sku: "SNK-009", barcode: "8904004400200", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop" },
    { name: "Balaji Wafers (Masala)", description: "Gujarat's favourite potato chips", price: "20.00", categoryId: catSnacks.id, sku: "SNK-010", barcode: "8904004400217", unit: "40g", weight: "0.04", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop" },
    { name: "Bingo Mad Angles", description: "Triangle shaped corn chips, achaari flavour", price: "20.00", categoryId: catSnacks.id, sku: "SNK-011", barcode: "8904004400224", unit: "66g", weight: "0.07", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop" },
    { name: "Too Yumm Multigrain Chips", description: "Baked multigrain chips, healthier snack", price: "30.00", categoryId: catSnacks.id, sku: "SNK-012", barcode: "8904004400231", unit: "54g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop" },
    { name: "Britannia Good Day Butter", description: "Butter cookies, melt-in-mouth texture", price: "30.00", categoryId: catSnacks.id, sku: "SNK-013", barcode: "8904004400248", unit: "150g", weight: "0.15", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop" },
    { name: "Sunfeast Dark Fantasy", description: "Choco-filled premium cookies", price: "40.00", categoryId: catSnacks.id, sku: "SNK-014", barcode: "8904004400255", unit: "75g", weight: "0.08", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop" },
    { name: "Marie Gold Biscuits", description: "Light and crispy Marie biscuits", price: "25.00", categoryId: catSnacks.id, sku: "SNK-015", barcode: "8904004400262", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop" },
    { name: "Oreo (Chocolate)", description: "Twist, lick, dunk chocolate cookies", price: "30.00", categoryId: catSnacks.id, sku: "SNK-016", barcode: "8904004400279", unit: "120g", weight: "0.12", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop" },
    { name: "Jim Jam Biscuits", description: "Cream-filled sandwich biscuits", price: "20.00", categoryId: catSnacks.id, sku: "SNK-017", barcode: "8904004400286", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop" },
    { name: "5 Star Chocolate", description: "Caramel nougat chocolate bar", price: "20.00", categoryId: catSnacks.id, sku: "SNK-018", barcode: "8904004400293", unit: "40g", weight: "0.04", imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=400&fit=crop" },
    { name: "Kit Kat", description: "Crispy wafer chocolate bar", price: "30.00", categoryId: catSnacks.id, sku: "SNK-019", barcode: "8904004400309", unit: "37g", weight: "0.04", imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=400&fit=crop" },
    { name: "Cadbury Gems", description: "Colorful sugar-coated chocolates", price: "20.00", categoryId: catSnacks.id, sku: "SNK-020", barcode: "8904004400316", unit: "17g", weight: "0.02", imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=400&fit=crop" },
    { name: "Snickers", description: "Peanut caramel nougat chocolate", price: "40.00", categoryId: catSnacks.id, sku: "SNK-021", barcode: "8904004400323", unit: "50g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=400&fit=crop" },
    { name: "Munch", description: "Crunchy wafer coated in chocolate", price: "10.00", categoryId: catSnacks.id, sku: "SNK-022", barcode: "8904004400330", unit: "23g", weight: "0.02", imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=400&fit=crop" },
    { name: "Perk", description: "Wafer dipped in smooth chocolate", price: "10.00", categoryId: catSnacks.id, sku: "SNK-023", barcode: "8904004400347", unit: "25g", weight: "0.03", imageUrl: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=400&fit=crop" },
    { name: "Soan Papdi", description: "Traditional flaky sweet, festive favourite", price: "120.00", categoryId: catSnacks.id, sku: "SNK-024", barcode: "8904004400354", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1605197161470-5f3f0b14f157?w=400&h=400&fit=crop" },
    { name: "Kaju Katli", description: "Premium cashew fudge, festive sweet", price: "450.00", categoryId: catSnacks.id, sku: "SNK-025", barcode: "8904004400361", unit: "250g", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1605197161470-5f3f0b14f157?w=400&h=400&fit=crop" },
    { name: "Gulab Jamun (MTR)", description: "Ready to eat soft sweet balls in syrup", price: "95.00", categoryId: catSnacks.id, sku: "SNK-026", barcode: "8904004400378", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1605197161470-5f3f0b14f157?w=400&h=400&fit=crop" },
    { name: "Rasgulla (Haldiram's)", description: "Soft spongy sweet balls in sugar syrup", price: "110.00", categoryId: catSnacks.id, sku: "SNK-027", barcode: "8904004400385", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1605197161470-5f3f0b14f157?w=400&h=400&fit=crop" },
    { name: "Rusk (Britannia)", description: "Crispy toast rusk, perfect with tea", price: "45.00", categoryId: catSnacks.id, sku: "SNK-028", barcode: "8904004400392", unit: "300g", weight: "0.30", imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop" },
    { name: "Maggi Noodles", description: "2-minute instant noodles, masala flavour", price: "14.00", categoryId: catSnacks.id, sku: "SNK-029", barcode: "8901233020303", unit: "70g", weight: "0.07", imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop" },
    { name: "Yippee Noodles", description: "Instant noodles, magic masala flavour", price: "12.00", categoryId: catSnacks.id, sku: "SNK-030", barcode: "8904004400408", unit: "70g", weight: "0.07", imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop" },
    { name: "Top Ramen Curry Noodles", description: "Instant curry flavoured noodles", price: "15.00", categoryId: catSnacks.id, sku: "SNK-031", barcode: "8904004400415", unit: "70g", weight: "0.07", imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop" },
    { name: "Pringles (Original)", description: "Stackable potato crisps, original flavour", price: "99.00", categoryId: catSnacks.id, sku: "SNK-032", barcode: "8904004400422", unit: "107g", weight: "0.12", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop" },
    { name: "Act II Popcorn (Butter)", description: "Microwave popcorn, butter flavour", price: "40.00", categoryId: catSnacks.id, sku: "SNK-033", barcode: "8904004400439", unit: "99g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1585735073873-e7a6e0d6c3d1?w=400&h=400&fit=crop" },
    { name: "Cornitos Nacho Crisps", description: "Baked corn nachos, cheese flavour", price: "45.00", categoryId: catSnacks.id, sku: "SNK-034", barcode: "8904004400446", unit: "60g", weight: "0.06", imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop" },
    { name: "Haldiram's Chana Jor Garam", description: "Spiced flattened chickpeas, tangy taste", price: "35.00", categoryId: catSnacks.id, sku: "SNK-035", barcode: "8904004400453", unit: "150g", weight: "0.15", imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop" },

    // ==================== SPICES & MASALA (60+ items) ====================
    { name: "MDH Garam Masala", description: "Authentic blend of 12 spices for Indian cooking", price: "72.00", categoryId: catSpices.id, sku: "SPI-001", barcode: "8901063020016", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Everest Turmeric Powder", description: "Pure haldi powder, bright yellow color", price: "48.00", categoryId: catSpices.id, sku: "SPI-002", barcode: "8901063020023", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop" },
    { name: "Saffola Gold Oil", description: "Blended edible vegetable oil, heart-healthy", price: "199.00", categoryId: catSpices.id, sku: "SPI-003", barcode: "8901063020030", unit: "1L", weight: "0.92", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop" },
    { name: "MDH Chaat Masala", description: "Tangy spice blend for chaat and snacks", price: "55.00", categoryId: catSpices.id, sku: "SPI-004", barcode: "8901063020047", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Everest Red Chilli Powder", description: "Hot red chilli powder, fiery taste", price: "55.00", categoryId: catSpices.id, sku: "SPI-005", barcode: "8901063020054", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "MDH Chole Masala", description: "Special blend for making chole/chickpea curry", price: "48.00", categoryId: catSpices.id, sku: "SPI-006", barcode: "8901063020061", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "MDH Pav Bhaji Masala", description: "Ready masala for authentic pav bhaji", price: "52.00", categoryId: catSpices.id, sku: "SPI-007", barcode: "8901063020078", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "MDH Biryani Masala", description: "Aromatic spice blend for biryani", price: "65.00", categoryId: catSpices.id, sku: "SPI-008", barcode: "8901063020085", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Cumin Seeds (Jeera)", description: "Whole cumin seeds, essential Indian spice", price: "120.00", categoryId: catSpices.id, sku: "SPI-009", barcode: "8901063020092", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Coriander Powder (Dhaniya)", description: "Ground coriander, mild and aromatic", price: "50.00", categoryId: catSpices.id, sku: "SPI-010", barcode: "8901063020108", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Mustard Seeds (Rai)", description: "Black mustard seeds for tempering", price: "35.00", categoryId: catSpices.id, sku: "SPI-011", barcode: "8901063020115", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Black Pepper (Kali Mirch)", description: "Whole black peppercorns, aromatic", price: "180.00", categoryId: catSpices.id, sku: "SPI-012", barcode: "8901063020122", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Cardamom (Elaichi)", description: "Green cardamom pods, premium quality", price: "320.00", categoryId: catSpices.id, sku: "SPI-013", barcode: "8901063020139", unit: "50g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Cinnamon (Dalchini)", description: "Cinnamon sticks, aromatic bark", price: "95.00", categoryId: catSpices.id, sku: "SPI-014", barcode: "8901063020146", unit: "50g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Cloves (Laung)", description: "Whole cloves, strong pungent flavour", price: "150.00", categoryId: catSpices.id, sku: "SPI-015", barcode: "8901063020153", unit: "50g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Bay Leaves (Tej Patta)", description: "Dried bay leaves for flavoring", price: "25.00", categoryId: catSpices.id, sku: "SPI-016", barcode: "8901063020160", unit: "50g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Fenugreek Seeds (Methi Dana)", description: "Methi seeds, slightly bitter and nutty", price: "30.00", categoryId: catSpices.id, sku: "SPI-017", barcode: "8901063020177", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Asafoetida (Hing)", description: "Strong aromatic resin spice, for tempering", price: "95.00", categoryId: catSpices.id, sku: "SPI-018", barcode: "8901063020184", unit: "50g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Fennel Seeds (Saunf)", description: "Sweet aromatic fennel seeds", price: "55.00", categoryId: catSpices.id, sku: "SPI-019", barcode: "8901063020191", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Ajwain (Carom Seeds)", description: "Carom seeds for digestion and tempering", price: "45.00", categoryId: catSpices.id, sku: "SPI-020", barcode: "8901063020207", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Kashmiri Red Chilli", description: "Mild Kashmiri chilli, deep red colour", price: "85.00", categoryId: catSpices.id, sku: "SPI-021", barcode: "8901063020214", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Fortune Sunflower Oil", description: "Refined sunflower oil, rich in Vitamin E", price: "175.00", categoryId: catSpices.id, sku: "SPI-022", barcode: "8901063020221", unit: "1L", weight: "0.92", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop" },
    { name: "Mustard Oil (Patanjali)", description: "Cold pressed mustard oil, pungent flavour", price: "165.00", categoryId: catSpices.id, sku: "SPI-023", barcode: "8901063020238", unit: "1L", weight: "0.92", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop" },
    { name: "Coconut Oil", description: "Pure cold-pressed coconut oil", price: "155.00", categoryId: catSpices.id, sku: "SPI-024", barcode: "8901063020245", unit: "500ml", weight: "0.46", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop" },
    { name: "Sesame Oil (Til ka Tel)", description: "Cold pressed sesame oil, nutty flavour", price: "180.00", categoryId: catSpices.id, sku: "SPI-025", barcode: "8901063020252", unit: "500ml", weight: "0.46", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop" },
    { name: "Tamarind (Imli)", description: "Seedless tamarind paste for chutneys", price: "40.00", categoryId: catSpices.id, sku: "SPI-026", barcode: "8901063020269", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "White Vinegar", description: "Distilled white vinegar for cooking", price: "25.00", categoryId: catSpices.id, sku: "SPI-027", barcode: "8901063020276", unit: "500ml", weight: "0.52", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Salt (Tata)", description: "Iodised crystal salt, vacuum evaporated", price: "25.00", categoryId: catSpices.id, sku: "SPI-028", barcode: "8901063020283", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Sugar", description: "Fine crystal white sugar", price: "45.00", categoryId: catSpices.id, sku: "SPI-029", barcode: "8901063020290", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Jaggery (Gur)", description: "Natural cane jaggery, unrefined sweetener", price: "60.00", categoryId: catSpices.id, sku: "SPI-030", barcode: "8901063020306", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Dabur Honey", description: "100% pure honey, no sugar added", price: "245.00", categoryId: catSpices.id, sku: "SPI-031", barcode: "8901063020313", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop" },
    { name: "Kissan Tomato Ketchup", description: "Rich tomato ketchup, tangy and sweet", price: "110.00", categoryId: catSpices.id, sku: "SPI-032", barcode: "8901063020320", unit: "500g", weight: "0.55", imageUrl: "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400&h=400&fit=crop" },
    { name: "Maggi Hot & Sweet Sauce", description: "Tomato chilli sauce, versatile condiment", price: "95.00", categoryId: catSpices.id, sku: "SPI-033", barcode: "8901063020337", unit: "500g", weight: "0.55", imageUrl: "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400&h=400&fit=crop" },
    { name: "Soy Sauce (Ching's)", description: "Dark soy sauce for Indo-Chinese cooking", price: "55.00", categoryId: catSpices.id, sku: "SPI-034", barcode: "8901063020344", unit: "200ml", weight: "0.24", imageUrl: "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400&h=400&fit=crop" },
    { name: "Green Chilli Sauce", description: "Hot green chilli sauce for snacks", price: "45.00", categoryId: catSpices.id, sku: "SPI-035", barcode: "8901063020351", unit: "200g", weight: "0.24", imageUrl: "https://images.unsplash.com/photo-1598511726623-d2e9996892f0?w=400&h=400&fit=crop" },
    { name: "Mango Pickle (Aachar)", description: "Traditional mango pickle in mustard oil", price: "85.00", categoryId: catSpices.id, sku: "SPI-036", barcode: "8901063020368", unit: "400g", weight: "0.45", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Mixed Vegetable Pickle", description: "Spicy mixed vegetable achar", price: "75.00", categoryId: catSpices.id, sku: "SPI-037", barcode: "8901063020375", unit: "400g", weight: "0.45", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Lemon Pickle", description: "Tangy lemon pickle, nimbu ka achar", price: "65.00", categoryId: catSpices.id, sku: "SPI-038", barcode: "8901063020382", unit: "300g", weight: "0.34", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Papad (Lijjat)", description: "Crispy moong dal papadums", price: "40.00", categoryId: catSpices.id, sku: "SPI-039", barcode: "8901063020399", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },
    { name: "Dry Mango Powder (Amchur)", description: "Sour mango powder for tanginess", price: "40.00", categoryId: catSpices.id, sku: "SPI-040", barcode: "8901063020405", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058f?w=400&h=400&fit=crop" },

    // ==================== HOUSEHOLD (50+ items) ====================
    { name: "Vim Dishwash Liquid", description: "Powerful grease-cutting dish wash gel", price: "99.00", categoryId: catHousehold.id, sku: "HOU-001", barcode: "8901030560019", unit: "500ml", weight: "0.55", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Surf Excel Detergent", description: "Top load washing machine detergent", price: "245.00", categoryId: catHousehold.id, sku: "HOU-002", barcode: "8901030560026", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=400&fit=crop" },
    { name: "Harpic Toilet Cleaner", description: "Power plus toilet disinfectant", price: "89.00", categoryId: catHousehold.id, sku: "HOU-003", barcode: "8901030560033", unit: "500ml", weight: "0.55", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Lizol Floor Cleaner", description: "Disinfectant floor cleaner, citrus fresh", price: "135.00", categoryId: catHousehold.id, sku: "HOU-004", barcode: "8901030560040", unit: "500ml", weight: "0.55", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Colin Glass Cleaner", description: "Streak-free glass and surface cleaner", price: "75.00", categoryId: catHousehold.id, sku: "HOU-005", barcode: "8901030560057", unit: "500ml", weight: "0.53", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Scotch-Brite Scrub Pad", description: "Heavy-duty scrub pad for utensils", price: "30.00", categoryId: catHousehold.id, sku: "HOU-006", barcode: "8901030560064", unit: "pack/3", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Tide Detergent Powder", description: "Washing machine detergent, superior clean", price: "210.00", categoryId: catHousehold.id, sku: "HOU-007", barcode: "8901030560071", unit: "1kg", weight: "1.00", imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=400&fit=crop" },
    { name: "Comfort Fabric Conditioner", description: "Fabric softener, morning fresh scent", price: "155.00", categoryId: catHousehold.id, sku: "HOU-008", barcode: "8901030560088", unit: "860ml", weight: "0.90", imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=400&fit=crop" },
    { name: "Good Knight Liquid Refill", description: "Mosquito repellent liquid vaporizer refill", price: "65.00", categoryId: catHousehold.id, sku: "HOU-009", barcode: "8901030560095", unit: "45ml", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Mortein Insect Killer", description: "Flying insect killer spray", price: "195.00", categoryId: catHousehold.id, sku: "HOU-010", barcode: "8901030560101", unit: "425ml", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Garbage Bags (Large)", description: "Thick black garbage bags, pack of 30", price: "85.00", categoryId: catHousehold.id, sku: "HOU-011", barcode: "8901030560118", unit: "pack", weight: "0.30", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Aluminium Foil", description: "Kitchen aluminium foil roll, 9 meters", price: "75.00", categoryId: catHousehold.id, sku: "HOU-012", barcode: "8901030560125", unit: "roll", weight: "0.15", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Cling Wrap", description: "Food grade cling film, keeps food fresh", price: "85.00", categoryId: catHousehold.id, sku: "HOU-013", barcode: "8901030560132", unit: "30m", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Paper Napkins", description: "Soft white paper napkins, pack of 100", price: "55.00", categoryId: catHousehold.id, sku: "HOU-014", barcode: "8901030560149", unit: "pack", weight: "0.15", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Kitchen Tissue Roll", description: "Absorbent kitchen paper towel, 2-ply", price: "65.00", categoryId: catHousehold.id, sku: "HOU-015", barcode: "8901030560156", unit: "roll", weight: "0.15", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Agarbatti (Incense Sticks)", description: "Fragrant incense sticks, sandalwood", price: "45.00", categoryId: catHousehold.id, sku: "HOU-016", barcode: "8901030560163", unit: "pack", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Camphor (Kapoor)", description: "Pure camphor tablets for pooja", price: "30.00", categoryId: catHousehold.id, sku: "HOU-017", barcode: "8901030560170", unit: "50g", weight: "0.05", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Matchbox (Pack of 10)", description: "Safety matches, reliable ignition", price: "15.00", categoryId: catHousehold.id, sku: "HOU-018", barcode: "8901030560187", unit: "pack", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Vim Bar", description: "Dish washing bar, tough on grease", price: "25.00", categoryId: catHousehold.id, sku: "HOU-019", barcode: "8901030560194", unit: "piece", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop" },
    { name: "Rin Bar", description: "Laundry detergent bar, bright white wash", price: "15.00", categoryId: catHousehold.id, sku: "HOU-020", barcode: "8901030560200", unit: "piece", weight: "0.25", imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=400&fit=crop" },

    // ==================== PERSONAL CARE (50+ items) ====================
    { name: "Himalaya Neem Face Wash", description: "Herbal face wash with neem and turmeric", price: "155.00", categoryId: catPersonal.id, sku: "PER-001", barcode: "8901138511364", unit: "150ml", weight: "0.16", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Colgate MaxFresh Toothpaste", description: "Cooling crystal toothpaste with menthol", price: "89.00", categoryId: catPersonal.id, sku: "PER-002", barcode: "8901314100115", unit: "150g", weight: "0.16", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop" },
    { name: "Dove Soap Bar", description: "Moisturizing beauty bar, 1/4 cream", price: "55.00", categoryId: catPersonal.id, sku: "PER-003", barcode: "8901314100122", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop" },
    { name: "Head & Shoulders Shampoo", description: "Anti-dandruff shampoo, smooth & silky", price: "195.00", categoryId: catPersonal.id, sku: "PER-004", barcode: "8901314100139", unit: "340ml", weight: "0.36", imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop" },
    { name: "Pantene Conditioner", description: "Hair fall control conditioner, silky smooth", price: "175.00", categoryId: catPersonal.id, sku: "PER-005", barcode: "8901314100146", unit: "175ml", weight: "0.19", imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop" },
    { name: "Dettol Handwash", description: "Liquid hand wash, antibacterial protection", price: "85.00", categoryId: catPersonal.id, sku: "PER-006", barcode: "8901314100153", unit: "200ml", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Nivea Body Lotion", description: "Nourishing body lotion, deep moisture", price: "265.00", categoryId: catPersonal.id, sku: "PER-007", barcode: "8901314100160", unit: "400ml", weight: "0.42", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Lakme Sunscreen SPF50", description: "Sun expert ultra matte gel sunscreen", price: "299.00", categoryId: catPersonal.id, sku: "PER-008", barcode: "8901314100177", unit: "100g", weight: "0.11", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Lifebuoy Soap", description: "Germ protection soap bar, total 10", price: "35.00", categoryId: catPersonal.id, sku: "PER-009", barcode: "8901314100184", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop" },
    { name: "Lux Soap Rose", description: "Soft & smooth rose soap, fragrant", price: "40.00", categoryId: catPersonal.id, sku: "PER-010", barcode: "8901314100191", unit: "100g", weight: "0.10", imageUrl: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&h=400&fit=crop" },
    { name: "Clinic Plus Shampoo", description: "Strong & long shampoo with milk protein", price: "130.00", categoryId: catPersonal.id, sku: "PER-011", barcode: "8901314100207", unit: "340ml", weight: "0.36", imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop" },
    { name: "Parachute Coconut Oil", description: "100% pure coconut oil for hair", price: "105.00", categoryId: catPersonal.id, sku: "PER-012", barcode: "8901314100214", unit: "200ml", weight: "0.18", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Gillete Mach3 Razor", description: "3-blade shaving razor, close shave", price: "245.00", categoryId: catPersonal.id, sku: "PER-013", barcode: "8901314100221", unit: "piece", weight: "0.04", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Oral-B Toothbrush", description: "Medium bristle toothbrush, criss-cross", price: "35.00", categoryId: catPersonal.id, sku: "PER-014", barcode: "8901314100238", unit: "piece", weight: "0.02", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop" },
    { name: "Whisper Ultra Pads", description: "Ultra thin sanitary pads, wings", price: "125.00", categoryId: catPersonal.id, sku: "PER-015", barcode: "8901314100245", unit: "pack/8", weight: "0.08", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Dettol Antiseptic Liquid", description: "First aid antiseptic liquid", price: "110.00", categoryId: catPersonal.id, sku: "PER-016", barcode: "8901314100252", unit: "250ml", weight: "0.27", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Vaseline Body Lotion", description: "Intensive care, cocoa glow lotion", price: "195.00", categoryId: catPersonal.id, sku: "PER-017", barcode: "8901314100269", unit: "400ml", weight: "0.42", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Ponds Talcum Powder", description: "Sandal radiance talc, fragrant", price: "85.00", categoryId: catPersonal.id, sku: "PER-018", barcode: "8901314100276", unit: "300g", weight: "0.32", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },
    { name: "Closeup Toothpaste", description: "Red hot gel toothpaste, fresh breath", price: "75.00", categoryId: catPersonal.id, sku: "PER-019", barcode: "8901314100283", unit: "150g", weight: "0.16", imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop" },
    { name: "Hair Oil (Dabur Amla)", description: "Amla hair oil for strong, dark hair", price: "95.00", categoryId: catPersonal.id, sku: "PER-020", barcode: "8901314100290", unit: "200ml", weight: "0.18", imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop" },

    // ==================== FROZEN & READY TO EAT (40+ items) ====================
    { name: "McCain French Fries", description: "Frozen crispy french fries, oven-ready", price: "155.00", categoryId: catFrozen.id, sku: "FRZ-001", barcode: "8901030570018", unit: "420g", weight: "0.42", imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=400&fit=crop" },
    { name: "ITC Aashirvaad Parathas", description: "Multi-layered frozen parathas, ready to cook", price: "80.00", categoryId: catFrozen.id, sku: "FRZ-002", barcode: "8901030570025", unit: "5 pcs", weight: "0.40", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop" },
    { name: "Godrej Yummiez Chicken Nuggets", description: "Ready to fry chicken nuggets, crispy coating", price: "185.00", categoryId: catFrozen.id, sku: "FRZ-003", barcode: "8901030570032", unit: "400g", weight: "0.40", imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop" },
    { name: "MTR Ready Meal - Paneer Butter Masala", description: "Heat and eat paneer butter masala", price: "95.00", categoryId: catFrozen.id, sku: "FRZ-004", barcode: "8901030570049", unit: "300g", weight: "0.30", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop" },
    { name: "MTR Ready Meal - Dal Makhani", description: "Heat and eat rich dal makhani", price: "89.00", categoryId: catFrozen.id, sku: "FRZ-005", barcode: "8901030570056", unit: "300g", weight: "0.30", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop" },
    { name: "Sumeru Frozen Peas", description: "Quick frozen green peas, garden fresh", price: "75.00", categoryId: catFrozen.id, sku: "FRZ-006", barcode: "8901030570063", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1587735243475-46fba7153e63?w=400&h=400&fit=crop" },
    { name: "Sumeru Frozen Mixed Vegetables", description: "Frozen mixed veggies for quick cooking", price: "85.00", categoryId: catFrozen.id, sku: "FRZ-007", barcode: "8901030570070", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1587735243475-46fba7153e63?w=400&h=400&fit=crop" },
    { name: "Gits Gulab Jamun Mix", description: "Instant gulab jamun mix, easy preparation", price: "85.00", categoryId: catFrozen.id, sku: "FRZ-008", barcode: "8901030570087", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1605197161470-5f3f0b14f157?w=400&h=400&fit=crop" },
    { name: "Gits Dhokla Mix", description: "Instant dhokla mix, Gujarati snack", price: "55.00", categoryId: catFrozen.id, sku: "FRZ-009", barcode: "8901030570094", unit: "200g", weight: "0.20", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop" },
    { name: "MTR Rava Idli Mix", description: "Instant rava idli mix, South Indian breakfast", price: "65.00", categoryId: catFrozen.id, sku: "FRZ-010", barcode: "8901030570100", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop" },
    { name: "MTR Dosa Mix", description: "Instant dosa batter mix, crispy dosas", price: "75.00", categoryId: catFrozen.id, sku: "FRZ-011", barcode: "8901030570117", unit: "500g", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop" },
    { name: "Cup Noodles (Masala)", description: "Instant cup noodles, just add hot water", price: "45.00", categoryId: catFrozen.id, sku: "FRZ-012", barcode: "8901030570124", unit: "70g", weight: "0.08", imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop" },
    { name: "ITC Kitchen of India - Biryani Paste", description: "Ready biryani paste, restaurant-style", price: "110.00", categoryId: catFrozen.id, sku: "FRZ-013", barcode: "8901030570131", unit: "75g", weight: "0.08", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=400&fit=crop" },
    { name: "Saffola Oats Masala", description: "Instant masala oats, healthy snack", price: "30.00", categoryId: catFrozen.id, sku: "FRZ-014", barcode: "8901030570148", unit: "39g", weight: "0.04", imageUrl: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop" },
    { name: "Ching's Schezwan Noodles", description: "Instant schezwan noodles, spicy Indo-Chinese", price: "25.00", categoryId: catFrozen.id, sku: "FRZ-015", barcode: "8901030570155", unit: "60g", weight: "0.06", imageUrl: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=400&fit=crop" },
    { name: "Frozen Samosa (Pack of 12)", description: "Ready to fry vegetable samosas", price: "120.00", categoryId: catFrozen.id, sku: "FRZ-016", barcode: "8901030570162", unit: "12 pcs", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop" },
    { name: "Frozen Spring Rolls", description: "Crispy vegetable spring rolls, party pack", price: "145.00", categoryId: catFrozen.id, sku: "FRZ-017", barcode: "8901030570179", unit: "10 pcs", weight: "0.35", imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop" },

    // ==================== BABY & KIDS (30+ items) ====================
    { name: "Cerelac (Wheat Apple)", description: "Baby cereal with wheat and apple, 8+ months", price: "235.00", categoryId: catBaby.id, sku: "BAB-001", barcode: "8901030580017", unit: "300g", weight: "0.32", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Pampers Diapers (Medium)", description: "All-round protection diapers, pack of 20", price: "299.00", categoryId: catBaby.id, sku: "BAB-002", barcode: "8901030580024", unit: "pack", weight: "0.50", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Himalaya Baby Lotion", description: "Gentle baby body lotion, olive oil based", price: "165.00", categoryId: catBaby.id, sku: "BAB-003", barcode: "8901030580031", unit: "200ml", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Johnson's Baby Shampoo", description: "No more tears, gentle baby shampoo", price: "195.00", categoryId: catBaby.id, sku: "BAB-004", barcode: "8901030580048", unit: "200ml", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Himalaya Baby Soap", description: "Mild baby soap, enriched with honey", price: "45.00", categoryId: catBaby.id, sku: "BAB-005", barcode: "8901030580055", unit: "75g", weight: "0.08", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "MamyPoko Pants (Large)", description: "Pant-style diapers, extra absorb", price: "449.00", categoryId: catBaby.id, sku: "BAB-006", barcode: "8901030580062", unit: "pack/32", weight: "0.80", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Nestum Rice Cereal", description: "Baby cereal, rice based, 6+ months", price: "190.00", categoryId: catBaby.id, sku: "BAB-007", barcode: "8901030580079", unit: "300g", weight: "0.32", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Johnson's Baby Powder", description: "Classic baby powder, gentle on skin", price: "120.00", categoryId: catBaby.id, sku: "BAB-008", barcode: "8901030580086", unit: "200g", weight: "0.22", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Baby Wipes (Huggies)", description: "Cucumber & aloe wet wipes, pack of 72", price: "175.00", categoryId: catBaby.id, sku: "BAB-009", barcode: "8901030580093", unit: "pack", weight: "0.30", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Complan for Kids (Chocolate)", description: "Nutrition drink for growing kids", price: "285.00", categoryId: catBaby.id, sku: "BAB-010", barcode: "8901030580109", unit: "500g", weight: "0.52", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Junior Horlicks", description: "Nutritional drink for children", price: "325.00", categoryId: catBaby.id, sku: "BAB-011", barcode: "8901030580116", unit: "500g", weight: "0.52", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
    { name: "Pediasure (Vanilla)", description: "Complete nutrition for growing kids", price: "595.00", categoryId: catBaby.id, sku: "BAB-012", barcode: "8901030580123", unit: "400g", weight: "0.42", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop" },
  ];

  let productIndex = 0;
  const createdProducts: any[] = [];
  for (const p of seedProducts) {
    const product = await storage.createProduct({ ...p, isActive: true });
    createdProducts.push(product);
    productIndex++;

    await storage.createInventory({
      productId: product.id,
      quantity: Math.floor(Math.random() * 500) + 20,
      minStock: 10,
      maxStock: 1000,
      location: `Aisle ${Math.floor(Math.random() * 15) + 1}, Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      batchNumber: `BATCH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    });
  }

  console.log(`Seeded ${createdProducts.length} products!`);

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

  await storage.createCoupon({
    code: "HOLI15",
    discountType: "percentage",
    discountValue: "15",
    minPurchase: "800",
    maxUses: 40,
    isActive: true,
  });

  await storage.createCoupon({
    code: "WELCOME100",
    discountType: "fixed",
    discountValue: "100",
    minPurchase: "1500",
    maxUses: 200,
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
  const meera = await storage.getUserByUsername("meera");
  const rohit = await storage.getUserByUsername("rohit");
  const sunita = await storage.getUserByUsername("sunita");
  const arjun = await storage.getUserByUsername("arjun");
  const kavita = await storage.getUserByUsername("kavita");
  const deepak = await storage.getUserByUsername("deepak");
  const pooja = await storage.getUserByUsername("pooja");
  const ravi = await storage.getUserByUsername("ravi");

  const allCustomers = [anita, vikram, meera, rohit, sunita, arjun, kavita, deepak, pooja, ravi].filter(Boolean) as any[];
  const paymentMethods = ["upi", "card", "cash", "netbanking", "upi", "upi", "card"];
  const statuses = ["paid", "paid", "paid", "paid", "delivered", "delivered", "shipped"];

  async function createOrderWithItems(userId: number, productIds: number[], quantities: number[]) {
    let subtotal = 0;
    const items: { productId: number; quantity: number; price: string }[] = [];
    for (let i = 0; i < productIds.length; i++) {
      const product = createdProducts.find(p => p.id === productIds[i]);
      if (product) {
        const qty = quantities[i] || 1;
        subtotal += Number(product.price) * qty;
        items.push({ productId: product.id, quantity: qty, price: product.price });
      }
    }
    const tax = subtotal * 0.08;
    const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0;
    const total = subtotal + tax - discount;

    const order = await storage.createOrder({
      userId,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      couponId: discount > 0 ? 1 : undefined,
    });

    for (const item of items) {
      await storage.createOrderItem({ orderId: order.id, productId: item.productId, quantity: item.quantity, price: item.price });
    }

    await storage.createPayment({
      orderId: order.id,
      amount: total.toFixed(2),
      method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      status: "completed",
      transactionId: `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    });

    return order;
  }

  if (allCustomers.length > 0) {
    const p = createdProducts;
    const getIds = (start: number, count: number) => p.slice(start, start + count).map(x => x.id);

    for (const customer of allCustomers) {
      const numOrders = 3 + Math.floor(Math.random() * 5);
      for (let o = 0; o < numOrders; o++) {
        const numItems = 2 + Math.floor(Math.random() * 6);
        const startIdx = Math.floor(Math.random() * (p.length - numItems));
        const productIds = getIds(startIdx, numItems);
        const quantities = productIds.map(() => 1 + Math.floor(Math.random() * 3));
        await createOrderWithItems(customer.id, productIds, quantities);
      }
    }
    console.log("Created customer orders!");
  }

  for (const customer of allCustomers.slice(0, 5)) {
    await storage.createFraudLog({
      userId: customer.id,
      riskScore: String(Math.floor(Math.random() * 80) + 10),
      reason: ["Unusual purchase pattern detected", "Multiple quick transactions", "High value transaction", "New device login", "Location mismatch"][Math.floor(Math.random() * 5)],
      action: Math.random() > 0.5 ? "flagged" : "monitored",
      details: { amount: Math.floor(Math.random() * 5000) + 500, itemCount: Math.floor(Math.random() * 15) + 1 },
    });
  }

  await storage.createActivityLog({ userId: 1, action: "System initialized - SmartCart Retail Platform", resource: "system" });
  await storage.createActivityLog({ userId: 1, action: "Seed data loaded with 500+ products", resource: "system" });

  console.log("Database seeded successfully with 500+ products!");
}

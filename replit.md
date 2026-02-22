# SmartCart - Intelligent Retail System

## Overview
Cloud-native Smart Retail Cart system with intelligent product scanning, real-time billing, AI-powered recommendations, fraud detection, inventory management, and analytics dashboard. Built for the Indian market with INR pricing, Indian products, and barcode scanning. Built with React + Express + PostgreSQL.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + Recharts + Framer Motion
- **Backend**: Express.js REST API with JWT authentication
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT tokens with bcrypt password hashing, role-based access (customer/manager/admin)
- **AI**: OpenAI via Replit AI Integrations (gpt-5-nano) for product analysis and recommendations
- **Barcode**: html5-qrcode for camera scanning, Open Food Facts API for external product lookup
- **Currency**: Indian Rupees (₹/INR)

## Project Structure
```
client/src/
  pages/          - All page components (auth, dashboard, products, cart, orders, scan, offers, ai-assistant, admin-*)
  components/     - Shared components (app-sidebar, theme-provider, theme-toggle)
  lib/            - Auth context, query client utilities
  hooks/          - Custom hooks (use-toast, use-mobile)
server/
  index.ts        - Express server entry
  routes.ts       - All API routes (auth, cart, products, orders, admin, barcode, AI, offers)
  storage.ts      - Database storage layer (DatabaseStorage)
  auth.ts         - JWT auth middleware and helpers
  db.ts           - Database connection
  seed.ts         - Seed data with Indian products and users
  replit_integrations/ - OpenAI AI integration (chat, image, audio, batch)
shared/
  schema.ts       - Drizzle schema (users, products, categories, carts, orders, payments, offers, conversations, messages)
```

## Key Features
- **Auth**: JWT login/register with account lockout after 5 failed attempts
- **Product Catalog**: Searchable/filterable product listing with categories, INR pricing
- **Barcode Scanner**: Camera-based barcode scanning with html5-qrcode + manual entry + Open Food Facts API fallback
- **AI Product Analysis**: Ingredient analysis, health scoring, benefits/warnings, alternatives via OpenAI
- **AI Recommendations**: Personalized shopping recommendations based on purchase history and available offers
- **Cart**: Add/remove/update quantities, real-time subtotal calculation in ₹
- **Checkout**: Coupon support, tax calculation (8%), fraud scoring
- **Weekend Offers**: Day-specific discount offers (Saturday/Sunday deals on categories)
- **Orders**: Order history with status tracking
- **Admin Dashboard**: Revenue charts, top products, activity feed
- **Analytics**: Sales trends, customer segments, payment methods, inventory status
- **Inventory**: Stock levels, low stock alerts, restock functionality
- **Fraud Detection**: Risk scoring based on transaction patterns
- **Coupons**: Percentage/fixed discounts with usage limits

## Test Accounts
- Admin: username `admin`, password `admin123` (Priya Sharma)
- Manager: username `manager`, password `manager123` (Rajesh Kumar)
- Customer: username `anita`, password `customer123` (Anita Desai)
- Customer: username `vikram`, password `customer123` (Vikram Patel)
- Customer: username `meera`, password `customer123` (Meera Nair)

## Sample Barcodes
- 8901063010017 (Amul Butter)
- 8901262150019 (Haldiram's Aloo Bhujia)
- 8901725181109 (Parle-G Biscuits)
- 8901176013488 (MDH Garam Masala)
- 8904004400163 (Tata Tea Premium)
- 8901233020297 (Maggi Noodles)

## API Routes
All authenticated routes require `Authorization: Bearer <token>` header.
- POST /api/auth/register, POST /api/auth/login
- GET /api/products, GET /api/categories
- GET /api/cart, POST /api/cart/add, PATCH/DELETE /api/cart/item/:id
- POST /api/checkout
- GET /api/orders, GET /api/dashboard/customer, GET /api/recommendations
- GET /api/barcode/:barcode - Barcode lookup (local DB + Open Food Facts fallback)
- GET /api/offers - Get all offers with isApplicableToday flag
- POST /api/ai/analyze-product - AI product analysis (health score, benefits, warnings)
- GET /api/ai/recommendations - AI personalized recommendations
- Admin: GET /api/admin/dashboard, /analytics, /inventory, /orders, /coupons, /users, /fraud-logs, /offers
- Admin: POST /api/admin/offers - Create new offers

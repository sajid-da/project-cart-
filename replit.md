# SmartCart - Intelligent Retail System

## Overview
Cloud-native Smart Retail Cart system with intelligent product scanning, real-time billing, AI-powered recommendations, fraud detection, inventory management, and analytics dashboard. Built with React + Express + PostgreSQL.

## Architecture
- **Frontend**: React + Tailwind CSS + shadcn/ui + Recharts + Framer Motion
- **Backend**: Express.js REST API with JWT authentication
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT tokens with bcrypt password hashing, role-based access (customer/manager/admin)

## Project Structure
```
client/src/
  pages/          - All page components (auth, dashboard, products, cart, orders, admin-*)
  components/     - Shared components (app-sidebar, theme-provider, theme-toggle)
  lib/            - Auth context, query client utilities
  hooks/          - Custom hooks (use-toast, use-mobile)
server/
  index.ts        - Express server entry
  routes.ts       - All API routes (auth, cart, products, orders, admin)
  storage.ts      - Database storage layer (DatabaseStorage)
  auth.ts         - JWT auth middleware and helpers
  db.ts           - Database connection
  seed.ts         - Seed data for initial setup
shared/
  schema.ts       - Drizzle schema (users, products, categories, carts, orders, payments, etc.)
```

## Key Features
- **Auth**: JWT login/register with account lockout after 5 failed attempts
- **Product Catalog**: Searchable/filterable product listing with categories
- **Cart**: Add/remove/update quantities, real-time subtotal calculation
- **Checkout**: Coupon support, tax calculation (8%), fraud scoring
- **Orders**: Order history with status tracking
- **Admin Dashboard**: Revenue charts, top products, activity feed
- **Analytics**: Sales trends, customer segments, payment methods, inventory status
- **Inventory**: Stock levels, low stock alerts, restock functionality
- **Fraud Detection**: Risk scoring based on transaction patterns
- **Coupons**: Percentage/fixed discounts with usage limits

## Test Accounts
- Admin: username `admin`, password `admin123`
- Manager: username `manager`, password `manager123`
- Customer: username `alice`, password `customer123`

## API Routes
All authenticated routes require `Authorization: Bearer <token>` header.
- POST /api/auth/register, POST /api/auth/login
- GET /api/products, GET /api/categories
- GET /api/cart, POST /api/cart/add, PATCH/DELETE /api/cart/item/:id
- POST /api/checkout
- GET /api/orders, GET /api/dashboard/customer, GET /api/recommendations
- Admin: GET /api/admin/dashboard, /analytics, /inventory, /orders, /coupons, /users, /fraud-logs

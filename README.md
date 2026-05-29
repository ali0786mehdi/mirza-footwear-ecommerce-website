# 🥿 Mirza Footwear — Backend API

> A production-grade, fully-typed REST API for a complete ecommerce footwear brand.
> Built step by step with **Express.js + TypeScript + MongoDB + Mongoose**.
> This document is both a project reference AND a complete backend learning guide —
> read it once, understand backend development forever.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Why Each Was Chosen](#2-tech-stack--why-each-was-chosen)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [How I Built This — Step by Step](#4-how-i-built-this--step-by-step)
5. [Environment Setup](#5-environment-setup)
6. [Running the Project](#6-running-the-project)
7. [Complete API Reference](#7-complete-api-reference)
8. [Backend Concepts — The Complete Guide](#8-backend-concepts--the-complete-guide)
   - [What is a Backend?](#81-what-is-a-backend)
   - [What is a REST API?](#82-what-is-a-rest-api)
   - [HTTP Methods & Status Codes](#83-http-methods--status-codes)
   - [MVC + Service Layer Architecture](#84-mvc--service-layer-architecture)
   - [Middleware — The Assembly Line](#85-middleware--the-assembly-line)
   - [Authentication vs Authorization](#86-authentication-vs-authorization)
   - [JWT — How Tokens Work](#87-jwt--how-tokens-work)
   - [Password Hashing with bcrypt](#88-password-hashing-with-bcrypt)
   - [MongoDB & Mongoose — Deep Dive](#89-mongodb--mongoose--deep-dive)
   - [Schemas, Models & Relationships](#810-schemas-models--relationships)
   - [Mongoose Hooks (pre/post)](#811-mongoose-hooks-prepost)
   - [Validation with Zod v4](#812-validation-with-zod-v4)
   - [Error Handling — The Right Way](#813-error-handling--the-right-way)
   - [asyncWrapper — Never Write try/catch Again](#814-asyncwrapper--never-write-trycatch-again)
   - [File Uploads with Multer + Cloudinary](#815-file-uploads-with-multer--cloudinary)
   - [Rate Limiting — Blocking Attacks](#816-rate-limiting--blocking-attacks)
   - [CORS — Cross Origin Resource Sharing](#817-cors--cross-origin-resource-sharing)
   - [Helmet — HTTP Security Headers](#818-helmet--http-security-headers)
   - [Environment Variables & Config Validation](#819-environment-variables--config-validation)
   - [The Service Layer Pattern](#820-the-service-layer-pattern)
   - [Pagination, Filtering & Sorting](#821-pagination-filtering--sorting)
   - [Stripe Payments & Webhooks](#822-stripe-payments--webhooks)
   - [Background Jobs with Bull + Redis](#823-background-jobs-with-bull--redis)
   - [TypeScript in Backend — Why It Matters](#824-typescript-in-backend--why-it-matters)
9. [Database Models — Full Reference](#9-database-models--full-reference)
10. [Security Architecture](#10-security-architecture)
11. [Git Commit Convention](#11-git-commit-convention)
12. [What I Learned Building This](#12-what-i-learned-building-this)

---

## 1. Project Overview

Mirza Footwear is a complete backend API for a footwear ecommerce brand. It handles everything a real production ecommerce system needs:

| Feature | What it does |
|---|---|
| Auth System | Register, login, JWT tokens, password hashing, profile management |
| Product Catalog | CRUD with Cloudinary image uploads, search, filters, pagination |
| Category System | Organize products into men, women, kids, running etc. |
| Shopping Cart | Add items, update quantity, remove items, auto-calculate total |
| Order System | Place orders, auto-deduct inventory, calculate taxes, track status |
| Payment Processing | Stripe payment intents, webhook verification |
| Coupon System | Percentage and fixed discounts with expiry and usage limits |
| Review System | Star ratings, auto-update product average rating |
| Admin Dashboard | Sales stats, manage all orders, users, products |
| Email System | SendGrid transactional emails for order confirmation, welcome |
| Background Jobs | Bull + Redis queues for async email sending |
| Security | Rate limiting, helmet headers, CORS, Zod validation, JWT |

---

## 2. Tech Stack & Why Each Was Chosen

### Node.js
JavaScript runtime that runs on the server. Chosen because it is non-blocking — it can handle thousands of simultaneous requests without creating a new thread for each one. Perfect for an API that handles many users at once.

### Express.js
The most popular Node.js framework. It gives you routing (`app.get`, `app.post`) and middleware (`app.use`). Extremely minimal by design — you add exactly what you need, nothing more. Used by companies like Uber, IBM, and Twitter.

### TypeScript
JavaScript with types. Every variable, function parameter, and return value has a declared type. This catches bugs at compile time instead of at runtime — meaning you find mistakes while writing code, not when customers are using the app. Made this project significantly more reliable.

### MongoDB + MongoDB Atlas
NoSQL database that stores data as JSON-like documents. Chosen for ecommerce because product data is flexible — a running shoe has different fields than a dress shoe. Atlas is the cloud hosting platform — your database lives on MongoDB's servers, not your machine.

### Mongoose
Object Document Mapper (ODM) for MongoDB. Adds schema validation, TypeScript types, middleware hooks, and a clean query API on top of raw MongoDB. Without Mongoose you'd write raw database queries with no structure.

### JWT (jsonwebtoken)
JSON Web Tokens for stateless authentication. The server does not store sessions — it just verifies a cryptographic signature on every request. Scales to millions of users without a session database.

### bcryptjs
Industry-standard password hashing library. Converts plain text passwords into irreversible hashes before storing. Even if the database is stolen, passwords cannot be recovered.

### Zod v4
Runtime schema validation. TypeScript types only exist at compile time — Zod validates actual request data at runtime. Prevents malformed data from ever reaching your database.

### Multer + Cloudinary
Multer parses multipart/form-data (file uploads). Cloudinary stores images in the cloud and returns a URL. Your database stores the URL string — not the actual image bytes.

### Stripe
Industry-standard payment processing. Handles credit cards, UPI, and netbanking. The server creates a Payment Intent, the frontend uses Stripe Elements to collect card details (Stripe handles card data — your server never sees raw card numbers).

### Helmet
Sets secure HTTP headers automatically. Prevents clickjacking, XSS, MIME sniffing attacks with one line of code.

### express-rate-limit
Limits how many requests an IP can make in a time window. Blocks brute force attacks on login and registration.

### Bull + Redis
Bull is a queue library built on Redis. Background jobs — like sending order confirmation emails — are pushed to a queue and processed asynchronously. The API responds instantly; the email sends in the background.

### SendGrid
Transactional email API. Used to send order confirmations, welcome emails, and password reset links programmatically.

---

## 3. Complete Folder Structure

```
mirza-footwear-ecommerce-website/
│
├── frontend/                          ← React app (built separately)
│
└── backend/                           ← Everything documented here
    │
    ├── src/
    │   │
    │   ├── config/                    ← App-wide configuration
    │   │   ├── database.ts            ← MongoDB connection
    │   │   ├── redis.ts               ← Redis client connection
    │   │   ├── env.ts                 ← Env var validation & export
    │   │   └── corsOptions.ts         ← CORS whitelist configuration
    │   │
    │   ├── models/                    ← Mongoose schemas (THE VAULT)
    │   │   ├── User.model.ts          ← Customers & admins
    │   │   ├── Product.model.ts       ← Footwear products with sizes
    │   │   ├── Category.model.ts      ← Product categories
    │   │   ├── Order.model.ts         ← Customer orders
    │   │   ├── Cart.model.ts          ← Shopping cart
    │   │   ├── Review.model.ts        ← Product reviews & ratings
    │   │   └── Coupon.model.ts        ← Discount coupons
    │   │
    │   ├── routes/                    ← URL definitions (THE BRIDGE)
    │   │   ├── auth.routes.ts         ← /api/v1/auth/*
    │   │   ├── product.routes.ts      ← /api/v1/products/*
    │   │   ├── category.routes.ts     ← /api/v1/categories/*
    │   │   ├── cart.routes.ts         ← /api/v1/cart/*
    │   │   ├── order.routes.ts        ← /api/v1/orders/*
    │   │   ├── payment.routes.ts      ← /api/v1/payments/*
    │   │   ├── review.routes.ts       ← /api/v1/reviews/*
    │   │   ├── coupon.routes.ts       ← /api/v1/coupons/*
    │   │   ├── admin.routes.ts        ← /api/v1/admin/*
    │   │   └── user.routes.ts         ← /api/v1/users/*
    │   │
    │   ├── controllers/               ← Request/Response handlers (THE BRIDGE)
    │   │   ├── auth.controller.ts
    │   │   ├── product.controller.ts
    │   │   ├── order.controller.ts
    │   │   ├── cart.controller.ts
    │   │   ├── payment.controller.ts
    │   │   ├── review.controller.ts
    │   │   └── admin.controller.ts
    │   │
    │   ├── services/                  ← Business logic (THE BRAIN)
    │   │   ├── auth.service.ts        ← Register, login, profile, address
    │   │   ├── product.service.ts     ← CRUD, search, filters, pagination
    │   │   ├── category.service.ts    ← Category management
    │   │   ├── order.service.ts       ← Place order, inventory, tax calc
    │   │   ├── cart.service.ts        ← Cart operations
    │   │   ├── payment.service.ts     ← Stripe payment intents
    │   │   ├── coupon.service.ts      ← Validate & apply discounts
    │   │   ├── email.service.ts       ← SendGrid email sending
    │   │   └── upload.service.ts      ← Cloudinary upload/delete
    │   │
    │   ├── middleware/                ← The security & validation chain
    │   │   ├── auth.middleware.ts     ← Verifies JWT token (THE BOUNCER)
    │   │   ├── admin.middleware.ts    ← Checks admin role
    │   │   ├── validate.middleware.ts ← Runs Zod schemas (THE SHIELD)
    │   │   ├── rateLimiter.middleware.ts ← Blocks brute force
    │   │   ├── errorHandler.middleware.ts ← Global error catcher
    │   │   └── upload.middleware.ts   ← Multer file parsing
    │   │
    │   ├── validators/                ← Zod schemas for each route
    │   │   ├── auth.validator.ts      ← Register, login schemas
    │   │   ├── product.validator.ts   ← Create/update product schemas
    │   │   └── order.validator.ts     ← Create order schema
    │   │
    │   ├── utils/                     ← Reusable helper functions
    │   │   ├── jwt.utils.ts           ← generateToken, verifyToken, AuthRequest
    │   │   ├── hash.utils.ts          ← Password hashing helpers
    │   │   ├── apiResponse.utils.ts   ← sendSuccess, sendError
    │   │   ├── asyncWrapper.utils.ts  ← Wraps async controllers
    │   │   └── logger.ts              ← Winston logger
    │   │
    │   ├── integrations/              ← Third-party service configs (THE DIPLOMAT)
    │   │   ├── stripe.ts              ← Stripe client
    │   │   ├── sendgrid.ts            ← SendGrid client
    │   │   ├── cloudinary.ts          ← Cloudinary config
    │   │   └── gemini.ts              ← Google Gemini AI
    │   │
    │   ├── jobs/                      ← Background queues (THE ENGINE)
    │   │   ├── emailQueue.job.ts      ← Async email sending
    │   │   └── inventoryQueue.job.ts  ← Stock sync
    │   │
    │   ├── types/                     ← TypeScript declarations
    │   │   ├── express.d.ts           ← Extends Express Request
    │   │   └── index.d.ts
    │   │
    │   ├── app.ts                     ← Express setup, all middleware registered
    │   └── server.ts                  ← Entry point, connects DB, starts server
    │
    ├── .env                           ← Secret keys (NEVER commit)
    ├── .env.example                   ← Template for other developers
    ├── .gitignore
    ├── tsconfig.json                  ← TypeScript compiler config
    ├── nodemon.json                   ← Hot reload config
    ├── package.json
    └── README.md
```

---

## 4. How I Built This — Step by Step

This is the exact journey of building this backend from scratch. Every decision is explained.

---

### Step 1 — Project Initialization

Started by creating the folder inside the main project:

```bash
mkdir mirza-footwear-ecommerce-website
cd mirza-footwear-ecommerce-website
mkdir backend
cd backend
npm init -y
```

Then installed all dependencies in two commands — runtime dependencies and development dependencies separately:

```bash
# Runtime — needed in production
npm install express mongoose dotenv cors helmet bcryptjs jsonwebtoken \
  express-rate-limit zod multer stripe @sendgrid/mail cloudinary \
  bull ioredis winston slugify

# Development only — TypeScript compiler and type definitions
npm install -D typescript ts-node nodemon @types/express @types/node \
  @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer @types/bull
```

Created the complete folder structure with one bash command and initialized TypeScript:

```bash
mkdir -p src/{config,models,routes,controllers,services,middleware,validators,utils,integrations,jobs,types}
npx tsc --init
```

**Key learning:** Separate devDependencies from dependencies. Your production server should only install what it actually needs to run.

---

### Step 2 — Configuration Layer

Built four config files before writing any business logic:

**`config/env.ts`** — validates all environment variables at startup. If any required variable is missing, the server crashes immediately with a clear error instead of failing mysteriously later during a request.

```typescript
const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env variable: ${key}`)
  return value
}
export const ENV = { MONGO_URI: required("MONGO_URI"), ... }
```

**`config/database.ts`** — connects to MongoDB. Calls `process.exit(1)` on failure because there is no point running a backend with no database.

**`config/corsOptions.ts`** — whitelists only the frontend origins that are allowed to talk to this API. Without this, any website could make requests to your backend.

**`app.ts`** — registered all middleware in the correct order. Order matters in Express — helmet and cors must run before routes, errorHandler must run last.

**`server.ts`** — the entry point. Connects to database first, then starts listening. Handles `unhandledRejection` and `uncaughtException` so even unexpected crashes are logged before the process exits.

---

### Step 3 — The Vault: MongoDB Models

Built all 7 models before any routes. Models define the shape of every piece of data in the system.

**Design decisions made:**

**User model** — `password` field has `select: false`. This means Mongoose never returns the password in any query by default. You have to explicitly request it with `.select("+password")`. This prevents accidentally sending passwords to the frontend.

**Product model** — sizes are stored as an array of `{ size: number, stock: number }` objects because shoes have per-size stock. A size 8 might have 15 pairs but size 12 might have 0. `totalStock` is auto-calculated in a pre-save hook by summing all size stocks.

**Order model** — stores item names, images, and prices as snapshots at the time of purchase. This is critical — if you later change a product's price, old orders should still show the original price the customer paid.

**Review model** — has a compound unique index `{ product: 1, user: 1 }`. This database-level constraint ensures one user can only leave one review per product, even if somehow the application code fails to check.

**Key Mongoose pattern used throughout:**

```typescript
// Throw structured errors from anywhere — asyncWrapper catches them
const error = new Error("Not found") as Error & { statusCode: number }
error.statusCode = 404
throw error
```

---

### Step 4 — The Bouncer + Shield: Security Layer

Built in this order: JWT utils → asyncWrapper → rate limiter → Zod validators → validate middleware → auth middleware → admin middleware.

**The AuthRequest pattern** — instead of using TypeScript's global declaration merging for `req.user` (which had compatibility issues with the installed Mongoose/Express versions), created a custom `AuthRequest` interface that extends Express's `Request`:

```typescript
export interface AuthRequest extends Request {
  user?: JwtPayload
}
```

Any controller that needs `req.user` uses `AuthRequest` instead of `Request`. Public controllers use plain `Request`. This makes it visually obvious which routes are protected.

**Zod v4 breaking changes handled** — Zod v4 removed `required_error` option and renamed `error.errors` to `error.issues`. Both were fixed in the validators and validate middleware.

---

### Step 5 — Auth Service, Controller & Routes

First real API endpoints. This step revealed the full request lifecycle in practice.

**The sanitizeUser pattern** — before sending any user data to the frontend, a helper function strips sensitive fields:

```typescript
const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  // password is never included here
})
```

**Security decision on login error messages** — both "email not found" and "wrong password" return the same error: "Invalid email or password". This prevents **user enumeration** — an attacker testing which emails are registered.

**Address management** — when a new address is marked as default, all other addresses are first set to `isDefault: false` before saving. The first address added is automatically made default.

---

### Step 6 — Products, Categories & Image Upload

Most complex step. Three major pieces working together:

**Cloudinary integration** — images are uploaded as streams from memory. The `upload_stream` API takes a Node.js Buffer and sends it directly to Cloudinary without writing to disk first. Each image is automatically transformed to max 800x800, compressed, and converted to the optimal format (WebP/AVIF) by Cloudinary.

**Multer configuration** — uses `memoryStorage()` so files never touch the filesystem. The file buffer goes straight from the HTTP request to Cloudinary. Max 5 images per product, 5MB per file, JPEG/PNG/WebP only.

**Slug generation** — product names are converted to URL-friendly slugs using `slugify`. "Mirza Air Runner" becomes "mirza-air-runner". If the slug already exists, a timestamp is appended to make it unique.

**Multipart form-data parsing challenge** — when sending files and JSON together, everything arrives as strings. Numbers and arrays from the form must be manually parsed:

```typescript
if (typeof req.body.sizes === "string") {
  req.body.sizes = JSON.parse(req.body.sizes)
}
req.body.price = parseFloat(req.body.price)
```
### Step 7 — Cart Service, Controller & Routes

Built the complete shopping cart system with smart merging logic.

Key decisions:
- Cart is one document per user (unique index on user field)
- Adding same product + same size merges quantity instead of creating duplicate
- Price is snapshotted at time of adding — if admin changes price later, cart still shows original price
- totalAmount auto-calculated in pre-save hook — never calculated manually
- `/clear` route defined before `/:itemId` route — otherwise Express treats "clear" as an itemId

TypeScript fixes in this step:
- ICartItem interface needed _id?: mongoose.Types.ObjectId (same pattern as IAddress)
- Zod v4: removed all required_error and invalid_type_error options from cart.validator.ts

**TypeScript challenge resolved** — Mongoose's `.sort()` method requires `Record<string, SortOrder>` not `Record<string, unknown>`. Importing `SortOrder` from mongoose and using it as the type fixed the compiler error.

---

## 5. Environment Setup

Create `.env` in the `backend/` folder:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mirza-footwear?retryWrites=true&w=majority

# JWT — minimum 32 characters, random string
JWT_SECRET=mirza_footwear_super_secret_jwt_key_2026_production_ready
JWT_EXPIRE=7d

# Redis (local or Redis Cloud)
REDIS_URL=redis://localhost:6379

# Stripe — get from stripe.com/dashboard
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid — get from app.sendgrid.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx

# Cloudinary — get from cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...
```

---

## 6. Running the Project

```bash
# Install all dependencies
npm install

# Start development server with hot reload
npm run dev

# TypeScript type check without running
npx tsc --noEmit

# Build for production
npm run build

# Run production build
npm start
```

**Verify the server is running:**
```
GET http://localhost:5000/health

Response:
{
  "success": true,
  "message": "Mirza Footwear API is running",
  "timestamp": "2026-05-28T..."
}
```

---

## 7. Complete API Reference

Base URL: `http://localhost:5000/api/v1`

All successful responses follow this shape:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... }
}
```

All error responses:
```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [ { "field": "email", "message": "Invalid email" } ]
}
```

---

### Auth Routes `/api/v1/auth`

| Method | Endpoint | Auth Required | Rate Limited | Description |
|---|---|---|---|---|
| POST | `/register` | No | Yes (10/15min) | Create new customer account |
| POST | `/login` | No | Yes (10/15min) | Login, receive JWT token |
| GET | `/me` | Yes | No | Get own profile |
| PUT | `/me` | Yes | No | Update name, phone, avatar |
| PUT | `/change-password` | Yes | No | Change password |
| POST | `/address` | Yes | No | Add delivery address |
| DELETE | `/address/:id` | Yes | No | Remove delivery address |

**Register request body:**
```json
{
  "name": "Ali Mehdi",
  "email": "ali@mirzafootwear.com",
  "password": "Test@1234",
  "phone": "9876543210"
}
```

**Login request body:**
```json
{
  "email": "ali@mirzafootwear.com",
  "password": "Test@1234"
}
```

**Using the token** — include in every protected request:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

### Product Routes `/api/v1/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Get all products with filters |
| GET | `/featured` | No | Get featured products (max 8) |
| GET | `/slug/:slug` | No | Get single product by slug |
| GET | `/:id/related` | No | Get related products by category |
| POST | `/` | Admin | Create product with images |
| PUT | `/:id` | Admin | Update product details or images |
| DELETE | `/:id/image` | Admin | Remove one image from product |
| DELETE | `/:id` | Admin | Delete product and all images |

**Product query parameters:**
```
GET /api/v1/products?page=1&limit=12&category=<categoryId>&gender=men
  &minPrice=500&maxPrice=5000&search=running&sortBy=price_asc&isFeatured=true

sortBy options: price_asc | price_desc | rating | newest
gender options: men | women | unisex | kids
```

**Create product** — send as `multipart/form-data`:
```
name            → Mirza Air Runner Pro
description     → Premium running shoe with air cushion...
shortDescription → Lightweight air cushion running shoe
price           → 2999
discountPrice   → 2499
category        → 507f1f77bcf86cd799439011
color           → Midnight Black
gender          → men
material        → Mesh + Rubber
sizes           → [{"size":7,"stock":10},{"size":8,"stock":15}]
tags            → ["running","lightweight","men"]
isFeatured      → true
images          → (attach image files — max 5, max 5MB each)
```

---

### Category Routes `/api/v1/categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Get all active categories |
| POST | `/` | Admin | Create new category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

---

### Cart Routes `/api/v1/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Get full cart with populated products |
| GET | `/count` | Yes | Get total item count for navbar badge |
| POST | `/` | Yes | Add item — merges if same product+size |
| PUT | `/:itemId` | Yes | Update quantity with stock validation |
| DELETE | `/clear` | Yes | Clear entire cart |
| DELETE | `/:itemId` | Yes | Remove single item |

**Add to cart request body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "size": 8,
  "quantity": 2
}
```

---

### Order Routes `/api/v1/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Yes | Place order from cart |
| GET | `/my-orders` | Yes | User's order history |
| GET | `/:id` | Yes | Get single order details |
| PUT | `/:id/cancel` | Yes | Cancel pending order |
| GET | `/` | Admin | Get all orders |
| PUT | `/:id/status` | Admin | Update order status |

**Place order request body:**
```json
{
  "shippingAddress": {
    "fullName": "Ali Mehdi Mirza",
    "phone": "9876543210",
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "card",
  "couponCode": "MIRZA10",
  "notes": "Please deliver before 6pm"
}
```

**Order status flow:**
```
pending → confirmed → processing → shipped → delivered
                         ↓
                      cancelled / refunded
```

---

### Payment Routes `/api/v1/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-intent` | Yes | Create Stripe payment intent |
| POST | `/webhook` | No (Stripe signature) | Stripe event handler |

---

### Review Routes `/api/v1/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:productId` | No | Get all reviews for a product |
| POST | `/:productId` | Yes | Submit a review |
| DELETE | `/:id` | Yes | Delete own review |

---

### Coupon Routes `/api/v1/coupons`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/validate` | Yes | Check if coupon is valid |
| POST | `/` | Admin | Create coupon |
| GET | `/` | Admin | List all coupons |
| DELETE | `/:id` | Admin | Delete coupon |

---

### Admin Routes `/api/v1/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Sales stats, revenue, counts |
| GET | `/users` | Admin | All registered users |
| PUT | `/users/:id/toggle` | Admin | Activate/deactivate user |
| GET | `/orders` | Admin | All orders with filters |

---

## 8. Backend Concepts — The Complete Guide

Read this section completely. These concepts apply to every backend project you will ever build, not just this one.

---

### 8.1 What is a Backend?

A backend is a program running on a server that:
- Receives requests from clients (browser, mobile app)
- Processes business logic (calculations, rules, decisions)
- Reads and writes data to a database
- Returns responses

The backend is invisible to users. They only see the frontend. But every piece of data they see came from the backend.

```
User clicks "Buy Now"
        ↓
Frontend sends: POST /api/v1/orders { shippingAddress, paymentMethod }
        ↓
Backend receives request
Backend checks: is user logged in? (JWT verification)
Backend checks: are items in stock? (database query)
Backend calculates: total + tax + shipping
Backend deducts: inventory from database
Backend creates: order document in database
Backend triggers: confirmation email (background job)
Backend returns: { success: true, orderNumber: "MF-2026-00001" }
        ↓
Frontend shows: "Order placed successfully!"
```

Everything in that flow above is backend work.

---

### 8.2 What is a REST API?

REST (Representational State Transfer) is the most common architecture for building web APIs. It defines rules for how clients and servers communicate over HTTP.

**The 6 REST Principles:**

1. **Client-Server** — frontend and backend are completely separate. They communicate only through the API.

2. **Stateless** — each request contains all information needed. The server stores no session about the client between requests. This is why JWT tokens exist — the client carries its own identity.

3. **Uniform Interface** — consistent URLs and response shapes. `/api/v1/products` always returns products in the same format.

4. **Layered System** — the client does not know if it is talking to the actual server or a proxy/cache in front of it.

5. **Cacheable** — GET responses can be cached to improve performance.

6. **Resource-Based** — URLs represent resources (things), not actions.

**REST URL design rules:**

```
GOOD — resources are nouns
GET    /api/v1/products          ← get all products
GET    /api/v1/products/123      ← get product with id 123
POST   /api/v1/products          ← create a product
PUT    /api/v1/products/123      ← update product 123
DELETE /api/v1/products/123      ← delete product 123

BAD — URLs contain verbs
GET  /api/v1/getProducts         ← wrong
POST /api/v1/createProduct       ← wrong
POST /api/v1/deleteProduct/123   ← very wrong
```

---

### 8.3 HTTP Methods & Status Codes

**HTTP Methods:**

| Method | Purpose | Has Body | Idempotent |
|---|---|---|---|
| GET | Read data | No | Yes |
| POST | Create data | Yes | No |
| PUT | Replace data completely | Yes | Yes |
| PATCH | Update data partially | Yes | Yes |
| DELETE | Remove data | No | Yes |

Idempotent means: calling it multiple times gives the same result. GET /products/123 always returns the same product. DELETE /products/123 called twice still leaves the product deleted.

**HTTP Status Codes you must know:**

| Code | Name | When to use |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST that created something |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Client sent invalid/missing data |
| 401 | Unauthorized | Not logged in, or token invalid/expired |
| 403 | Forbidden | Logged in but not allowed (wrong role) |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate — email already registered |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected crash — fix your code |
| 503 | Service Unavailable | Server is down or overloaded |

---

### 8.4 MVC + Service Layer Architecture

This project uses a 5-layer architecture. Understanding why each layer exists is more important than knowing what it does.

```
Request
   ↓
ROUTE       → defines URL, middleware chain, which controller handles it
   ↓
MIDDLEWARE  → runs before controller: auth check, validation, rate limit
   ↓
CONTROLLER  → extracts data from req, calls service, sends response
   ↓
SERVICE     → business logic: database queries, calculations, rules
   ↓
MODEL       → Mongoose schema: data structure, validation, database operations
   ↓
DATABASE    → MongoDB stores/retrieves documents
```

**Why not put logic directly in controllers?**

Imagine you have order creation logic in the controller. Now you want to:
- Also create orders from a CLI tool for bulk imports
- Create orders from a cron job for subscriptions
- Create orders from a mobile app with different auth

If the logic is in the controller, you have to duplicate it three times. If the logic is in a service, all four entry points call `orderService.createOrder()`. One change fixes all of them.

**The rule:** Controllers know about HTTP. Services know about business. Models know about data. Never cross these boundaries.

---

### 8.5 Middleware — The Assembly Line

Middleware is the most important concept in Express. Every middleware is a function with this exact signature:

```typescript
(req: Request, res: Response, next: NextFunction) => void
```

- `req` — the incoming request (headers, body, params, user)
- `res` — the response you can send back
- `next` — function to call to pass to the next middleware

If you call `next()`, the request continues to the next middleware in the chain.
If you call `res.json(...)`, the response is sent and the chain stops.
If you call `next(error)`, the request jumps to the error handler.

**The full middleware chain for a protected admin route:**

```typescript
router.post(
  "/products",
  globalLimiter,        // 1. Check request count from this IP
  protect,              // 2. Verify JWT token, set req.user
  adminOnly,            // 3. Check req.user.role === "admin"
  uploadProductImages,  // 4. Parse multipart form, set req.files
  validate(schema),     // 5. Validate req.body shape with Zod
  createProduct         // 6. Finally — the controller runs
)
```

Each middleware is a gate. The request only reaches the controller if it passes all 5 gates.

---

### 8.6 Authentication vs Authorization

These are two completely different concepts that are often confused.

**Authentication** answers: "Who are you?"
This is the login process. You prove your identity by providing credentials (email + password). The server verifies them and issues a token. From this point the server trusts your identity.

**Authorization** answers: "What are you allowed to do?"
Even after proving identity, not every action is permitted. A logged-in customer cannot access admin routes. Authorization checks your role or permissions.

```
protect middleware    → Authentication
adminOnly middleware  → Authorization

// Route that needs both:
router.delete("/products/:id", protect, adminOnly, deleteProduct)
//                             ↑ auth         ↑ authz
```

In this project:
- Regular users can: view products, manage their cart, place orders, write reviews
- Admin users can additionally: create/update/delete products, manage categories, view all orders, update order status, manage coupons

---

### 8.7 JWT — How Tokens Work

JWT (JSON Web Token) is a self-contained token that proves who you are. The server does not store it — it just verifies it.

**Token structure:**
```
xxxxx.yyyyy.zzzzz
  ↑      ↑      ↑
Header Payload Signature
```

**Header** — base64 encoded:
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload** — base64 encoded (visible to anyone — do not store secrets here):
```json
{ "id": "507f1f77bcf86cd799439011", "role": "admin", "email": "ali@mirza.com", "iat": 1716854400, "exp": 1717459200 }
```

**Signature** — HMAC-SHA256 of header + payload, signed with your JWT_SECRET:
```
HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

If anyone changes the payload (e.g., changes role from "customer" to "admin"), the signature breaks. The server rejects it.

**Complete flow:**
```
1. POST /auth/login { email, password }
2. Server: bcrypt.compare(password, hashedPassword) → true
3. Server: jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: "7d" })
4. Server returns token to client
5. Client stores token
6. Client: GET /products/admin → Authorization: Bearer <token>
7. protect middleware: jwt.verify(token, JWT_SECRET) → decoded payload
8. req.user = { id, role, email }
9. adminOnly: req.user.role === "admin" → passes
10. Controller runs
```

**Token expiry** — tokens expire after 7 days. After expiry, the user must login again. This limits damage if a token is stolen — it becomes useless in 7 days.

---

### 8.8 Password Hashing with bcrypt

Never store plain text passwords. If your database is leaked, plain text passwords expose every user on every other website where they use the same password.

**Hashing vs Encryption:**
- Encryption is reversible — you can decrypt back to original
- Hashing is one-way — you cannot reverse it

bcrypt generates a different hash every time even for the same password (because of salt):
```
"Test@1234" → "$2b$12$KIXnq7vGNjrXzuBxMz1rOuV8FQeL3Y2..."
"Test@1234" → "$2b$12$8PqXnm4vGKjrYzBxNz2sOvW9GRfM4Z3..."  ← different!
```

The salt is stored inside the hash itself. bcrypt.compare() extracts the salt and re-hashes the input to compare.

**Salt rounds = 12** means bcrypt performs 2^12 = 4096 iterations. This makes it slow on purpose — a modern computer can compute billions of MD5 hashes per second, but only ~100 bcrypt hashes per second. This makes brute force attacks impractical.

In this project, hashing is automatic via the Mongoose pre-save hook:
```typescript
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return  // only hash if password changed
  this.password = await bcrypt.hash(this.password, 12)
})
```

---

### 8.9 MongoDB & Mongoose — Deep Dive

**MongoDB concepts:**

| SQL Term | MongoDB Term | Description |
|---|---|---|
| Database | Database | Container for all data |
| Table | Collection | Group of related documents |
| Row | Document | Single record (JSON object) |
| Column | Field | Property of a document |
| Index | Index | Speeds up queries |
| JOIN | populate() | Link documents across collections |

**MongoDB document example:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Ali Mehdi Mirza",
  "email": "ali@mirzafootwear.com",
  "role": "customer",
  "addresses": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "street": "123 Main St",
      "city": "Mumbai",
      "isDefault": true
    }
  ],
  "createdAt": "2026-05-28T10:00:00.000Z"
}
```

**Why MongoDB for ecommerce?**
Products have very different structures. A running shoe has `sizes` as an array of objects. A leather belt has just a single size. SQL databases need a fixed schema — adding a new field requires altering the entire table. MongoDB just adds the field to the documents that need it.

**Mongoose query patterns used in this project:**

```typescript
// Find with filter and populate
Product.find({ isActive: true, gender: "men" })
  .populate("category", "name slug")  // replace category ID with actual category data
  .sort({ price: 1 })                 // sort ascending by price
  .skip(12)                           // skip first 12 (pagination page 2)
  .limit(12)                          // return max 12 results

// Find one and update — returns updated document
User.findByIdAndUpdate(
  id,
  { $set: { name: "New Name" } },     // $set updates only specified fields
  { new: true, runValidators: true }  // return updated doc, run schema validators
)

// Aggregation — for stats and complex queries
Order.aggregate([
  { $match: { paymentStatus: "paid" } },
  { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
])

// Count documents efficiently
const total = await Product.countDocuments({ isActive: true })
```

---

### 8.10 Schemas, Models & Relationships

**Schema** defines structure. **Model** provides the query interface.

```typescript
// Schema — the blueprint
const ProductSchema = new Schema<IProduct>({ ... }, { timestamps: true })

// Model — the query interface
const Product = mongoose.model<IProduct>("Product", ProductSchema)

// Usage
await Product.find()          // queries the "products" collection in MongoDB
await Product.create({ ... }) // inserts a document
```

**Relationships in MongoDB:**

Unlike SQL, MongoDB does not have foreign keys. You store the `_id` of related documents and use `populate()` to join them at query time.

```typescript
// Product stores category as ObjectId reference
category: { type: Schema.Types.ObjectId, ref: "Category" }

// At query time, populate replaces the ID with the document
const product = await Product.findById(id).populate("category")
// product.category is now the full Category document, not just an ID
```

**When to embed vs reference:**

Embed (store inside the parent document) when:
- Data is always accessed with the parent (user addresses — always fetched with user)
- Data does not change independently
- Small, bounded arrays

Reference (store as ObjectId) when:
- Data is accessed independently (products are queried on their own)
- Data can be shared (many orders reference the same product)
- Arrays can grow large (order items reference products, not embed them)

---

### 8.11 Mongoose Hooks (pre/post)

Hooks run automatically before or after database operations. They remove repetitive logic from services.

**pre("save")** — runs before `.save()` or `.create()`:
```typescript
// Auto-hash password — never write bcrypt in services
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Auto-calculate totalStock
ProductSchema.pre("save", function () {
  this.totalStock = this.sizes.reduce((sum, s) => sum + s.stock, 0)
})

// Auto-generate order number
OrderSchema.pre("save", async function () {
  if (this.isNew) {
    const count = await mongoose.model("Order").countDocuments()
    this.orderNumber = `MF-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`
  }
})
```

**post("save")** — runs after save completes:
```typescript
// Auto-update product's average rating after a review is saved
ReviewSchema.post("save", async function () {
  const stats = await mongoose.model("Review").aggregate([
    { $match: { product: this.product } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ])
  await Product.findByIdAndUpdate(this.product, {
    averageRating: stats[0].avgRating,
    totalReviews: stats[0].count
  })
})
```

**Mongoose 8.x breaking change** — pre hooks no longer accept a `next` callback. Use async functions that simply return or throw:
```typescript
// Old way (Mongoose 6/7) — BROKEN in Mongoose 8
UserSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12)
  next()  // ← this causes "SaveOptions has no call signatures" error
})

// Mongoose 8 way — correct
UserSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12)
  // just return — Mongoose handles the rest
})
```

---

### 8.12 Validation with Zod v4

**Why validate at the API layer?**

TypeScript types exist only at compile time. When a request arrives at runtime, the body is untyped raw JSON. A user could send `{ "price": "hello", "email": null }` and TypeScript would not catch it. Zod validates actual runtime data.

**Two-layer validation:**
1. **Zod** — validates shape, types, formats (email, phone regex, min/max)
2. **Mongoose** — validates business rules (price > 0, required fields)

Both layers are needed. Zod catches problems before they reach the database. Mongoose is the last line of defense.

**Zod v4 changes from v3:**
```typescript
// v3 — BROKEN in v4
z.string({ required_error: "Name is required" })
error.errors  // ← does not exist in v4

// v4 — correct
z.string().min(1, "Name is required")
error.issues  // ← use .issues not .errors
```

**How the validate middleware works:**
```typescript
const validate = (schema: ZodType) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, params: req.params, query: req.query })
    next()  // valid — continue to controller
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map(issue => ({
          field: issue.path.slice(1).join("."),
          message: issue.message
        }))
      })
    }
  }
}
```

The `path.slice(1)` removes the "body" prefix from field paths — so `["body", "email"]` becomes `"email"` in the error response.

---

### 8.13 Error Handling — The Right Way

**Never do this:**
```typescript
app.get("/products", async (req, res) => {
  const products = await Product.find()  // if this throws, the server crashes
  res.json(products)
})
```

**The correct pattern — three layers:**

**Layer 1: asyncWrapper** — catches unhandled promise rejections:
```typescript
export const getProducts = asyncWrapper(async (req, res) => {
  const products = await Product.find()  // if this throws, asyncWrapper catches it
  sendSuccess(res, "Products fetched", { products })
})
```

**Layer 2: Structured errors from services** — operational errors with status codes:
```typescript
const error = new Error("Product not found") as Error & { statusCode: number }
error.statusCode = 404
throw error
// asyncWrapper's .catch(next) forwards this to errorHandler
```

**Layer 3: Global errorHandler middleware** — catches everything:
```typescript
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: ENV.NODE_ENV === "development" ? err.stack : undefined
  })
}
// Registered LAST in app.ts — app.use(errorHandler)
```

**process event handlers in server.ts** — catch truly unexpected crashes:
```typescript
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err)
  process.exit(1)
})
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err)
  process.exit(1)
})
```

---

### 8.14 asyncWrapper — Never Write try/catch Again

Without asyncWrapper, every async controller needs try/catch:
```typescript
// Without asyncWrapper — you write this for every single controller
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: "Not found" })
    res.json({ success: true, data: product })
  } catch (error) {
    next(error)  // easy to forget
  }
}
```

With asyncWrapper — write it once, use everywhere:
```typescript
// asyncWrapper definition — written once
const asyncWrapper = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next)  // .catch(next) is the magic
}

// Usage — clean controllers with no try/catch
export const getProduct = asyncWrapper(async (req, res) => {
  const product = await Product.findById(req.params.id as string)
  if (!product) {
    const err = new Error("Not found") as any
    err.statusCode = 404
    throw err  // asyncWrapper catches this and calls next(err)
  }
  sendSuccess(res, "Product fetched", { product })
})
```

---

### 8.15 File Uploads with Multer + Cloudinary

**The problem:** HTTP requests can only send text. Images are binary data. `multipart/form-data` encoding solves this by base64-encoding binary data and mixing it with text fields in one request.

**The solution pipeline:**

```
Browser sends multipart/form-data request
           ↓
Multer middleware (upload.middleware.ts)
  - Parses the multipart request
  - Reads file bytes into req.files as Buffer
  - Validates: only JPEG/PNG/WebP, max 5MB, max 5 files
           ↓
upload.service.ts — uploadMultipleImages()
  - Takes Buffer from req.files
  - Opens a stream to Cloudinary upload API
  - Applies transformations: resize to 800x800, compress, convert to WebP
  - Receives secure URL from Cloudinary
           ↓
product.service.ts
  - Saves secure_url strings to product.images array in MongoDB
           ↓
Database stores: ["https://res.cloudinary.com/mirza/image/upload/v1/..."]
```

**Memory storage vs disk storage:**
```typescript
// Memory storage — file stays in RAM, goes directly to Cloudinary
const storage = multer.memoryStorage()

// Disk storage — file written to server filesystem first (slower, uses disk space)
const storage = multer.diskStorage({ destination: "./uploads" })
```

Memory storage is preferred for cloud deployments — your server may have no persistent filesystem (like Heroku).

**Sending both files and JSON in one request:**
Multipart form-data sends everything as strings. JSON fields must be parsed manually in the controller:
```typescript
if (typeof req.body.sizes === "string") {
  req.body.sizes = JSON.parse(req.body.sizes)
}
req.body.price = parseFloat(req.body.price)
```

---

### 8.16 Rate Limiting — Blocking Attacks

**Brute force attack** — an attacker writes a script that sends thousands of login attempts per second trying different passwords.

Without rate limiting:
```
Attacker: POST /auth/login { email: "ali@test.com", password: "password1" } → 401
Attacker: POST /auth/login { email: "ali@test.com", password: "password2" } → 401
... 10,000 more attempts ...
Attacker: POST /auth/login { email: "ali@test.com", password: "Test@1234" } → 200 ← cracked
```

With rate limiting (10 attempts per 15 minutes):
```
Attacker: POST /auth/login → 401
...10 attempts...
Attacker: POST /auth/login → 429 Too Many Requests ← blocked for 15 minutes
```

At 10 attempts per 15 minutes, cracking a password takes: 10 attempts × 4 blocks/hour = 40 attempts/hour. A 12-character password has trillions of combinations — practically impossible to crack.

**Two limiters in this project:**
```typescript
// Global limiter — applied to ALL routes in app.ts
app.use(globalLimiter)  // 100 requests/15min — normal users never hit this

// Auth limiter — applied only to /login and /register
router.post("/login", authLimiter, validate(loginSchema), login)  // 10 attempts/15min
```

---

### 8.17 CORS — Cross Origin Resource Sharing

Browsers enforce a security rule called Same-Origin Policy — a webpage at `http://frontend.com` cannot make API requests to `http://backend.com` unless the backend explicitly allows it.

CORS headers tell the browser which origins are allowed:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

In this project, only the React dev servers (ports 3000 and 5173) are whitelisted. Any request from a different origin is blocked by the browser before it even reaches your controller.

Note: CORS is enforced by browsers only. Postman and Thunder Client bypass it because they are not browsers. This is why your API tests work in Thunder Client even if CORS is misconfigured.

---

### 8.18 Helmet — HTTP Security Headers

Helmet sets secure HTTP response headers automatically. Without Helmet, browsers may make dangerous assumptions about your content.

Headers Helmet sets:

| Header | What it prevents |
|---|---|
| Content-Security-Policy | XSS attacks — injected scripts from other domains |
| X-Frame-Options | Clickjacking — your site embedded in an iframe |
| X-Content-Type-Options | MIME sniffing — browser guessing content type |
| Referrer-Policy | Leaking URL information to other sites |
| Strict-Transport-Security | Forces HTTPS — prevents downgrade attacks |

One line of code, massive security improvement:
```typescript
app.use(helmet())
```

---

### 8.19 Environment Variables & Config Validation

**Why environment variables?**

Your code runs in multiple environments:
- Your laptop (development)
- A teammate's laptop (also development, different database)
- Staging server (testing before production)
- Production server (real users)

Each environment has different database URLs, API keys, and secrets. Environment variables let the same code work in all environments without changing anything in the code.

**The `required()` pattern:**
```typescript
const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env variable: ${key}`)
  return value
}

export const ENV = {
  MONGO_URI: required("MONGO_URI"),   // crashes if missing
  JWT_SECRET: required("JWT_SECRET"), // crashes if missing
  PORT: parseInt(process.env.PORT || "5000"), // has fallback
}
```

This is called **fail-fast** configuration. If a required variable is missing, the server refuses to start. This is far better than starting successfully and then crashing mysteriously 10 minutes later when the first database query runs.

---

### 8.20 The Service Layer Pattern

This is the most important architectural decision in this entire project.

**The rule:** No database query goes in a controller. No HTTP-specific code (req, res) goes in a service.

**Why this matters — real example:**

You have `createOrder` logic. Today it is called from:
1. The REST API (customer placing order via website)

Tomorrow you need to call it from:
2. An admin panel CLI script for bulk order import
3. A cron job for subscription orders
4. A mobile app with different auth

If the logic is in the controller, you copy-paste it four times. When you fix a bug in the tax calculation, you fix it in four places and probably miss one.

If the logic is in `order.service.ts`, all four call `createOrderService()`. Fix it once, fixed everywhere.

```typescript
// service — pure business logic, reusable from anywhere
export const createOrderService = async (userId, data) => {
  // 1. Fetch cart items
  // 2. Check stock
  // 3. Calculate totals
  // 4. Deduct inventory
  // 5. Create order
  // 6. Clear cart
  return order
}

// controller — just HTTP adapter
export const createOrder = asyncWrapper(async (req, res) => {
  const order = await createOrderService(req.user.id, req.body)
  sendSuccess(res, "Order placed", { order }, 201)
})

// CLI script — same service, no HTTP needed
const order = await createOrderService(adminId, orderData)
```

---

### 8.21 Pagination, Filtering & Sorting

Without pagination, `GET /products` returns all 10,000 products at once. The database query takes 5 seconds and the response is 50MB. Nobody waits for that.

**Pagination formula:**
```typescript
const page = 2    // which page the user wants
const limit = 12  // how many per page

const skip = (page - 1) * limit  // = 12 — skip the first 12
// Return 12 items starting from item 13

const [products, total] = await Promise.all([
  Product.find(filter).skip(skip).limit(limit),
  Product.countDocuments(filter)
])

const totalPages = Math.ceil(total / limit)
```

**Response includes pagination metadata:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "total": 247,
    "page": 2,
    "totalPages": 21
  }
}
```

**Why `Promise.all()`?** Running two database queries sequentially takes 200ms + 200ms = 400ms. Running them in parallel with `Promise.all()` takes max(200ms, 200ms) = 200ms. Always run independent async operations in parallel.

**Dynamic filter building:**
```typescript
const filter: Record<string, unknown> = { isActive: true }
if (category) filter.category = category
if (gender) filter.gender = gender
if (minPrice || maxPrice) {
  filter.price = {}
  if (minPrice) (filter.price as any).$gte = minPrice
  if (maxPrice) (filter.price as any).$lte = maxPrice
}
```

Only add filters that were actually provided. Do not filter by gender if gender was not in the query.

---

### 8.22 Stripe Payments & Webhooks

**How Stripe payment works:**

```
1. Customer clicks "Pay Now"
2. Frontend: POST /api/v1/payments/create-intent { orderId }
3. Backend: stripe.paymentIntents.create({ amount, currency: "inr" })
4. Stripe returns: { client_secret: "pi_xxx_secret_yyy" }
5. Backend returns client_secret to frontend
6. Frontend: stripe.confirmCardPayment(client_secret, cardDetails)
   ↑ Stripe handles card data — your server NEVER sees raw card numbers
7. Stripe processes payment
8. Stripe sends webhook event to: POST /api/v1/payments/webhook
9. Backend: stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET)
   ↑ verifies the webhook is actually from Stripe, not a fake request
10. If event is "payment_intent.succeeded" → mark order as paid
```

**Why webhooks instead of trusting the frontend?**

Never trust the frontend to say "payment was successful". A malicious user could send `{ "paymentStatus": "paid" }` without paying. The webhook comes from Stripe's servers and is cryptographically signed — you verify the signature to confirm it is genuine.

---

### 8.23 Background Jobs with Bull + Redis

**The problem:** Sending an email takes 500ms-2000ms. If you send it synchronously in the order endpoint:

```
Customer places order
Backend processes order (50ms)
Backend sends email (1500ms) ← customer is waiting 1.5 extra seconds
Backend responds "Order placed"
```

**The solution — background queues:**

```
Customer places order
Backend processes order (50ms)
Backend adds "send email" to Bull queue (5ms) ← instant
Backend responds "Order placed"

[In background — seconds later]
Bull worker picks up "send email" job
Worker sends email (1500ms) ← customer is already on confirmation page
```

```typescript
// Add to queue — instant
await emailQueue.add("order-confirmation", {
  to: user.email,
  orderNumber: order.orderNumber,
  items: order.items
})

// Process in background — separate worker
emailQueue.process("order-confirmation", async (job) => {
  await sendOrderConfirmationEmail(job.data)
})
```

Redis stores the queue. Even if your server restarts, Bull picks up unfinished jobs from Redis when it comes back online.

---

### 8.24 TypeScript in Backend — Why It Matters

TypeScript catches a whole category of bugs at compile time that would only appear at runtime in plain JavaScript.

**Example — without TypeScript:**
```javascript
const user = await User.findById(id)
sendEmail(user.emial)  // typo — "emial" instead of "email"
// This only fails when the function runs — at runtime, in production
```

**With TypeScript:**
```typescript
const user = await User.findById(id)  // TypeScript knows user is IUser
sendEmail(user.emial)  // ← TypeScript error: Property 'emial' does not exist on IUser
// Error caught at compile time — never reaches production
```

**Key TypeScript patterns used in this project:**

**Interfaces for model documents:**
```typescript
export interface IUser extends Document {
  name: string
  email: string
  role: "customer" | "admin"  // union type — only these two values
  comparePassword(password: string): Promise<boolean>  // instance method type
}
```

**Generic error type augmentation:**
```typescript
const error = new Error("Not found") as Error & { statusCode: number }
error.statusCode = 404
throw error
```

**AuthRequest pattern — extending Express types:**
```typescript
export interface AuthRequest extends Request {
  user?: JwtPayload  // req.user is available after protect middleware
}
```

**SortOrder type for Mongoose queries:**
```typescript
import { SortOrder } from "mongoose"
const sortOptions: Record<string, SortOrder> = {}
sortOptions.price = 1   // TypeScript accepts this
sortOptions.price = "hello"  // TypeScript error — not a valid SortOrder
```

---

## 9. Database Models — Full Reference

### User
```
_id, name, email, password (hashed, hidden), phone, role (customer|admin),
avatar (Cloudinary URL), addresses (embedded array), isActive, isEmailVerified,
passwordResetToken, passwordResetExpires, createdAt, updatedAt
```

### Product
```
_id, name, slug (auto-generated), description, shortDescription,
price, discountPrice, category (ref), brand, images (array of URLs),
sizes (array of {size, stock}), color, material, gender,
tags, isFeatured, isActive, totalStock (auto-calculated),
averageRating (auto-updated), totalReviews (auto-updated), createdAt, updatedAt
```

### Category
```
_id, name, slug (auto-generated), description, image, isActive, createdAt, updatedAt
```

### Order
```
_id, user (ref), orderNumber (auto: MF-2026-00001), items (snapshot array),
shippingAddress (embedded), itemsTotal, shippingCharge, taxAmount,
discountAmount, totalAmount, couponCode, orderStatus, paymentStatus,
paymentMethod, stripePaymentIntentId, trackingNumber, notes,
deliveredAt, createdAt, updatedAt
```

### Cart
```
_id, user (ref, unique — one cart per user), items (array of {product, size, quantity, price snapshot}),
totalAmount (auto-calculated), createdAt, updatedAt
```

### Review
```
_id, product (ref), user (ref), rating (1-5), title, comment,
images, isVerifiedPurchase, createdAt, updatedAt
Constraint: unique compound index on (product, user) — one review per product per user
```

### Coupon
```
_id, code (uppercase, unique), discountType (percentage|fixed),
discountValue, minOrderAmount, maxDiscountAmount, usageLimit,
usedCount, expiresAt, isActive, createdAt, updatedAt
```

---

## 10. Security Architecture

Every layer of security, why it exists, and where it is implemented:

| Threat | Defense | Where |
|---|---|---|
| Brute force login | Rate limiting (10 req/15min) | authLimiter middleware |
| Stolen token used forever | JWT expiry (7 days) | jwt.utils.ts |
| Database password leak | bcrypt hashing (12 rounds) | User.model.ts pre-save |
| Password in API response | select: false on password field | User.model.ts |
| Fake admin requests | protect + adminOnly middleware | Every admin route |
| Malformed request data | Zod validation | validate middleware |
| XSS, clickjacking | Helmet HTTP headers | app.ts |
| Cross-origin attacks | CORS whitelist | corsOptions.ts |
| Secrets in code | Environment variables | config/env.ts |
| Secrets in git history | .gitignore | .gitignore |
| Fake Stripe webhooks | Webhook signature verification | payment.service.ts |
| SQL/NoSQL injection | Mongoose sanitization | Mongoose query API |
| Server overload | Global rate limit (100 req/15min) | globalLimiter |

---

## 11. Git Commit Convention

This project follows **Conventional Commits** — the industry standard used at Google, Microsoft, and most major open source projects.

**Format:**
```
type(scope): short description under 72 characters

- More detail about what changed
- Another change in this commit
```

**Types:**

| Type | When to use | Example |
|---|---|---|
| feat | New feature | feat(auth): add forgot password endpoint |
| fix | Bug fix | fix(orders): correct tax calculation rounding |
| refactor | Restructure without behavior change | refactor(product): extract slug logic to utility |
| chore | Config, dependencies, build | chore(deps): upgrade mongoose to 8.x |
| docs | Documentation | docs: update API reference for order routes |
| test | Adding tests | test(auth): add register validation tests |
| perf | Performance improvement | perf(products): add database index for slug |

**Commit history for this project:**
```bash
feat(backend): initial project setup with Express and TypeScript
feat(config): add database, env, and CORS configuration
feat(models): add all 7 Mongoose schemas with TypeScript interfaces
feat(security): add JWT auth, Zod validation, rate limiting middleware
feat(auth): add register, login, profile, and address management
feat(products): add CRUD with Cloudinary image upload and slug generation
feat(categories): add category management for admin
feat(cart): add cart operations with auto-total calculation
feat(orders): add order placement with inventory deduction and tax
feat(payments): integrate Stripe payment intents and webhook verification
feat(reviews): add review system with auto product rating update
feat(coupons): add coupon validation with percentage and fixed discounts
feat(admin): add dashboard stats and admin management routes
feat(email): integrate SendGrid transactional emails
feat(jobs): add Bull queue for async email processing
```

---

## 12. What I Learned Building This

Building this backend from scratch taught me the following concepts that apply to every backend project:

**Architecture** — separating concerns into models, services, controllers, and routes makes the codebase maintainable. Business logic in services means it is reusable from any entry point.

**TypeScript in production** — type safety catches entire categories of bugs before they reach users. The upfront investment of writing interfaces and types pays back enormously in reduced debugging time.

**Security is layered** — no single security measure is enough. Rate limiting + JWT + bcrypt + Zod + Helmet + CORS together create defense in depth. Removing any one layer creates a vulnerability.

**Database design matters** — the decision of what to embed versus reference in MongoDB affects query performance permanently. Indexes on frequently-queried fields are not optional.

**Fail fast** — validate environment variables at startup, reject malformed requests immediately with Zod, crash loudly on unexpected errors. Silent failures are far harder to debug than loud ones.

**Background jobs** — any operation that takes more than 100ms and does not need to block the response (emails, notifications, heavy calculations) belongs in a queue. Users should never wait for things that can happen asynchronously.

**Mongoose hooks** — pre-save hooks for password hashing, stock calculation, and order number generation eliminated repetitive logic from services and guaranteed consistency regardless of how a document is saved.

---

## Author

**Ali Mehdi Mirza**

**Project:** Mirza Footwear Ecommerce Website — Backend API
**Stack:** Express.js + TypeScript + MongoDB + Mongoose + Stripe + Cloudinary
**Built:** 2026

---

*This README doubles as a complete backend development reference guide. Every concept documented here applies universally to any Node.js backend project.*

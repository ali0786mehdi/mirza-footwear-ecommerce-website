# 🥿 Mirza Footwear — Backend API

> A production-grade, fully-typed REST API for a complete ecommerce footwear brand.
> Built from scratch with **Express.js + TypeScript + MongoDB + Mongoose + Razorpay**.
> 
> **This README is two things in one:**
> 1. Complete project documentation for Mirza Footwear backend
> 2. A complete backend development guide — read this once and build any backend from scratch forever

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Why Each Was Chosen](#2-tech-stack--why-each-was-chosen)
3. [Complete Folder Structure](#3-complete-folder-structure)
4. [Environment Setup](#4-environment-setup)
5. [Running the Project](#5-running-the-project)
6. [How I Built This — Complete Step by Step Journey](#6-how-i-built-this--complete-step-by-step-journey)
7. [Complete API Reference](#7-complete-api-reference)
8. [Backend Concepts — The Complete Guide](#8-backend-concepts--the-complete-guide)
9. [Database Models — Full Reference](#9-database-models--full-reference)
10. [Security Architecture](#10-security-architecture)
11. [Payment Integration — Razorpay](#11-payment-integration--razorpay)
12. [Testing Guide — Thunder Client & Postman](#12-testing-guide--thunder-client--postman)
13. [Troubleshooting — Real Errors Solved](#13-troubleshooting--real-errors-solved)
14. [Remaining Steps](#14-remaining-steps)
15. [Git Commit Convention](#15-git-commit-convention)
16. [What I Learned Building This](#16-what-i-learned-building-this)

---

## 1. Project Overview

Mirza Footwear is a complete production-ready backend API for a footwear ecommerce brand.
Every feature a real ecommerce website needs is implemented here.

| Feature | Status | Description |
|---|---|---|
| Auth System | ✅ Done | Register, login, JWT, bcrypt, profile, addresses |
| Product Catalog | ✅ Done | CRUD, Cloudinary images, search, filters, pagination |
| Category System | ✅ Done | Admin managed categories with slugs |
| Shopping Cart | ✅ Done | Add, update, remove, smart merge, auto-total |
| Order System | ✅ Done | Place orders, inventory deduction, tax, status flow |
| Payment Processing | ✅ Done | Razorpay integration, webhook verification |
| Coupon System | 🔄 Step 10 | Percentage and fixed discounts |
| Review System | 🔄 Step 11 | Star ratings, auto-update product rating |
| Admin Dashboard | 🔄 Step 12 | Sales stats, manage everything |
| Email System | 🔄 Step 13 | SendGrid transactional emails |
| Background Jobs | 🔄 Step 14 | Bull + Redis async email queues |
| Final Wiring | 🔄 Step 15 | All routes connected, full test |

---

## 2. Tech Stack & Why Each Was Chosen

### Node.js
JavaScript that runs on the server instead of the browser.
Non-blocking — handles thousands of requests simultaneously without freezing.
One language (JavaScript) for both frontend and backend.

### Express.js
The most popular Node.js framework. Gives you:
- Routing: `app.get('/products', handler)`
- Middleware: `app.use(helmet())`
- Error handling: `app.use(errorHandler)`
Minimal by design — you add exactly what you need.

### TypeScript
JavaScript with types. Every variable has a declared type.
Catches bugs at compile time (while writing code) instead of runtime (when users are using the app).
Example: `user.emial` → TypeScript error instantly. Without TS this crashes in production.

### MongoDB + MongoDB Atlas
NoSQL database storing data as JSON documents.
Perfect for ecommerce — a running shoe has different fields than a leather belt.
SQL requires fixed schema — adding a field means altering the entire table.
MongoDB just adds the field to documents that need it.
Atlas = MongoDB hosted on cloud. Your data lives on their servers, not your machine.

### Mongoose
ODM (Object Document Mapper) for MongoDB.
Adds schema validation, TypeScript types, middleware hooks, and a clean query API.
Without Mongoose: raw MongoDB queries with no structure or validation.
With Mongoose: `User.findOne({ email })` with full TypeScript support.

### JWT (JSON Web Token)
Stateless authentication. Server gives you a signed token after login.
You send that token with every future request to prove who you are.
Server never stores sessions — just verifies the cryptographic signature.
Scales to millions of users without a session database.

### bcryptjs
One-way password hashing. Converts "Test@1234" to "$2b$12$KIX...".
Cannot be reversed. Even if database is stolen, passwords are safe.
Salt rounds = 12 means 4096 hashing iterations — brute force takes centuries.

### Zod v4
Runtime schema validation. TypeScript types only exist at compile time.
When a real request arrives, body is raw untyped JSON.
Zod validates: "price must be a number, email must be valid, phone must be 10 digits".
Rejects bad data before it ever reaches your database.

### Multer + Cloudinary
Multer parses multipart/form-data (file uploads) and gives you Buffer in memory.
Cloudinary stores images in the cloud and returns a URL.
Your database stores the URL string — not the image bytes.
Images are automatically resized, compressed, and converted to WebP.

### Razorpay
Indian payment gateway. Works with Indian accounts without needing a live website.
Handles credit cards, debit cards, UPI, netbanking.
Your server creates an Order, frontend opens Razorpay modal, payment happens.
Razorpay sends webhook to your server confirming payment — you never trust the frontend.

### Helmet
Sets 15+ secure HTTP headers automatically.
Prevents XSS, clickjacking, MIME sniffing, and other browser-level attacks.
One line of code: `app.use(helmet())`.

### express-rate-limit
Limits requests per IP per time window.
Prevents brute force attacks on login/register.
10 attempts per 15 minutes on auth routes — impossible to crack passwords.

### Bull + Redis
Bull is a job queue library. Redis stores the queue.
Slow operations (sending emails, image processing) go into the queue.
API responds instantly. Background worker processes jobs asynchronously.
Even if server restarts, Bull picks up unfinished jobs from Redis.

### SendGrid
Transactional email API.
Sends order confirmations, welcome emails, password reset links.
Never use Gmail/SMTP for production — use a dedicated email API.

### Winston
Structured logging library.
Logs errors, warnings, and info to files and console.
Production servers need logs to debug issues without being there.

---

## 3. Complete Folder Structure

```
mirza-footwear-ecommerce-website/
│
├── frontend/                          ← React app (built separately)
│
└── backend/                           ← Everything in this README
    ├── src/
    │   │
    │   ├── config/                    ← App-wide configuration
    │   │   ├── database.ts            ← MongoDB connection with error handling
    │   │   ├── redis.ts               ← Redis client for queues and caching
    │   │   ├── env.ts                 ← Environment variable validation
    │   │   └── corsOptions.ts         ← CORS whitelist configuration
    │   │
    │   ├── models/                    ← Mongoose schemas — THE VAULT
    │   │   ├── User.model.ts          ← Customers and admins
    │   │   ├── Product.model.ts       ← Shoes with per-size stock
    │   │   ├── Category.model.ts      ← Product categories
    │   │   ├── Order.model.ts         ← Customer orders with snapshots
    │   │   ├── Cart.model.ts          ← Shopping cart (one per user)
    │   │   ├── Review.model.ts        ← Product reviews and ratings
    │   │   └── Coupon.model.ts        ← Discount coupons
    │   │
    │   ├── routes/                    ← URL definitions — THE BRIDGE
    │   │   ├── auth.routes.ts         ← /api/v1/auth/*
    │   │   ├── product.routes.ts      ← /api/v1/products/*
    │   │   ├── category.routes.ts     ← /api/v1/categories/*
    │   │   ├── cart.routes.ts         ← /api/v1/cart/*
    │   │   ├── order.routes.ts        ← /api/v1/orders/*
    │   │   ├── payment.routes.ts      ← /api/v1/payments/*
    │   │   ├── review.routes.ts       ← /api/v1/reviews/*
    │   │   ├── coupon.routes.ts       ← /api/v1/coupons/*
    │   │   └── admin.routes.ts        ← /api/v1/admin/*
    │   │
    │   ├── controllers/               ← Request/Response handlers
    │   │   ├── auth.controller.ts
    │   │   ├── product.controller.ts
    │   │   ├── order.controller.ts
    │   │   ├── cart.controller.ts
    │   │   ├── payment.controller.ts
    │   │   ├── review.controller.ts
    │   │   └── admin.controller.ts
    │   │
    │   ├── services/                  ← Business logic — THE BRAIN
    │   │   ├── auth.service.ts        ← Register, login, profile, addresses
    │   │   ├── product.service.ts     ← CRUD, search, filters, pagination
    │   │   ├── category.service.ts    ← Category management
    │   │   ├── order.service.ts       ← Place orders, inventory, tax, status
    │   │   ├── cart.service.ts        ← Cart operations with smart merge
    │   │   ├── payment.service.ts     ← Razorpay integration, webhooks
    │   │   ├── coupon.service.ts      ← Validate and apply discounts
    │   │   ├── email.service.ts       ← SendGrid transactional emails
    │   │   └── upload.service.ts      ← Cloudinary image upload and delete
    │   │
    │   ├── middleware/                ← Security and validation chain
    │   │   ├── auth.middleware.ts     ← Verify JWT token
    │   │   ├── admin.middleware.ts    ← Check admin role
    │   │   ├── validate.middleware.ts ← Run Zod schemas
    │   │   ├── rateLimiter.middleware.ts ← Block brute force
    │   │   ├── errorHandler.middleware.ts ← Global error catcher
    │   │   └── upload.middleware.ts   ← Multer file parsing
    │   │
    │   ├── validators/                ← Zod schemas for each route
    │   │   ├── auth.validator.ts
    │   │   ├── product.validator.ts
    │   │   ├── order.validator.ts
    │   │   └── cart.validator.ts
    │   │
    │   ├── utils/                     ← Reusable helpers
    │   │   ├── jwt.utils.ts           ← generateToken, verifyToken, AuthRequest
    │   │   ├── apiResponse.utils.ts   ← sendSuccess, sendError
    │   │   ├── asyncWrapper.utils.ts  ← Wraps async controllers
    │   │   └── logger.ts              ← Winston structured logging
    │   │
    │   ├── integrations/              ← Third-party services
    │   │   ├── razorpay.ts            ← Razorpay client
    │   │   ├── sendgrid.ts            ← SendGrid client
    │   │   ├── cloudinary.ts          ← Cloudinary config
    │   │   └── gemini.ts              ← Google Gemini AI
    │   │
    │   ├── jobs/                      ← Background queues
    │   │   ├── emailQueue.job.ts      ← Async order confirmation emails
    │   │   └── inventoryQueue.job.ts  ← Stock sync
    │   │
    │   ├── types/                     ← TypeScript declarations
    │   │   └── express.d.ts           ← Extends Express Request type
    │   │
    │   ├── app.ts                     ← Express setup, all middleware registered
    │   └── server.ts                  ← Entry point, connects DB, starts server
    │
    ├── .env                           ← Secret keys (NEVER commit to git)
    ├── .env.example                   ← Template for other developers
    ├── .gitignore
    ├── tsconfig.json
    ├── nodemon.json
    └── package.json
```

---

## 4. Environment Setup

Create `.env` in the `backend/` folder:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mirza-footwear

# JWT — minimum 32 random characters
JWT_SECRET=mirza_footwear_super_secret_jwt_key_2026
JWT_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# Razorpay — from dashboard.razorpay.com → Settings → API Keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# SendGrid — from app.sendgrid.com
SENDGRID_API_KEY=SG.xxxxxxxxxx

# Cloudinary — from cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...
```

**Rules for .env:**
- Never commit this file to GitHub — it is in .gitignore
- Never share API keys in messages or screenshots
- Every developer on the team creates their own .env from .env.example

---

## 5. Running the Project

```bash
# Navigate to backend folder
cd mirza-footwear-ecommerce-website/backend

# Install all dependencies
npm install

# Start development server with hot reload
npm run dev

# Check TypeScript errors without running
npx tsc --noEmit

# Build for production
npm run build

# Start production build
npm start
```

**Verify server is running — open browser:**
```
http://localhost:5000/health

Expected response:
{
  "success": true,
  "message": "Mirza Footwear API is running",
  "timestamp": "2026-05-29T..."
}
```

---

## 6. How I Built This — Complete Step by Step Journey

This is the exact journey of building this backend. Every decision, every problem, every solution documented.

---

### Step 1 — Project Initialization

```bash
mkdir mirza-footwear-ecommerce-website && cd mirza-footwear-ecommerce-website
mkdir backend && cd backend
npm init -y
```

**Installed all dependencies:**
```bash
npm install express mongoose dotenv cors helmet bcryptjs jsonwebtoken \
  express-rate-limit zod multer cloudinary bull ioredis winston slugify \
  razorpay @sendgrid/mail redis

npm install -D typescript ts-node nodemon @types/express @types/node \
  @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer @types/bull
```

**Created complete folder structure:**
```bash
mkdir -p src/{config,models,routes,controllers,services,middleware,validators,utils,integrations,jobs,types}
npx tsc --init
```

**Key decision:** Separate devDependencies from dependencies.
Production server only installs what it needs to run — not TypeScript compiler or type definitions.

**`nodemon.json` for hot reload:**
```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "exec": "ts-node src/server.ts"
}
```

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "ignoreDeprecations": "5.0"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

### Step 2 — Configuration Layer

**`config/env.ts`** — validates all environment variables at startup.
If any required variable is missing, server crashes immediately with a clear error.
This is called fail-fast — better to crash at startup than fail mysteriously during a request.

```typescript
const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env variable: ${key}`)
  return value
}
export const ENV = {
  MONGO_URI: required("MONGO_URI"),  // crashes if missing
  JWT_SECRET: required("JWT_SECRET"), // crashes if missing
  PORT: parseInt(process.env.PORT || "5000") // has fallback
}
```

**`config/database.ts`** — connects to MongoDB.
Calls `process.exit(1)` on failure — no point running backend without database.

**`config/corsOptions.ts`** — whitelists only your React dev servers.
Without this, any website on the internet can make requests to your API.

**`app.ts`** — the Express application setup.
Order of middleware matters:
1. helmet() — security headers first
2. cors() — before any routes
3. express.raw() for webhook — before express.json()
4. express.json() — body parsing
5. Routes — after all global middleware
6. 404 handler — after all routes
7. errorHandler — must be absolute last

**`server.ts`** — entry point. Connects database first, then starts listening.
Handles `unhandledRejection` and `uncaughtException` to log before crashing.

---

### Step 3 — MongoDB Models (The Vault)

Built all 7 models before writing any routes.
Models define the shape of every piece of data in the system.

**Key design decisions:**

**User model:**
- `password` field has `select: false` — never returned in queries by default
- Must explicitly request it: `User.findOne({ email }).select("+password")`
- Prevents accidentally sending hashed passwords to frontend
- `comparePassword` instance method on the model — never compare passwords in services

**Product model:**
- Sizes stored as array of `{ size: number, stock: number }` — per-size stock tracking
- `totalStock` auto-calculated in pre-save hook by summing all size stocks
- Text index on name, description, tags — enables `$text` search
- Compound index on category + gender + isActive — fast filtered queries

**Order model:**
- Items stored as snapshots — name, image, price copied from product at purchase time
- If product price changes later, old orders still show what customer actually paid
- `orderNumber` auto-generated in pre-save hook: `MF-2026-00001`
- Status flow validated in service: pending → confirmed → processing → shipped → delivered

**Cart model:**
- One cart per user (unique index on user field)
- `totalAmount` auto-calculated in pre-save hook
- Items have price snapshot — cart price does not change if product price changes

**Review model:**
- Compound unique index `{ product: 1, user: 1 }` — one review per product per user
- `post("save")` hook auto-updates product `averageRating` and `totalReviews` using aggregation

**Mongoose 8.x breaking change discovered:**
Pre hooks no longer accept `next()` callback.
```typescript
// BROKEN in Mongoose 8
UserSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12)
  next() // TypeError: SaveOptions has no call signatures
})

// CORRECT for Mongoose 8
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return
  this.password = await bcrypt.hash(this.password, 12)
  // just return — Mongoose handles the rest
})
```

---

### Step 4 — Security Layer (Bouncer + Shield)

**JWT utilities:**
- `generateToken(user)` — signs JWT with user id, role, email
- `verifyToken(token)` — verifies and decodes JWT
- `AuthRequest` interface — extends Express Request to include `req.user`

**The AuthRequest pattern:**
TypeScript's global declaration merging for `req.user` had compatibility issues.
Solution: custom interface extending Request.
```typescript
export interface AuthRequest extends Request {
  user?: JwtPayload
}
// Controllers needing req.user use AuthRequest instead of Request
// Public controllers use plain Request
// Visually obvious which routes are protected
```

**Rate limiting:**
- `globalLimiter` — 100 requests per 15 minutes on all routes
- `authLimiter` — 10 requests per 15 minutes on login/register only
- At 10 attempts per 15 minutes, cracking a password takes longer than the universe exists

**Zod v4 breaking changes:**
Zod v4 completely changed its API from v3.
```typescript
// v3 — BROKEN in v4
z.string({ required_error: "Name is required" })
error.errors // does not exist in v4

// v4 — correct
z.string().min(1, "Name is required")
error.issues // use .issues not .errors
AnyZodObject // does not exist → use ZodType
```

**validate middleware:**
Runs Zod schema against req.body, req.params, req.query.
Returns structured error array if validation fails.
Request never reaches controller if validation fails.

---

### Step 5 — Auth System

**Register service:**
- Check duplicate email first — throw 409 Conflict if exists
- Create user — pre-save hook hashes password automatically
- Generate JWT and return with sanitized user object

**Login service:**
- Find by email with `.select("+password")` — password hidden by default
- Check account is active
- `bcrypt.compare(enteredPassword, hashedPassword)` — verify password
- Both "email not found" and "wrong password" return same error message
- Prevents user enumeration attack — attacker cannot tell which emails are registered

**sanitizeUser pattern:**
Never send raw user document to frontend.
Strip sensitive fields before responding.
```typescript
const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  // password never included
})
```

**Address management:**
- When new address set as default, all others set to `isDefault: false` first
- First address added is automatically made default

---

### Step 6 — Products and Categories

**Cloudinary upload pipeline:**
1. Multer parses multipart form-data → file in memory as Buffer
2. `uploadImage()` opens stream to Cloudinary upload API
3. Cloudinary transforms: resize 800x800, compress, convert to WebP
4. Returns secure URL string
5. Product saved with URL array — not image bytes

**Memory storage vs disk storage:**
- `multer.memoryStorage()` — file stays in RAM, goes directly to Cloudinary
- `multer.diskStorage()` — written to server filesystem first
- Memory storage preferred — cloud servers often have no persistent filesystem

**Multipart form-data parsing issue:**
When sending files and JSON in one request, everything arrives as strings.
Must manually parse numbers and arrays in controller:
```typescript
if (typeof req.body.sizes === "string") {
  req.body.sizes = JSON.parse(req.body.sizes)
}
req.body.price = parseFloat(req.body.price)
```

**Slug generation:**
"Mirza Air Runner Pro" → "mirza-air-runner-pro" using `slugify`
If slug exists, append timestamp: "mirza-air-runner-pro-1716854400000"

**TypeScript fix — SortOrder:**
Mongoose `.sort()` requires `Record<string, SortOrder>` not `Record<string, unknown>`.
```typescript
import { SortOrder } from "mongoose"
const sortOptions: Record<string, SortOrder> = {}
sortOptions.createdAt = -1 // TypeScript accepts this
```

---

### Step 7 — Shopping Cart

**Smart merge logic:**
If same product with same size already in cart → update quantity.
If same product with different size → new separate item.
This is because size 8 and size 9 of the same shoe are different items.

**Stock validation at add time:**
Check both new quantity AND combined quantity (existing + new).
"You already have 3 in cart. Only 5 available. Cannot add 3 more."

**Price snapshot:**
Cart stores price at time of adding.
If admin changes product price, cart still shows original price.
This prevents confusion when customer adds item, price changes, then they checkout.

**Route order matters:**
```typescript
router.delete("/clear", clearCart)    // must come FIRST
router.delete("/:itemId", removeItem) // otherwise "clear" matches as itemId
```

**TypeScript fix — ICartItem._id:**
Mongoose automatically adds `_id` to subdocument arrays.
TypeScript does not know unless declared in interface.
```typescript
export interface ICartItem {
  _id?: mongoose.Types.ObjectId  // must declare explicitly
  product: mongoose.Types.ObjectId
  // ...
}
```

---

### Step 8 — Order System

**The "all or nothing" stock validation:**
Before deducting ANY stock, check ALL items first.
If size 9 is out of stock, do not deduct size 8.
Customer sees all problems in one response, not one at a time.

**Tax calculation — Indian GST:**
```
itemsTotal = sum of (price × quantity)
shippingCharge = itemsTotal >= 999 ? 0 : 99
taxAmount = Math.round(itemsTotal × 0.18)  // 18% GST
discountAmount = from coupon if provided
totalAmount = itemsTotal + shippingCharge + taxAmount - discountAmount
```

**Atomic stock deduction:**
Uses MongoDB `$inc` operator which is atomic.
Multiple concurrent orders cannot cause race conditions.
```typescript
Product.findOneAndUpdate(
  { _id: productId, "sizes.size": size },
  { $inc: { "sizes.$.stock": -quantity } }
)
```

**Stock restoration on cancellation:**
When order is cancelled, stock is added back using `$inc` with positive value.
Works for both customer cancellation and admin cancellation.

**Status flow validation:**
Order status can only move forward, not backward.
Cannot go from "delivered" to "pending".
```typescript
const statusFlow = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],  // terminal
  refunded: [],   // terminal
}
```

**Critical route ordering in orders:**
```typescript
router.get("/my-orders", protect, getMyOrders)  // must come before /:id
router.get("/stats", protect, adminOnly, getOrderStats)  // must come before /:id
router.get("/:id", protect, getOrderById)  // parameterized last
```

**TypeScript fix — tsconfig.json:**
`baseUrl` deprecated in TypeScript 5.x caused silent compilation failures.
Removing it and adding `ignoreDeprecations: "5.0"` fixed all route loading issues.

---

### Step 9 — Razorpay Payment Integration

**Why Razorpay over Stripe:**
Stripe requires US bank account and live website URL even for testing.
Razorpay works with Indian accounts and localhost testing.
Both work identically in terms of integration pattern.

**Payment flow:**
```
1. Customer places order (paymentMethod: "card")
2. POST /api/v1/payments/create-order { orderId }
3. Backend creates Razorpay Order → gets order_xxxxxxxxxx ID
4. Frontend opens Razorpay modal with order ID
5. Customer enters card details in Razorpay modal
6. Razorpay processes payment
7. Razorpay sends webhook to /api/v1/payments/webhook
8. Backend verifies webhook signature
9. Backend marks order as paid and confirmed
```

**Critical webhook setup:**
Razorpay webhook needs raw Buffer for signature verification.
express.json() parsing destroys the raw body.
Must register raw body parser BEFORE express.json():
```typescript
// In app.ts — BEFORE express.json()
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }))
// THEN
app.use(express.json({ limit: "10mb" }))
```

**Webhook signature verification:**
```typescript
const expectedSignature = crypto
  .createHmac("sha256", webhookSecret)
  .update(rawBody)
  .digest("hex")

if (expectedSignature !== signature) {
  throw createError("Webhook signature verification failed", 400)
}
```

**Local webhook testing with ngrok:**
Razorpay cannot reach localhost. ngrok creates a public tunnel.
```bash
ngrok http 5000
# Get URL like: https://abc123.ngrok-free.app
# Add to Razorpay Dashboard → Settings → Webhooks
```

**Test card details:**
```
Card:    4111 1111 1111 1111
Expiry:  12/25
CVV:     123
OTP:     1234
```

---

## 7. Complete API Reference

Base URL: `http://localhost:5000/api/v1`

**Standard response shape:**
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { }
}
```

**Error response shape:**
```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

---

### Auth Routes `/api/v1/auth`

| Method | Endpoint | Auth | Rate Limited | Description |
|---|---|---|---|---|
| POST | `/register` | No | 10/15min | Create new account |
| POST | `/login` | No | 10/15min | Login, get JWT token |
| GET | `/me` | Yes | No | Get own profile |
| PUT | `/me` | Yes | No | Update name, phone, avatar |
| PUT | `/change-password` | Yes | No | Change password |
| POST | `/address` | Yes | No | Add delivery address |
| DELETE | `/address/:id` | Yes | No | Remove delivery address |

**Register:**
```json
{
  "name": "Ali Mehdi Mirza",
  "email": "ali@mirzafootwear.com",
  "password": "Test@1234",
  "phone": "9876543210"
}
```

**Login:**
```json
{
  "email": "ali@mirzafootwear.com",
  "password": "Test@1234"
}
```

**All protected routes need this header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

### Product Routes `/api/v1/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | All products with filters |
| GET | `/featured` | No | Featured products (max 8) |
| GET | `/slug/:slug` | No | Single product by slug |
| GET | `/:id/related` | No | Related products |
| POST | `/` | Admin | Create with images |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id/image` | Admin | Remove one image |
| DELETE | `/:id` | Admin | Delete product |

**Query params:**
```
?page=1&limit=12&category=<id>&gender=men&minPrice=500&maxPrice=5000
&search=running&sortBy=price_asc&isFeatured=true
```

**Create product — form-data:**
```
name, description, shortDescription, price, discountPrice,
category (ObjectId), color, gender, material, sizes (JSON string),
tags (JSON string), isFeatured, images (files)
```

---

### Category Routes `/api/v1/categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | No | All active categories |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

---

### Cart Routes `/api/v1/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Get full cart |
| GET | `/count` | Yes | Get item count for badge |
| POST | `/` | Yes | Add item (merges if same product+size) |
| PUT | `/:itemId` | Yes | Update quantity |
| DELETE | `/clear` | Yes | Clear entire cart |
| DELETE | `/:itemId` | Yes | Remove single item |

**Add to cart:**
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
| GET | `/my-orders` | Yes | Order history |
| GET | `/stats` | Admin | Sales statistics |
| GET | `/:id` | Yes | Single order |
| PUT | `/:id/cancel` | Yes | Cancel order |
| GET | `/` | Admin | All orders |
| PUT | `/:id/status` | Admin | Update status |

**Place order:**
```json
{
  "shippingAddress": {
    "fullName": "Ali Mehdi Mirza",
    "phone": "9876543210",
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "401101",
    "country": "India"
  },
  "paymentMethod": "card",
  "couponCode": "MIRZA10",
  "notes": "Ring bell twice"
}
```

**Status flow:**
```
pending → confirmed → processing → shipped → delivered
                           ↓
                      cancelled / refunded
```

---

### Payment Routes `/api/v1/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-order` | Yes | Create Razorpay order |
| POST | `/webhook` | No | Razorpay event handler |

**Create Razorpay order:**
```json
{ "orderId": "your_order_id_here" }
```

---

### Review Routes `/api/v1/reviews` (Step 11)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:productId` | No | Get product reviews |
| POST | `/:productId` | Yes | Submit review |
| DELETE | `/:id` | Yes | Delete own review |

---

### Coupon Routes `/api/v1/coupons` (Step 10)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/validate` | Yes | Validate coupon code |
| POST | `/` | Admin | Create coupon |
| GET | `/` | Admin | List all coupons |
| DELETE | `/:id` | Admin | Delete coupon |

---

### Admin Routes `/api/v1/admin` (Step 12)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Full stats overview |
| GET | `/users` | Admin | All users |
| PUT | `/users/:id/toggle` | Admin | Activate/deactivate user |

---

## 8. Backend Concepts — The Complete Guide

Read every section. These concepts apply to every backend you will ever build.

---

### 8.1 What is a Backend?

A backend is a program running on a server that:
- Receives HTTP requests from clients (browser, mobile app, Postman)
- Processes business logic (calculations, rules, decisions)
- Reads and writes data to a database
- Returns HTTP responses

The backend is completely invisible to users.
They only see the frontend. But every piece of data they see came from the backend.

**Real example — customer clicks "Buy Now":**
```
1. Frontend sends: POST /api/v1/orders { shippingAddress, paymentMethod }
2. Backend verifies JWT token — is user logged in?
3. Backend fetches cart from database
4. Backend checks: are all items still in stock?
5. Backend calculates: itemsTotal + GST + shipping - discount
6. Backend deducts stock from database (atomic operation)
7. Backend creates order document in database
8. Backend clears the cart
9. Backend adds email job to queue
10. Backend returns: { orderNumber: "MF-2026-00001" }
11. Frontend shows: "Order placed successfully!"
```

Steps 2-10 all happen in milliseconds on the server. The user sees step 11.

---

### 8.2 What is a REST API?

REST (Representational State Transfer) defines rules for how clients and servers communicate over HTTP.

**6 REST Principles:**

**1. Client-Server** — frontend and backend are completely separate.
They communicate only through the API.
React does not know if the backend uses MongoDB or PostgreSQL.
Express does not know if the frontend uses React or Vue.

**2. Stateless** — each request is completely independent.
Server stores no session between requests.
Every request includes all needed information (JWT token, body data).
This is why tokens exist — client carries its own identity.

**3. Uniform Interface** — consistent URLs and response shapes.
`/api/v1/products` always returns products in the same JSON format.
Frontend developer knows exactly what to expect from every endpoint.

**4. Layered System** — client does not know what is between it and the server.
Could be a load balancer, CDN, proxy — client does not care.

**5. Cacheable** — GET responses can be cached.
`GET /products` can be cached for 5 minutes — same response for many users.

**6. Resource-Based** — URLs are nouns (things), not verbs (actions).
```
CORRECT — resources are nouns
GET    /api/v1/products        get all products
POST   /api/v1/products        create a product
GET    /api/v1/products/123    get product 123
PUT    /api/v1/products/123    update product 123
DELETE /api/v1/products/123    delete product 123

WRONG — URLs contain verbs
GET  /api/v1/getProducts
POST /api/v1/createProduct
POST /api/v1/deleteProduct/123
```

---

### 8.3 HTTP Methods and Status Codes

**HTTP Methods:**

| Method | Purpose | Has Body | Use Case |
|---|---|---|---|
| GET | Read | No | Fetch products, get profile |
| POST | Create | Yes | Register, place order, add to cart |
| PUT | Replace completely | Yes | Update entire product |
| PATCH | Update partially | Yes | Update only product price |
| DELETE | Remove | No | Delete product, remove cart item |

**Idempotent** means calling it multiple times gives same result.
GET /products/123 always returns same product.
DELETE /products/123 twice — product is still deleted after both.
POST is NOT idempotent — calling twice creates two products.

**HTTP Status Codes:**

| Code | Name | When to use |
|---|---|---|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST that created something |
| 400 | Bad Request | Missing or invalid data |
| 401 | Unauthorized | Not logged in, token expired |
| 403 | Forbidden | Logged in but not allowed |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate email, already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Bug in your code |

---

### 8.4 MVC + Service Layer Architecture

This project uses 5 layers. Understanding WHY each exists matters more than what it does.

```
Request arrives
      ↓
ROUTE        defines URL + middleware chain + which controller
      ↓
MIDDLEWARE   auth check, rate limit, validation — gates that filter requests
      ↓
CONTROLLER   extracts data from req, calls service, sends response
      ↓
SERVICE      all business logic, all database queries, all calculations
      ↓
MODEL        Mongoose schema, data structure, database operations
      ↓
DATABASE     MongoDB stores and retrieves documents
```

**Why separate Controller and Service?**

Tomorrow you need to create orders from:
1. REST API (web customer)
2. Mobile app (different auth)
3. Admin CLI script (no HTTP at all)
4. Cron job for subscriptions

If order creation logic is in the controller, you copy-paste it 4 times.
Fix a bug in tax calculation → fix it in 4 places → miss one → bug in production.

If logic is in `order.service.ts`, all four call `createOrderService()`.
Fix it once → fixed everywhere.

**The rule:**
- Controllers know about HTTP (req, res, status codes)
- Services know about business (rules, calculations, decisions)
- Models know about data (schema, validation, database)
- Never cross these boundaries

---

### 8.5 Middleware — The Assembly Line

Every Express middleware is a function with this signature:
```typescript
(req: Request, res: Response, next: NextFunction) => void
```

- Call `next()` → pass to next middleware in chain
- Call `res.json(...)` → send response, chain stops
- Call `next(error)` → jump to error handler

**The complete middleware chain for creating a product:**
```typescript
router.post(
  "/products",
  globalLimiter,         // 1. IP made too many requests? Block it
  protect,               // 2. Valid JWT token? Set req.user
  adminOnly,             // 3. req.user.role === "admin"? Continue
  uploadProductImages,   // 4. Parse multipart form, set req.files
  validate(schema),      // 5. req.body matches Zod schema?
  createProduct          // 6. Finally — controller runs
)
```

Request only reaches `createProduct` if it passes all 5 gates.
Every gate is independently testable and reusable.

---

### 8.6 Authentication vs Authorization

**Authentication** — "Who are you?"
Login process. Prove identity with email + password.
Server verifies and issues JWT token.

**Authorization** — "What can you do?"
Even after login, not all actions are permitted.
Regular customer cannot delete products.

```
protect middleware  → Authentication (verify JWT, set req.user)
adminOnly middleware → Authorization (check req.user.role)

router.delete("/products/:id", protect, adminOnly, deleteProduct)
//                              ↑ authn         ↑ authz
```

---

### 8.7 JWT — How Tokens Work Internally

JWT has three parts separated by dots:
```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKK
     HEADER                        PAYLOAD                       SIGNATURE
```

**Header** — base64 encoded JSON:
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload** — base64 encoded JSON (NOT encrypted — anyone can decode it):
```json
{ "id": "507f...", "role": "admin", "email": "ali@mirza.com", "exp": 1717459200 }
```

**Signature** — HMAC-SHA256:
```
HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

If anyone changes the payload (changes role to "admin"), signature breaks.
Server rejects it. This is the security guarantee.

**Never put passwords or secrets in the JWT payload.**
Payload is base64 encoded — not encrypted. Anyone can decode it.

**Complete flow:**
```
1. POST /auth/login { email, password }
2. bcrypt.compare(password, hashedPassword) → true
3. jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: "7d" })
4. Token sent to client
5. Client sends: Authorization: Bearer <token>
6. protect middleware: jwt.verify(token, JWT_SECRET) → decoded
7. req.user = { id, role, email }
8. Controller runs with full user context
```

---

### 8.8 Password Hashing with bcrypt

Never store plain text passwords. Ever.
If database is leaked, plain text passwords expose users on every other website too.

**Hashing is one-way. Encryption is two-way.**
You cannot reverse a hash back to the original password.
bcrypt.compare() hashes the input and compares the hashes — never decrypts.

**Salt** — random string added before hashing so same password gives different hash:
```
"Test@1234" + salt1 → "$2b$12$KIXnq7vGNjrX..."
"Test@1234" + salt2 → "$2b$12$8PqXnm4vGKjr..."  ← different!
```

Salt is stored inside the hash — bcrypt extracts it for comparison.

**Salt rounds = 12:**
2^12 = 4096 hashing iterations.
Modern GPU computes 20 billion MD5 hashes per second.
bcrypt with rounds=12: ~100 hashes per second.
Makes brute force completely impractical.

---

### 8.9 MongoDB and Mongoose Deep Dive

**MongoDB vs SQL:**

| SQL | MongoDB | Notes |
|---|---|---|
| Database | Database | Same concept |
| Table | Collection | products, users, orders |
| Row | Document | One JSON object |
| Column | Field | Property of document |
| JOIN | populate() | Link across collections |
| Foreign Key | ObjectId reference | Manual relationship |

**Why MongoDB for ecommerce:**
Running shoe has fields: sizes[], color, material, sole.
Leather belt has: length, buckle_type.
Sandal has: strap_count, sole_thickness.

SQL needs one giant table with all fields — most are NULL for most products.
MongoDB each document has exactly the fields it needs. No wasted space.

**Key Mongoose operations:**
```typescript
// Create
await Product.create({ name, price, ... })

// Find all with filter
await Product.find({ isActive: true, gender: "men" })
  .populate("category", "name slug")  // join category data
  .sort({ price: 1 })                 // ascending price
  .skip(12)                           // pagination
  .limit(12)

// Find one
await User.findOne({ email }).select("+password")

// Update
await User.findByIdAndUpdate(id, { $set: { name } }, { new: true })

// Delete
await Product.findByIdAndDelete(id)

// Count
await Order.countDocuments({ orderStatus: "pending" })

// Aggregation
await Order.aggregate([
  { $match: { paymentStatus: "paid" } },
  { $group: { _id: null, total: { $sum: "$totalAmount" } } }
])
```

**When to embed vs reference:**

Embed (inside parent document) when:
- Always fetched with parent (user addresses)
- Small bounded array
- Not needed independently

Reference (ObjectId) when:
- Needed independently (products exist without orders)
- Shared across documents (many orders reference same product)
- Could grow unboundedly

---

### 8.10 Mongoose Hooks

Hooks run automatically before or after database operations.
Remove repetitive logic from services.
Guarantee consistency no matter how a document is saved.

```typescript
// Pre-save — runs before .save() or .create()
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return  // skip if unchanged
  this.password = await bcrypt.hash(this.password, 12)
  // Never write bcrypt in a service — happens automatically here
})

ProductSchema.pre("save", function () {
  // Auto-calculate totalStock every save
  this.totalStock = this.sizes.reduce((sum, s) => sum + s.stock, 0)
})

OrderSchema.pre("save", async function () {
  if (this.isNew) {
    const count = await mongoose.model("Order").countDocuments()
    this.orderNumber = `MF-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`
  }
})

// Post-save — runs after .save() completes
ReviewSchema.post("save", async function () {
  // After review saved, update product's average rating
  const stats = await mongoose.model("Review").aggregate([
    { $match: { product: this.product } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ])
  await Product.findByIdAndUpdate(this.product, {
    averageRating: stats[0].avg,
    totalReviews: stats[0].count
  })
})
```

---

### 8.11 Validation with Zod v4

TypeScript types exist only at compile time.
When a real request arrives at runtime, body is raw untyped JSON.
User can send `{ price: "hello", email: null, quantity: -999 }`.
TypeScript will not catch this. Zod will.

**Two validation layers:**
1. Zod — validates shape, types, formats before request reaches controller
2. Mongoose — validates business rules before data reaches database

Both are needed. They catch different things.

**Zod v4 correct patterns:**
```typescript
z.string().min(1, "Name is required")        // required string
z.string().email("Invalid email")             // email format
z.string().regex(/^\d{6}$/, "6 digit code")  // regex pattern
z.number().min(0, "Must be positive")         // number range
z.enum(["card", "upi", "cod"])               // allowed values
z.array(z.string()).min(1)                    // non-empty array
z.string().optional()                         // not required
```

**How validate middleware works:**
```typescript
const validate = (schema: ZodType) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, params: req.params, query: req.query })
    next() // passed — continue to controller
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map(issue => ({
          field: issue.path.slice(1).join("."), // remove "body" prefix
          message: issue.message
        }))
      })
    }
  }
}
```

---

### 8.12 Error Handling

**Three layers of error handling:**

**Layer 1 — asyncWrapper catches promise rejections:**
```typescript
const asyncWrapper = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next) // .catch(next) is the magic
}
```

**Layer 2 — Structured errors from services:**
```typescript
const error = new Error("Product not found") as Error & { statusCode: number }
error.statusCode = 404
throw error
// asyncWrapper's .catch(next) sends this to errorHandler
```

**Layer 3 — Global errorHandler in app.ts (registered last):**
```typescript
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: NODE_ENV === "development" ? err.stack : undefined
  })
}
```

**process handlers for unexpected crashes:**
```typescript
process.on("unhandledRejection", (err) => {
  console.error(err)
  process.exit(1)
})
process.on("uncaughtException", (err) => {
  console.error(err)
  process.exit(1)
})
```

---

### 8.13 asyncWrapper

Without asyncWrapper every controller needs try/catch:
```typescript
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    res.json(product)
  } catch (error) {
    next(error) // easy to forget — causes server crash
  }
}
```

With asyncWrapper — write try/catch once, use everywhere:
```typescript
const asyncWrapper = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next)
}

export const getProduct = asyncWrapper(async (req, res) => {
  const product = await Product.findById(req.params.id as string)
  // if this throws, asyncWrapper catches and forwards to errorHandler
  sendSuccess(res, "Product fetched", { product })
})
```

---

### 8.14 File Uploads — Multer + Cloudinary

**Why you cannot send files as JSON:**
JSON only handles text. Images are binary data.
`multipart/form-data` encoding allows mixing binary and text in one request.

**Complete pipeline:**
```
Client sends multipart/form-data
           ↓
Multer middleware
  - Parses the request
  - Puts file bytes in req.files as Buffer
  - Validates: file type (JPEG/PNG/WebP), size (max 5MB), count (max 5)
           ↓
upload.service.ts
  - Takes Buffer
  - Opens stream to Cloudinary
  - Cloudinary resizes (800x800), compresses, converts to WebP
  - Returns secure_url
           ↓
Product saved with images: ["https://res.cloudinary.com/..."]
```

---

### 8.15 Rate Limiting

Without rate limiting an attacker can try millions of passwords per second.
```
With 10 attempts per 15 minutes:
10 attempts × 4 windows per hour = 40 per hour
A 12 character mixed password has 95^12 = 540,360,087,662,636,963 combinations
At 40 per hour: 540 quadrillion / 40 = 13.5 quadrillion hours to crack
```
Rate limiting makes brute force completely impractical.

---

### 8.16 CORS

Browser Same-Origin Policy: webpage at `http://localhost:3000` cannot make requests to `http://localhost:5000` unless the server explicitly allows it.

CORS headers tell the browser which origins are allowed:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Credentials: true
```

**Important:** CORS is browser-only. Postman and curl ignore CORS.
This is why API tests work in Postman even if CORS is broken.

---

### 8.17 Environment Variables

Your code runs in multiple environments:
- Your laptop (development)
- Teammate's laptop (different database)
- Staging server (testing)
- Production server (real users)

Environment variables let the same code work everywhere without changing code.

**Fail-fast validation pattern:**
```typescript
const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing: ${key}`)
  return value
}
// Server refuses to start if any required variable is missing
// Better to crash at startup than fail mysteriously during a request
```

---

### 8.18 The Service Layer Pattern

The most important architectural decision in this project.

**Rule:** No database query in controllers. No req/res in services.

**Why it matters:**
```typescript
// Service — pure business logic, zero HTTP knowledge
export const createOrderService = async (userId, data) => {
  // fetch cart, validate stock, calculate totals, deduct inventory
  return order
}

// REST controller — HTTP adapter
export const createOrder = asyncWrapper(async (req, res) => {
  const order = await createOrderService(req.user.id, req.body)
  sendSuccess(res, "Order placed", { order }, 201)
})

// CLI script — same service, no HTTP
const order = await createOrderService(adminId, importData)

// Cron job — same service
const order = await createOrderService(userId, subscriptionData)
```

Fix the tax calculation bug once in the service. Fixed everywhere instantly.

---

### 8.19 Pagination

Without pagination `GET /products` returns all 10,000 products.
50MB response. 5 second query. Nobody waits.

```typescript
const page = 2    // requested page
const limit = 12  // items per page
const skip = (page - 1) * limit  // = 12

const [products, total] = await Promise.all([
  Product.find(filter).skip(skip).limit(limit),
  Product.countDocuments(filter)
  // Promise.all runs both queries in parallel — 200ms instead of 400ms
])

return {
  products,
  total,        // 247 total products
  page,         // 2
  totalPages: Math.ceil(total / limit)  // 21 pages
}
```

---

### 8.20 Webhooks vs Polling

**Polling** (bad for payments):
```
Your server: "Did payment succeed?" → Razorpay: "Not yet"
Your server: "Did payment succeed?" → Razorpay: "Not yet"
Your server: "Did payment succeed?" → Razorpay: "Yes!"
```
Wasteful. Delayed. Does not work if user closes browser.

**Webhooks** (correct):
```
Payment succeeds → Razorpay immediately calls your server
Your server verifies signature → updates order → done
```
Instant. Reliable. Works even if user's browser crashes during payment.

**Why verify webhook signature:**
Anyone on the internet can send a POST to your webhook URL.
Without verification a hacker could send `{ "event": "payment.captured" }` and get free orders.
Razorpay signs the payload with your webhook secret — you verify the signature.
If signature fails → reject the request completely.

---

### 8.21 Background Jobs with Bull + Redis

**Problem:** Sending an email takes 500ms-2000ms.
```
Customer places order (50ms)
Backend sends email (1500ms) ← customer waiting 1.5 extra seconds
Backend responds "Order placed"
```

**Solution — job queue:**
```
Customer places order (50ms)
Backend adds "send email" to queue (5ms)  ← instant
Backend responds "Order placed"

[Background — 2 seconds later]
Bull worker picks up job
Sends email (1500ms) ← customer already on confirmation page
```

Redis stores the queue persistently.
Server restart does not lose queued jobs — Bull picks them up when it restarts.

---

### 8.22 TypeScript Patterns Used in This Project

**Interface for Mongoose documents:**
```typescript
export interface IProduct extends Document {
  name: string
  price: number
  gender: "men" | "women" | "unisex" | "kids"  // union type
  sizes: ISizeStock[]
  comparePassword(password: string): Promise<boolean>  // method type
}
```

**AuthRequest — extending Express types:**
```typescript
export interface AuthRequest extends Request {
  user?: JwtPayload  // available after protect middleware
}
```

**Structured error with status code:**
```typescript
const error = new Error("Not found") as Error & { statusCode: number }
error.statusCode = 404
throw error
```

**SortOrder for Mongoose queries:**
```typescript
import { SortOrder } from "mongoose"
const sort: Record<string, SortOrder> = { createdAt: -1 }
// TypeScript knows SortOrder is 1 | -1 | "asc" | "desc"
```

---

## 9. Database Models — Full Reference

### User
```
_id, name, email, password (bcrypt hash, select:false),
phone, role (customer|admin), avatar (Cloudinary URL),
addresses[] (embedded: fullName, phone, street, city, state, pincode, country, isDefault),
isActive, isEmailVerified, passwordResetToken, passwordResetExpires,
createdAt, updatedAt
```

### Product
```
_id, name, slug (auto from name), description, shortDescription,
price, discountPrice, category (ref→Category), brand,
images[] (Cloudinary URLs), sizes[] ({size, stock}),
color, material, gender (men|women|unisex|kids), tags[],
isFeatured, isActive, totalStock (auto-calculated),
averageRating (auto-updated), totalReviews (auto-updated),
createdAt, updatedAt
Indexes: text on name+description+tags, compound on category+gender+isActive
```

### Category
```
_id, name, slug (auto), description, image, isActive, createdAt, updatedAt
```

### Order
```
_id, user (ref→User), orderNumber (auto: MF-2026-00001),
items[] (snapshot: product ref, name, image, size, quantity, price),
shippingAddress (embedded), itemsTotal, shippingCharge, taxAmount,
discountAmount, totalAmount, couponCode,
orderStatus (pending|confirmed|processing|shipped|delivered|cancelled|refunded),
paymentStatus (pending|paid|failed|refunded),
paymentMethod (card|upi|cod|netbanking),
stripePaymentIntentId (used for Razorpay order ID),
trackingNumber, notes, deliveredAt, createdAt, updatedAt
Indexes: user+createdAt, orderNumber, orderStatus
```

### Cart
```
_id, user (ref→User, unique — one cart per user),
items[] ({product ref, size, quantity, price snapshot, name snapshot, image snapshot}),
totalAmount (auto-calculated in pre-save), createdAt, updatedAt
```

### Review
```
_id, product (ref→Product), user (ref→User),
rating (1-5), title, comment, images[],
isVerifiedPurchase, createdAt, updatedAt
Constraint: unique compound index (product, user) — one review per product per user
Post-save hook: auto-updates product averageRating and totalReviews
```

### Coupon
```
_id, code (uppercase, unique), discountType (percentage|fixed),
discountValue, minOrderAmount, maxDiscountAmount (cap for percentage),
usageLimit, usedCount, expiresAt, isActive, createdAt, updatedAt
```

---

## 10. Security Architecture

| Threat | Defense | Implementation |
|---|---|---|
| Brute force login | Rate limit 10/15min | authLimiter middleware |
| Token theft | JWT expiry 7 days | jwt.sign expiresIn |
| Password database leak | bcrypt 12 rounds | User.model pre-save |
| Password in API response | select: false | User.model schema |
| Unauthorized admin access | protect + adminOnly | Every admin route |
| Malformed request data | Zod validation | validate middleware |
| XSS, clickjacking | Helmet headers | app.use(helmet()) |
| Cross-origin attacks | CORS whitelist | corsOptions.ts |
| Secrets in codebase | Environment variables | config/env.ts |
| Secrets in git | .gitignore | .gitignore |
| Fake payment webhooks | Signature verification | payment.service.ts |
| NoSQL injection | Mongoose sanitization | Mongoose query API |
| Server overload | Global rate limit 100/15min | globalLimiter |
| Stolen API keys | .env never committed | .gitignore |

---

## 11. Payment Integration — Razorpay

### Why Razorpay

- Works with Indian bank accounts
- No live website required for testing
- Supports cards, UPI, netbanking, wallets
- Test mode works exactly like production
- Free to integrate, charges only on successful transactions

### Getting Credentials

1. Go to `dashboard.razorpay.com`
2. Create account with Indian phone number
3. Settings → API Keys → Generate Test Mode API Keys
4. Copy Key ID and Key Secret to `.env`
5. Settings → Webhooks → Add Webhook for ngrok URL

### Test Cards

```
Card Number: 4111 1111 1111 1111
Expiry:      12/25
CVV:         123
OTP:         1234
```

### Complete Payment Flow

```
1. Add items to cart
2. POST /api/v1/orders { shippingAddress, paymentMethod: "card" }
3. Copy order _id from response
4. POST /api/v1/payments/create-order { orderId }
5. Copy razorpayOrderId from response
6. Open test-payment.html in browser
7. Paste razorpayOrderId, click Pay Now
8. Enter test card details
9. Razorpay sends webhook to ngrok URL
10. Backend verifies signature, marks order as paid
11. Check MongoDB Atlas — paymentStatus: "paid"
```

### Local Webhook Testing with ngrok

```bash
# Install ngrok from ngrok.com
ngrok http 5000
# Copy https://xxxxx.ngrok-free.app URL
# Add to Razorpay Dashboard → Webhooks
# Add to .env: RAZORPAY_WEBHOOK_SECRET=your_secret
```

---

## 12. Testing Guide — Thunder Client and Postman

### Make Yourself Admin

1. Register a new account via `/api/v1/auth/register`
2. Go to MongoDB Atlas → Browse Collections → users
3. Find your document → Edit → change `role` to `"admin"` → Save
4. Login again to get fresh token with admin role

### Request Setup

**Every protected route:**
```
Headers tab → Add header:
Key:   Authorization
Value: Bearer eyJhbGci...your_token_here
```

**JSON body requests:**
```
Body tab → raw → JSON dropdown → paste JSON
```

**File upload requests (create product):**
```
Body tab → form-data
→ Add text fields (name, price, etc.)
→ Add images field → change type to File → Select Files
→ DO NOT add Content-Type header manually
```

### Testing Order

Always test in this order:
1. Register → Login → copy token
2. Create category → copy _id
3. Create product (with category _id) → copy product _id and slug
4. Add to cart → verify stock decreases
5. Place order → copy order _id
6. Create Razorpay order → copy razorpayOrderId
7. Complete payment in test-payment.html
8. Verify order in MongoDB Atlas shows paymentStatus: "paid"

---

## 13. Troubleshooting — Real Errors Solved

Every error encountered while building this project, with exact fix.

---

**Error: SaveOptions has no call signatures**
```
File: User.model.ts
Cause: Mongoose 8.x removed next() from pre hooks
Fix: Remove next parameter and next() call
// Wrong
UserSchema.pre("save", async function (next) { ... next() })
// Correct
UserSchema.pre("save", async function () { ... })
```

---

**Error: AnyZodObject has no exported member**
```
Cause: Zod v4 renamed AnyZodObject to ZodType
Fix: import { ZodType } from "zod" — use ZodType not AnyZodObject
```

---

**Error: error.errors does not exist**
```
Cause: Zod v4 renamed .errors to .issues
Fix: use error.issues.map(...) not error.errors.map(...)
```

---

**Error: required_error does not exist in type**
```
Cause: Zod v4 removed required_error and invalid_type_error options
Fix: use .min(1, "Field is required") instead
```

---

**Error: SortOrder type mismatch on .sort()**
```
Cause: Mongoose .sort() requires Record<string, SortOrder> not Record<string, unknown>
Fix: import { SortOrder } from "mongoose"
     const sort: Record<string, SortOrder> = { createdAt: -1 }
```

---

**Error: Property _id does not exist on type IAddress / ICartItem**
```
Cause: Mongoose auto-adds _id to subdocuments but TypeScript doesn't know
Fix: Add _id?: mongoose.Types.ObjectId to the interface
```

---

**Error: string | string[] not assignable to parameter of type string**
```
Cause: Express types req.params values as string | string[]
Fix: Cast explicitly: const id = req.params.id as string
```

---

**Error: expiresIn does not exist in type SignCallback**
```
Cause: jwt.sign() overload resolution confused by ENV.JWT_EXPIRE type
Fix: Use "7d" directly and cast options: } as jwt.SignOptions
```

---

**Error: baseUrl deprecated in tsconfig**
```
Cause: TypeScript 5.x deprecated baseUrl option
Fix: Remove baseUrl and paths from tsconfig.json
     Add "ignoreDeprecations": "5.0"
This was causing silent route loading failures — most mysterious bug in the project
```

---

**Error: Route not found for all order routes**
```
Cause: tsconfig.json baseUrl deprecation caused silent TypeScript compilation failure
       Order routes file failed to load without any visible error
Fix: Fixed tsconfig.json as above — all routes loaded immediately after
```

---

**Error: Cannot find module redis**
```
Fix: npm install redis (inside backend folder)
```

---

**Error: Server return invalid JSON response (<!DOCTYPE)**
```
Cause: Route not found — Express returns HTML 404 page
       Postman tries to parse HTML as JSON and shows this error
Fix: Verify correct URL with /api/v1 prefix, correct HTTP method,
     route registered in app.ts and uncommented
```

---

## 14. Remaining Steps

Steps left to complete the backend:

### Step 10 — Coupon System
- `coupon.service.ts` — validate, apply, create, list, delete
- `coupon.controller.ts`
- `coupon.routes.ts`
- `coupon.validator.ts`
- Register in app.ts

### Step 11 — Review System
- `review.service.ts` — create, get, delete, verify purchase
- `review.controller.ts`
- `review.routes.ts`
- Post-save hook already in Review.model.ts auto-updates product rating

### Step 12 — Admin Dashboard
- `admin.service.ts` — dashboard stats, user management
- `admin.controller.ts`
- `admin.routes.ts`
- Revenue charts, top products, order counts

### Step 13 — Email System
- `email.service.ts` — SendGrid integration
- Order confirmation email template
- Welcome email on register
- Password reset email

### Step 14 — Background Jobs
- `jobs/emailQueue.job.ts` — Bull queue for emails
- `jobs/inventoryQueue.job.ts` — stock sync
- Connect queue to email service

### Step 15 — Final Wiring and Testing
- Register all remaining routes in app.ts
- Complete Postman collection testing all 40+ endpoints
- Error case testing for every route
- Final README update

---

## 15. Git Commit Convention

Format:
```
type(scope): short description

- detail about what changed
- another change
```

Types:
```
feat     new feature added
fix      bug fixed
refactor code restructured, no behavior change
chore    config, dependencies, build changes
docs     README or comment updates
test     adding tests
perf     performance improvement
```

Complete commit history:
```bash
feat(backend): initial project setup with Express and TypeScript
feat(config): add database, env, CORS and server configuration
feat(models): add all 7 Mongoose schemas with TypeScript interfaces
feat(security): add JWT auth, Zod v4 validation and rate limiting
feat(auth): add register, login, profile and address management
feat(products): add CRUD with Cloudinary image upload and slug generation
feat(categories): add category management for admin
fix(models): fix Mongoose 8.x pre hook compatibility — remove next() calls
fix(validators): fix Zod v4 breaking changes — required_error and .issues
feat(cart): add cart with smart merge, stock validation and auto-total
feat(orders): add order placement with inventory deduction and tax calculation
fix(tsconfig): remove deprecated baseUrl causing silent route loading failure
feat(payments): integrate Razorpay payment orders and webhook verification
```

---

## 16. What I Learned Building This

**Architecture separates concerns** — models, services, controllers, routes each have one job.
Mixing them creates code that is impossible to maintain or reuse.

**TypeScript saves hours of debugging** — every type error caught at compile time is a bug that never reaches production.
The investment in writing interfaces pays back enormously.

**Security is layered** — rate limiting + JWT + bcrypt + Zod + Helmet + CORS together.
Removing any single layer creates a real vulnerability.
No single measure is sufficient on its own.

**Mongoose hooks are powerful** — password hashing, stock calculation, order numbering, rating updates — all automatic.
Business logic that runs regardless of how a document is saved.

**Fail fast is correct** — validate env vars at startup, reject bad requests at validation layer, crash loudly on unexpected errors.
Silent failures take 10x longer to debug than loud ones.

**Payment webhooks must be verified** — never trust the frontend to say payment succeeded.
Razorpay's HMAC signature verification is the only reliable confirmation.

**Database design is permanent** — embedding vs referencing affects query performance forever.
Think about access patterns before designing schemas.

**Background jobs are essential** — anything taking more than 100ms that does not need to block the response belongs in a queue.
Customers should never wait for email sending.

**Version-specific bugs are real** — Mongoose 8.x, Zod v4, TypeScript 5.x all had breaking changes.
Always check changelogs when upgrading. Read error messages carefully — they tell you exactly what changed.

---

## Author

**Ali Mehdi Mirza**

**Project:** Mirza Footwear Ecommerce Website — Backend API
**Stack:** Express.js + TypeScript + MongoDB + Mongoose + Razorpay + Cloudinary
**Built:** 2026

---

*Read this README once and you can build any backend from scratch.*
*Every concept here applies universally — not just to this project.*

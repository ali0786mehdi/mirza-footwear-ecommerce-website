markdown

# Mirza Footwear — Backend

A production-grade REST API for a full-stack ecommerce footwear brand, built with **Express.js + TypeScript + MongoDB (Mongoose)**. This document serves as both a project reference and a complete backend learning guide.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Environment Setup](#4-environment-setup)
5. [Running the Project](#5-running-the-project)
6. [API Reference](#6-api-reference)
7. [Backend Concepts — Complete Guide](#7-backend-concepts--complete-guide)
   - [What is a REST API?](#71-what-is-a-rest-api)
   - [MVC Architecture](#72-mvc-architecture)
   - [Middleware — The Assembly Line](#73-middleware--the-assembly-line)
   - [Authentication vs Authorization](#74-authentication-vs-authorization)
   - [JWT — How Tokens Work](#75-jwt--how-tokens-work)
   - [Password Hashing](#76-password-hashing)
   - [Mongoose & MongoDB](#77-mongoose--mongodb)
   - [Validation with Zod](#78-validation-with-zod)
   - [Error Handling](#79-error-handling)
   - [File Uploads with Cloudinary](#710-file-uploads-with-cloudinary)
   - [Rate Limiting](#711-rate-limiting)
   - [The Service Layer Pattern](#712-the-service-layer-pattern)
   - [Async/Await & asyncWrapper](#713-asyncawait--asyncwrapper)
   - [HTTP Status Codes](#714-http-status-codes)
   - [Environment Variables](#715-environment-variables)
8. [Database Models](#8-database-models)
9. [Security Checklist](#9-security-checklist)
10. [Git Commit Convention](#10-git-commit-convention)

---

## 1. Project Overview

Mirza Footwear is a complete ecommerce backend covering:

- User registration, login, profile and address management
- Product catalog with categories, filters, search and pagination
- Shopping cart management
- Order placement with automatic inventory deduction and tax calculation
- Stripe payment processing with webhook verification
- Coupon and discount system
- Review and rating system with automatic product rating updates
- Admin dashboard with sales statistics
- Transactional emails via SendGrid
- Background job queues with Bull + Redis
- Image uploads via Cloudinary

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js | JavaScript on the server |
| Framework | Express.js | HTTP server and routing |
| Language | TypeScript | Type safety across the entire codebase |
| Database | MongoDB Atlas | NoSQL document database |
| ODM | Mongoose | MongoDB object modeling with schema validation |
| Auth | JWT + bcryptjs | Token-based auth with hashed passwords |
| Validation | Zod v4 | Runtime schema validation |
| File Uploads | Multer + Cloudinary | Multipart parsing + cloud image storage |
| Payments | Stripe | Payment intents and webhook processing |
| Email | SendGrid | Transactional emails |
| Caching/Queues | Redis + Bull | Background jobs and performance |
| Security | Helmet + CORS + express-rate-limit | HTTP hardening |
| Logging | Winston | Structured server logs |

---

## 3. Folder Structure

```
backend/
└── src/
    ├── config/          # Database, Redis, CORS, environment config
    ├── models/          # Mongoose schemas — the data layer (Vault)
    ├── routes/          # URL definitions and middleware chains (Bridge)
    ├── controllers/     # Request/response handlers (Bridge)
    ├── services/        # Business logic — the core rules (Brain)
    ├── middleware/       # Auth, validation, rate limiting, errors (Bouncer + Shield)
    ├── validators/      # Zod schemas for request body validation (Shield)
    ├── utils/           # Reusable helpers — JWT, hashing, response, asyncWrapper
    ├── integrations/    # Third-party services — Stripe, SendGrid, Cloudinary (Diplomat)
    ├── jobs/            # Background queues — email and inventory sync (Engine)
    ├── types/           # Global TypeScript type declarations
    ├── app.ts           # Express app setup — middleware and routes registered here
    └── server.ts        # Entry point — connects DB then starts listening
```

---

## 4. Environment Setup

Create a `.env` file in the `backend/` root:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mirza-footwear
JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRE=7d
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG....
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
```

> Never commit `.env` to GitHub. It is already in `.gitignore`.

---

## 5. Running the Project

```bash
# Install dependencies
npm install

# Development (hot reload)
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

Health check endpoint — verify server is alive:
```
GET http://localhost:5000/health
```

---

## 6. API Reference

All routes are prefixed with `/api/v1`.

### Auth Routes — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | Public | Create new account |
| POST | `/login` | Public | Login and receive JWT token |
| GET | `/me` | Protected | Get logged-in user profile |
| PUT | `/me` | Protected | Update name, phone, avatar |
| PUT | `/change-password` | Protected | Change password |
| POST | `/address` | Protected | Add a delivery address |
| DELETE | `/address/:id` | Protected | Remove a delivery address |

### Product Routes — `/api/v1/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Get all products with filters |
| GET | `/featured` | Public | Get featured products |
| GET | `/slug/:slug` | Public | Get product by slug |
| GET | `/:id/related` | Public | Get related products |
| POST | `/` | Admin | Create product with images |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id/image` | Admin | Delete a product image |
| DELETE | `/:id` | Admin | Delete product |

**Query params for GET /products:**
```
?page=1&limit=12&category=<id>&gender=men&minPrice=500&maxPrice=3000
&search=running&sortBy=price_asc&isFeatured=true
```

### Category Routes — `/api/v1/categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Get all categories |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Cart Routes — `/api/v1/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Protected | Get user's cart |
| POST | `/` | Protected | Add item to cart |
| PUT | `/:itemId` | Protected | Update item quantity |
| DELETE | `/:itemId` | Protected | Remove item from cart |
| DELETE | `/` | Protected | Clear entire cart |

### Order Routes — `/api/v1/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Protected | Place order from cart |
| GET | `/my-orders` | Protected | Get user's order history |
| GET | `/:id` | Protected | Get single order detail |
| PUT | `/:id/cancel` | Protected | Cancel an order |
| GET | `/` | Admin | Get all orders |
| PUT | `/:id/status` | Admin | Update order status |

### Payment Routes — `/api/v1/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/create-intent` | Protected | Create Stripe payment intent |
| POST | `/webhook` | Public | Stripe webhook handler |

### Review Routes — `/api/v1/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:productId` | Public | Get reviews for a product |
| POST | `/:productId` | Protected | Submit a review |
| DELETE | `/:id` | Protected | Delete own review |

### Coupon Routes — `/api/v1/coupons`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/validate` | Protected | Validate a coupon code |
| POST | `/` | Admin | Create coupon |
| GET | `/` | Admin | Get all coupons |
| DELETE | `/:id` | Admin | Delete coupon |

---

## 7. Backend Concepts — Complete Guide

This section explains every major backend concept used in this project. Read this once and you will understand how to build any backend from scratch.

---

### 7.1 What is a REST API?

REST (Representational State Transfer) is a set of rules for how a frontend and backend communicate over HTTP.

Every request has four parts:
- **Method** — what action to perform (GET, POST, PUT, DELETE)
- **URL** — which resource to act on (`/api/v1/products`)
- **Headers** — metadata like `Authorization: Bearer <token>`
- **Body** — data sent with the request (JSON for POST/PUT)

Every response has:
- **Status code** — number indicating success or failure (200, 404, 500)
- **Body** — JSON data sent back to the frontend

Rule of thumb:
```
GET    → read data        → never has a body
POST   → create data      → has a body
PUT    → update data      → has a body
DELETE → delete data      → usually no body
```

---

### 7.2 MVC Architecture

This project uses a layered architecture based on MVC (Model-View-Controller). In a REST API there is no View — the frontend handles that. So we have:

```
Request → Route → Middleware → Controller → Service → Model → Database
                                    ↓
                               Response sent back
```

**Model** — defines the shape of data in the database. Example: `User.model.ts` defines that every user has a name, email, password, and role.

**Controller** — receives the HTTP request, extracts data from `req.body` or `req.params`, calls the appropriate service, and sends back the response. Controllers never touch the database directly.

**Service** — contains all business logic. Example: `order.service.ts` calculates the total price including tax, checks stock availability, deducts inventory, and creates the order. Services never touch `req` or `res`.

**Why separate Controller and Service?**
If you ever want to call the same business logic from a background job or a CLI script, the service works without needing an HTTP request. The controller is just a HTTP adapter on top of the service.

---

### 7.3 Middleware — The Assembly Line

Middleware is a function that runs between the request arriving and the controller handling it. Every middleware receives `req`, `res`, and `next`. Calling `next()` passes control to the next middleware. Not calling it stops the chain.

```
Request
   ↓
helmet()              sets secure HTTP headers
   ↓
cors()                checks if this origin is allowed
   ↓
express.json()        parses JSON body into req.body
   ↓
globalLimiter         checks request count from this IP
   ↓
validate(schema)      checks req.body shape with Zod
   ↓
protect               verifies JWT token, sets req.user
   ↓
adminOnly             checks req.user.role === "admin"
   ↓
controller            finally handles the request
   ↓
errorHandler          catches anything that went wrong
```

This is the most important concept in Express. Every layer of protection is just middleware in a chain.

---

### 7.4 Authentication vs Authorization

These two words are often confused. They are completely different things.

**Authentication** — proving who you are. This is the login step. You provide your email and password, the server verifies them, and issues a JWT token. From this point the server knows who you are.

**Authorization** — proving what you are allowed to do. Even after login, a regular customer should not be able to delete products or view all orders. The `adminOnly` middleware checks your role and blocks you if you do not have permission.

In code:
```
protect middleware    → Authentication (who are you?)
adminOnly middleware  → Authorization (what can you do?)
```

---

### 7.5 JWT — How Tokens Work

JWT (JSON Web Token) is a string that the server gives you after login. You send it back with every future request to prove you are logged in.

A JWT has three parts separated by dots:
```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     HEADER                        PAYLOAD                              SIGNATURE
```

- **Header** — algorithm used (HS256)
- **Payload** — data stored inside the token (user id, role, email). This is NOT encrypted — anyone can decode it. Never put passwords here.
- **Signature** — the server signs the payload with `JWT_SECRET`. If anyone tampers with the payload, the signature breaks and the server rejects it.

Flow:
```
1. User logs in with email + password
2. Server verifies credentials
3. Server creates JWT: jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: "7d" })
4. Server sends token to client
5. Client stores token (localStorage or memory)
6. Client sends token in every request: Authorization: Bearer <token>
7. protect middleware calls jwt.verify(token, JWT_SECRET)
8. If valid → req.user = decoded payload → controller runs
9. If invalid or expired → 401 Unauthorized
```

The server never stores the token. It just verifies the signature on every request. This is called **stateless authentication**.

---

### 7.6 Password Hashing

Passwords are never stored as plain text. Ever. If your database is leaked, plain text passwords expose every user's account on every website they use the same password.

Hashing converts a password into a fixed-length scrambled string:
```
"Test@1234" → "$2b$12$KIXnq7vGNjrXzuBxMz1rOuV8FQeL3Y2..."
```

This is a one-way operation — you cannot reverse a hash back to the original password. To verify a login, you hash the entered password and compare it to the stored hash.

This project uses **bcrypt** with a salt round of 12. The salt round controls how slow the hashing is — higher = slower = harder to brute force. 12 is the industry standard balance.

The hashing happens automatically in the `User.model.ts` pre-save hook:
```typescript
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});
```

This means you never manually hash passwords anywhere in your services. Just assign `user.password = newPassword` and save — the model handles it.

---

### 7.7 Mongoose & MongoDB

MongoDB stores data as documents (JSON-like objects) in collections (like tables). Mongoose adds a schema layer on top so your documents have a defined structure.

**Schema** — defines the shape and rules of a document:
```typescript
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true }
})
```

**Model** — the interface for querying the collection:
```typescript
// Create
await User.create({ name: "Ali", email: "ali@test.com" })

// Read
await User.findById(id)
await User.findOne({ email: "ali@test.com" })
await User.find({ role: "admin" })

// Update
await User.findByIdAndUpdate(id, { $set: { name: "New Name" } }, { new: true })

// Delete
await User.findByIdAndDelete(id)
```

**Populate** — MongoDB stores references as IDs. Populate replaces the ID with the actual document:
```typescript
// Without populate: { category: "507f1f77bcf86cd799439011" }
// With populate:    { category: { name: "Running Shoes", slug: "running-shoes" } }
await Product.findById(id).populate("category", "name slug")
```

**Pre-save hooks** — run automatically before a document is saved:
```typescript
ProductSchema.pre("save", function () {
  this.totalStock = this.sizes.reduce((sum, s) => sum + s.stock, 0)
})
```

**Indexes** — speed up queries. Without an index, MongoDB scans every document. With an index, it jumps directly to the result. Always index fields you filter or sort by frequently:
```typescript
ProductSchema.index({ category: 1, gender: 1, isActive: 1 })
```

---

### 7.8 Validation with Zod

Validation ensures incoming request data is the correct shape before it reaches your business logic. Without validation, a user could send `{ price: "hello" }` and crash your database operation.

Zod defines the expected shape as a schema:
```typescript
const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Too short"),
  })
})
```

The `validate` middleware runs this schema against `req.body`. If it fails, it sends back a structured error before the controller even runs:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

This is called **fail fast** — reject bad data as early as possible. Never let invalid data reach your database.

---

### 7.9 Error Handling

There are two types of errors in Express:

**Operational errors** — expected errors you can handle gracefully. User not found (404), wrong password (401), duplicate email (409). These are thrown from services with a `statusCode` attached.

**Programming errors** — unexpected crashes. Database connection drops, null reference, etc. These should crash loudly so you can fix them.

This project handles both with:

**asyncWrapper** — wraps every controller so unhandled promise rejections are caught and forwarded to the error handler instead of crashing the server:
```typescript
const asyncWrapper = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next)  // .catch(next) sends error to errorHandler
}
```

**errorHandler middleware** — the last middleware in `app.ts`. Catches everything that falls through:
```typescript
app.use(errorHandler)  // must be registered LAST
```

**Throwing errors from services** — the pattern used throughout this project:
```typescript
const error = new Error("Product not found") as Error & { statusCode: number }
error.statusCode = 404
throw error
// asyncWrapper catches this → errorHandler sends 404 response
```

---

### 7.10 File Uploads with Cloudinary

File uploads use two libraries working together:

**Multer** — parses `multipart/form-data` requests (the format browsers use to send files). It gives you `req.file` or `req.files` with the file buffer in memory.

**Cloudinary** — cloud image storage. Receives the buffer from Multer and stores it permanently, returning a URL you save in the database.

Flow:
```
Frontend sends form-data with image file
           ↓
uploadProductImages (Multer middleware)
           ↓
req.files = [{ buffer: <image bytes>, mimetype: "image/jpeg" }]
           ↓
uploadMultipleImages(files, "products")
           ↓
Cloudinary stores image, returns secure URL
           ↓
Product saved to MongoDB with URL as string
```

The key insight: your database never stores the actual image. It stores a URL string pointing to Cloudinary. Images live in the cloud, not your server.

---

### 7.11 Rate Limiting

Rate limiting prevents abuse. Without it, an attacker could make 10,000 login attempts per second trying to guess passwords (brute force attack).

This project uses two limiters:

**globalLimiter** — applied to all routes. 100 requests per 15 minutes per IP address. Generous enough for normal use, tight enough to slow down automated attacks.

**authLimiter** — applied only to `/register` and `/login`. 10 requests per 15 minutes per IP. A real user trying to login will never hit this. An attacker trying 1000 passwords will be blocked after 10.

---

### 7.12 The Service Layer Pattern

The most important architectural decision in this project. Every piece of business logic lives in a service file, never in a controller.

**Controller's only job:**
1. Extract data from `req`
2. Call service
3. Send response with `sendSuccess` or `sendError`

**Service's job:**
1. All database queries
2. All calculations (totals, taxes, discounts)
3. All business rules (can't order out-of-stock item, discount must be less than price)
4. All side effects (deduct inventory, send email, update rating)

Why this matters: if tomorrow you want to build a mobile app, a CLI tool, or a cron job — they all call the same service functions. The business logic is reusable. The controller is just one of many ways to trigger it.

---

### 7.13 Async/Await & asyncWrapper

Every database operation in Node.js is asynchronous — it does not block the thread while waiting for MongoDB. You use `async/await` to write asynchronous code that reads like synchronous code.

Without asyncWrapper, every controller needs its own try/catch:
```typescript
// Without asyncWrapper — repetitive
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    res.json(product)
  } catch (error) {
    next(error)  // you have to remember to call next(error) every time
  }
}
```

With asyncWrapper — clean:
```typescript
// With asyncWrapper — error forwarding is automatic
export const getProduct = asyncWrapper(async (req, res) => {
  const product = await Product.findById(req.params.id)
  sendSuccess(res, "Product fetched", { product })
})
```

asyncWrapper does the try/catch once so you never have to write it again.

---

### 7.14 HTTP Status Codes

Every response must include the correct status code. Sending 200 OK for an error is wrong — clients rely on status codes to understand what happened.

| Code | Meaning | When to use |
|---|---|---|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST that created a resource |
| 400 | Bad Request | Missing or invalid data in request |
| 401 | Unauthorized | Not logged in or token invalid |
| 403 | Forbidden | Logged in but not allowed (wrong role) |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate — email already registered |
| 422 | Unprocessable | Validation failed |
| 500 | Server Error | Unexpected crash — never send this intentionally |

---

### 7.15 Environment Variables

Environment variables keep secrets out of your code. Your JWT secret, database password, and Stripe key must never be hardcoded in code or committed to GitHub.

`.env` file — lives only on your machine and your server. Added to `.gitignore`. Contains all secrets.

`.env.example` — committed to GitHub. Shows what variables are needed but with fake values. New developers copy this and fill in their own values.

`config/env.ts` validates that every required variable exists when the server starts. If `MONGO_URI` is missing, the server crashes immediately with a clear message instead of failing silently later.

```typescript
const required = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env variable: ${key}`)
  return value
}
```

---

## 8. Database Models

| Model | Key Fields | Relationships |
|---|---|---|
| User | name, email, password (hashed), role, addresses[] | Orders, Reviews, Cart |
| Product | name, slug, price, sizes[], images[], gender | Category, Reviews |
| Category | name, slug, isActive | Products |
| Order | orderNumber, items[], totalAmount, orderStatus, paymentStatus | User, Products |
| Cart | items[], totalAmount | User, Products |
| Review | rating, comment, isVerifiedPurchase | User, Product |
| Coupon | code, discountType, discountValue, expiresAt, usageLimit | Orders |

---

## 9. Security Checklist

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire after 7 days
- `password` field has `select: false` — never returned in queries
- Helmet sets secure HTTP headers on every response
- CORS whitelist — only your frontend origins are allowed
- Rate limiting on auth routes — blocks brute force
- Zod validation — malformed data rejected before reaching business logic
- `.env` in `.gitignore` — secrets never committed
- Stripe webhook signature verified — prevents fake payment events
- Admin routes protected by both `protect` and `adminOnly` middleware

---

## 10. Git Commit Convention

This project follows **Conventional Commits**:

```
type(scope): short description

- what was added or changed
- what was added or changed
```

Types used in this project:

| Type | When to use |
|---|---|
| `feat` | New feature added |
| `fix` | Bug fixed |
| `refactor` | Code restructured, no behavior change |
| `chore` | Config, dependencies, build changes |
| `docs` | README or comment updates |

Examples:
```bash
git commit -m "feat(auth): add JWT login and register endpoints"
git commit -m "feat(products): add Cloudinary image upload"
git commit -m "fix(orders): correct tax calculation rounding"
git commit -m "chore(deps): update mongoose to 8.x"
```

---

## Author

**Ali Mehdi Mirza** 

Mirza Footwear Ecommerce Website — Backend API

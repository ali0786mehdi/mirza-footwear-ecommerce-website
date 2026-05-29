import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./config/corsOptions";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { globalLimiter } from "./middleware/rateLimiter.middleware";

// ─── Model registration ───────────────────────────────────────────
import "./models/User.model";
import "./models/Category.model";
import "./models/Product.model";
import "./models/Cart.model";
import "./models/Order.model";
import "./models/Review.model";
import "./models/Coupon.model";

// ─── Route imports ────────────────────────────────────────────────
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";

const app: Application = express();
console.log("APP.TS IS LOADING");
// TEMPORARY DEBUG — remove after fixing
app.use((req, _res, next) => {
  console.log(`>>> ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Security middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ─── Body parsers ─────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(globalLimiter);

// ─── Health check ─────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Mirza Footwear API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);
console.log("REGISTERING ORDER ROUTES:", typeof orderRoutes);
app.use("/api/v1/orders", orderRoutes);

// ─── 404 handler ──────────────────────────────────────────────────
// ─── 404 handler ──────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "GHOST BUSTED 404: Mirza API could not find this!", // <-- CHANGE THIS LINE
  });
});

// ─── Global error handler (must be last) ──────────────────────────
app.use(errorHandler);

export default app;
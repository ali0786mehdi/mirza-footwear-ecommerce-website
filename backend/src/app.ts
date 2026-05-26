import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./config/corsOptions";
import { errorHandler } from "./middleware/errorHandler.middleware";

// ─── Route imports (we'll fill these in as we build each module) ───
// import authRoutes from "./routes/auth.routes";
// import productRoutes from "./routes/product.routes";
// import orderRoutes from "./routes/order.routes";
// import cartRoutes from "./routes/cart.routes";
// import paymentRoutes from "./routes/payment.routes";
// import reviewRoutes from "./routes/review.routes";
// import adminRoutes from "./routes/admin.routes";
// import couponRoutes from "./routes/coupon.routes";

const app: Application = express();

// ─── Security middleware ───────────────────────────────────────────
app.use(helmet());        // sets secure HTTP headers automatically
app.use(cors(corsOptions)); // restrict cross-origin requests

// ─── Body parsers ─────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health check ─────────────────────────────────────────────────
// Always keep this — it lets you verify the server is alive
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Mirza Footwear API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── API routes ───────────────────────────────────────────────────
// We uncomment these one by one as we build each module
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/products", productRoutes);
// app.use("/api/v1/orders", orderRoutes);
// app.use("/api/v1/cart", cartRoutes);
// app.use("/api/v1/payments", paymentRoutes);
// app.use("/api/v1/reviews", reviewRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/coupons", couponRoutes);

// ─── 404 handler ──────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Global error handler (must be last) ──────────────────────────
app.use(errorHandler);

export default app;
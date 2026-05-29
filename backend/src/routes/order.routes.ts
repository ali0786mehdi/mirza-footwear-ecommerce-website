import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from "../controllers/order.controller";
import protect from "../middleware/auth.middleware";
import adminOnly from "../middleware/admin.middleware";
import validate from "../middleware/validate.middleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator";

const router = Router();

// ─── POST / — place order ─────────────────────────────────────────
router.post("/", protect, validate(createOrderSchema), createOrder);

// ─── GET /my-orders ───────────────────────────────────────────────
router.get("/my-orders", protect, getMyOrders);

// ─── GET /stats — admin ───────────────────────────────────────────
router.get("/stats", protect, adminOnly, getOrderStats);

// ─── GET / — admin: all orders ────────────────────────────────────
router.get("/", protect, adminOnly, getAllOrders);

// ─── GET /:id ─────────────────────────────────────────────────────
router.get("/:id", protect, getOrderById);

// ─── PUT /:id/cancel ──────────────────────────────────────────────
router.put("/:id/cancel", protect, cancelOrder);

// ─── PUT /:id/status — admin ──────────────────────────────────────
router.put(
  "/:id/status",
  protect,
  adminOnly,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
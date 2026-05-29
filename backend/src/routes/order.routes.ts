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
// ─── All order routes require authentication ───────────────────────
router.use(protect);

// ─── Customer routes ──────────────────────────────────────────────
// CRITICAL: specific routes must come before parameterized routes
// /my-orders and /stats must be defined before /:id
// otherwise Express matches "my-orders" as an :id value
router.get("/my-orders", getMyOrders);
router.get("/stats", adminOnly, getOrderStats);
router.post("/", validate(createOrderSchema), createOrder);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

// ─── Admin only routes ────────────────────────────────────────────
router.get("/", adminOnly, getAllOrders);
router.put(
  "/:id/status",
  adminOnly,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
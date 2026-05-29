import { Router } from "express";
import {
  getCart,
  getCartCount,
  addToCart,
  updateCartItem,
  clearCart,
  removeCartItem,
} from "../controllers/cart.controller";
import protect from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/cart.validator";

const router = Router();

// All cart routes require authentication — apply protect to all
// Instead of writing protect on every route, use router.use()
router.use(protect);

// ─── GET routes ───────────────────────────────────────────────────
router.get("/", getCart);
router.get("/count", getCartCount);

// ─── POST routes ──────────────────────────────────────────────────
router.post("/", validate(addToCartSchema), addToCart);

// ─── PUT routes ───────────────────────────────────────────────────
router.put("/:itemId", validate(updateCartItemSchema), updateCartItem);

// ─── DELETE routes ────────────────────────────────────────────────
// CRITICAL: /clear must come BEFORE /:itemId
// If /:itemId comes first, Express treats "clear" as an itemId
router.delete("/clear", clearCart);
router.delete("/:itemId", removeCartItem);

export default router;
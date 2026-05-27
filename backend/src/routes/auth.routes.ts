import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
} from "../controllers/auth.controller";
import protect from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";
import { authLimiter } from "../middleware/rateLimiter.middleware";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator";

const router = Router();

// ─── Public routes (no token needed) ─────────────────────────────
router.post(
  "/register",
  authLimiter,             // max 10 attempts per 15 min
  validate(registerSchema), // validate body shape
  register                  // controller
);

router.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  login
);

// ─── Protected routes (valid JWT token required) ──────────────────
router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/address", protect, addAddress);
router.delete("/address/:addressId", protect, deleteAddress);

export default router;
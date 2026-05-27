import { Router } from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} from "../controllers/product.controller";
import protect from "../middleware/auth.middleware";
import adminOnly from "../middleware/admin.middleware";
import { uploadProductImages } from "../middleware/upload.middleware";

const router = Router();

// ─── Public routes ────────────────────────────────────────────────
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id/related", getRelatedProducts);

// ─── Admin only routes ────────────────────────────────────────────
router.post(
  "/",
  protect,
  adminOnly,
  uploadProductImages,  // multer runs first — parses multipart form
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadProductImages,
  updateProduct
);

router.delete("/:id/image", protect, adminOnly, deleteProductImage);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
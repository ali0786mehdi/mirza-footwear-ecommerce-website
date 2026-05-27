import { Request, Response } from "express";
import { AuthRequest } from "../utils/jwt.utils";
import asyncWrapper from "../utils/asyncWrapper.utils";
import { sendSuccess, sendError } from "../utils/apiResponse.utils";
import {
  getAllProductsService,
  getProductBySlugService,
  getProductByIdService,
  createProductService,
  updateProductService,
  deleteProductService,
  deleteProductImageService,
  getFeaturedProductsService,
  getRelatedProductsService,
} from "../services/product.service";

// ─── GET /api/v1/products ─────────────────────────────────────────
export const getAllProducts = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const {
      page,
      limit,
      category,
      gender,
      minPrice,
      maxPrice,
      search,
      sortBy,
      isFeatured,
    } = req.query;

    const result = await getAllProductsService({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      category: category as string,
      gender: gender as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      search: search as string,
      sortBy: sortBy as string,
      isFeatured: isFeatured === "true" ? true : undefined,
    });

    sendSuccess(res, "Products fetched successfully", result);
  }
);

// ─── GET /api/v1/products/featured ───────────────────────────────
export const getFeaturedProducts = asyncWrapper(
  async (_req: Request, res: Response): Promise<void> => {
    const products = await getFeaturedProductsService();
    sendSuccess(res, "Featured products fetched", { products });
  }
);

// ─── GET /api/v1/products/slug/:slug ─────────────────────────────
export const getProductBySlug = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const slug = req.params.slug as string;
    const product = await getProductBySlugService(slug);
    sendSuccess(res, "Product fetched successfully", { product });
  }
);

// ─── GET /api/v1/products/:id/related ────────────────────────────
export const getRelatedProducts = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { categoryId } = req.query;

    if (!categoryId) {
      sendError(res, "categoryId query param is required", 400);
      return;
    }

    const products = await getRelatedProductsService(
      id,
      categoryId as string
    );
    sendSuccess(res, "Related products fetched", { products });
  }
);

// ─── POST /api/v1/products — admin only ──────────────────────────
export const createProduct = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];

    if (typeof req.body.sizes === "string") {
      req.body.sizes = JSON.parse(req.body.sizes);
    }
    if (typeof req.body.tags === "string") {
      req.body.tags = JSON.parse(req.body.tags);
    }
    if (req.body.price) req.body.price = parseFloat(req.body.price);
    if (req.body.discountPrice)
      req.body.discountPrice = parseFloat(req.body.discountPrice);

    const product = await createProductService(req.body, files);
    sendSuccess(res, "Product created successfully", { product }, 201);
  }
);

// ─── PUT /api/v1/products/:id — admin only ───────────────────────
export const updateProduct = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const files = req.files as Express.Multer.File[] | undefined;

    if (typeof req.body.sizes === "string") {
      req.body.sizes = JSON.parse(req.body.sizes);
    }
    if (req.body.price) req.body.price = parseFloat(req.body.price);
    if (req.body.discountPrice)
      req.body.discountPrice = parseFloat(req.body.discountPrice);

    const product = await updateProductService(id, req.body, files);
    sendSuccess(res, "Product updated successfully", { product });
  }
);

// ─── DELETE /api/v1/products/:id/image — admin only ──────────────
export const deleteProductImage = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      sendError(res, "imageUrl is required in request body", 400);
      return;
    }

    const product = await deleteProductImageService(id, imageUrl);
    sendSuccess(res, "Image deleted successfully", { product });
  }
);

// ─── DELETE /api/v1/products/:id — admin only ────────────────────
export const deleteProduct = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const id = req.params.id as string;
    await deleteProductService(id);
    sendSuccess(res, "Product deleted successfully");
  }
);
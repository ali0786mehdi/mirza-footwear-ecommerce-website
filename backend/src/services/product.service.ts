import Product, { IProduct } from "../models/Product.model";
import Category from "../models/Category.model";
import { SortOrder } from "mongoose";
import { deleteImage, uploadMultipleImages } from "./upload.service";
import { CreateProductInput, UpdateProductInput } from "../validators/product.validator";
import slugify from "slugify";

interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  isFeatured?: boolean;
}

interface ProductsResult {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── GET ALL PRODUCTS (with filter, sort, search, pagination) ─────
export const getAllProductsService = async (
  query: ProductQuery
): Promise<ProductsResult> => {
  const {
    page = 1,
    limit = 12,
    category,
    gender,
    minPrice,
    maxPrice,
    search,
    sortBy = "createdAt",
    isFeatured,
  } = query;

  // Build filter object dynamically
  const filter: Record<string, unknown> = { isActive: true };

  if (category) filter.category = category;
  if (gender) filter.gender = gender;
  if (isFeatured !== undefined) filter.isFeatured = isFeatured;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined)
      (filter.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined)
      (filter.price as Record<string, number>).$lte = maxPrice;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  // Sort options
  // Sort options
  const sortOptions: Record<string, SortOrder> = {};
  switch (sortBy) {
    case "price_asc":
      sortOptions.price = 1;
      break;
    case "price_desc":
      sortOptions.price = -1;
      break;
    case "rating":
      sortOptions.averageRating = -1;
      break;
    case "newest":
      sortOptions.createdAt = -1;
      break;
    default:
      sortOptions.createdAt = -1;
  }
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// ─── GET SINGLE PRODUCT BY SLUG ───────────────────────────────────
export const getProductBySlugService = async (
  slug: string
): Promise<IProduct> => {
  const product = await Product.findOne({ slug, isActive: true }).populate(
    "category",
    "name slug"
  );

  if (!product) {
    const error = new Error("Product not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  return product;
};

// ─── GET SINGLE PRODUCT BY ID ─────────────────────────────────────
export const getProductByIdService = async (
  id: string
): Promise<IProduct> => {
  const product = await Product.findById(id).populate("category", "name slug");

  if (!product) {
    const error = new Error("Product not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  return product;
};

// ─── CREATE PRODUCT (admin only) ──────────────────────────────────
export const createProductService = async (
  data: CreateProductInput,
  files: Express.Multer.File[]
): Promise<IProduct> => {
  // 1. Verify category exists
  const category = await Category.findById(data.category);
  if (!category) {
    const error = new Error("Category not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  // 2. Generate unique slug from product name
  let slug = slugify(data.name, { lower: true, strict: true });

  // Check if slug already exists and make it unique
  const existingProduct = await Product.findOne({ slug });
  if (existingProduct) {
    slug = `${slug}-${Date.now()}`;
  }

  // 3. Upload images to Cloudinary
  if (!files || files.length === 0) {
    const error = new Error("At least one product image is required") as Error & {
      statusCode: number;
    };
    error.statusCode = 400;
    throw error;
  }

  const imageUrls = await uploadMultipleImages(files, "products");

  // 4. Create product
  const product = await Product.create({
    ...data,
    slug,
    images: imageUrls,
    brand: "Mirza Footwear",
  });

  return product;
};

// ─── UPDATE PRODUCT (admin only) ──────────────────────────────────
// ─── UPDATE PRODUCT (admin only) ──────────────────────────────────
export const updateProductService = async (
  id: string,
  data: UpdateProductInput,
  files?: Express.Multer.File[]
): Promise<IProduct> => {
  const product = await Product.findById(id);

  if (!product) {
    const error = new Error("Product not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  // Build update object explicitly — avoids the undefined spread issue
  const updateData: Record<string, unknown> = { ...data };

  // If new images uploaded, merge with existing
  if (files && files.length > 0) {
    const newImageUrls = await uploadMultipleImages(files, "products");
    updateData.images = [...product.images, ...newImageUrls];
  }

  // Update slug only if name was provided and actually changed
  if (
    updateData.name &&
    typeof updateData.name === "string" &&
    updateData.name !== product.name
  ) {
    let newSlug = slugify(updateData.name, { lower: true, strict: true });
    const existing = await Product.findOne({
      slug: newSlug,
      _id: { $ne: id },
    });
    if (existing) newSlug = `${newSlug}-${Date.now()}`;
    updateData.slug = newSlug;
  }

  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("category", "name slug");

  return updated!;
};

// ─── DELETE PRODUCT IMAGE ─────────────────────────────────────────
export const deleteProductImageService = async (
  productId: string,
  imageUrl: string
): Promise<IProduct> => {
  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("Product not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  if (product.images.length === 1) {
    const error = new Error(
      "Cannot delete the only image. Upload a new image first"
    ) as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  // Remove from Cloudinary
  await deleteImage(imageUrl);

  // Remove from product
  product.images = product.images.filter((img) => img !== imageUrl);
  await product.save();

  return product;
};

// ─── DELETE PRODUCT (admin only) ──────────────────────────────────
export const deleteProductService = async (id: string): Promise<void> => {
  const product = await Product.findById(id);

  if (!product) {
    const error = new Error("Product not found") as Error & {
      statusCode: number;
    };
    error.statusCode = 404;
    throw error;
  }

  // Delete all images from Cloudinary first
  await Promise.all(product.images.map((img) => deleteImage(img)));

  await Product.findByIdAndDelete(id);
};

// ─── GET FEATURED PRODUCTS ────────────────────────────────────────
export const getFeaturedProductsService = async (): Promise<IProduct[]> => {
  return Product.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .limit(8)
    .sort({ createdAt: -1 });
};

// ─── GET RELATED PRODUCTS ─────────────────────────────────────────
export const getRelatedProductsService = async (
  productId: string,
  categoryId: string
): Promise<IProduct[]> => {
  return Product.find({
    category: categoryId,
    _id: { $ne: productId }, // exclude current product
    isActive: true,
  })
    .populate("category", "name slug")
    .limit(4);
};
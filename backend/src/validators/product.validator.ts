import { z } from "zod";

const sizeStockSchema = z.object({
  size: z.number().min(3, "Size cannot be less than 3").max(15, "Size cannot exceed 15"),
  stock: z.number().min(0, "Stock cannot be negative"),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(120),
    description: z.string().min(20, "Description must be at least 20 characters").max(2000),
    shortDescription: z.string().max(300),
    price: z.number().min(0, "Price cannot be negative"),
    discountPrice: z.number().min(0).optional(),
    category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID"),
    color: z.string().trim(),
    material: z.string().optional(),
    gender: z.enum(["men", "women", "unisex", "kids"]),
    sizes: z.array(sizeStockSchema).min(1, "At least one size must be provided"),
    tags: z.array(z.string()).optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
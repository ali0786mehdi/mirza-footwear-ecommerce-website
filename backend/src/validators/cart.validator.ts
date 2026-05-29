import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z
      .string()
      .min(1, "Product ID is required")
      .regex(/^[a-f\d]{24}$/i, "Invalid product ID format"),

    size: z
      .number()
      .min(3, "Size cannot be less than 3")
      .max(15, "Size cannot exceed 15"),

    quantity: z
      .number()
      .min(1, "Quantity must be at least 1")
      .max(10, "Cannot add more than 10 of the same item")
      .default(1),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z
      .number()
      .min(1, "Quantity must be at least 1")
      .max(10, "Cannot have more than 10 of the same item"),
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>["body"];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>["body"];
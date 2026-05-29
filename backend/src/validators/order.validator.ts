import { z } from "zod";

const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian mobile number"),
  street: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .trim(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .trim(),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .trim(),
  pincode: z
    .string()
    .regex(/^\d{6}$/, "Please provide a valid 6-digit pincode"),
  country: z.string().default("India"),
});

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
    paymentMethod: z.enum(["card", "upi", "cod", "netbanking"], {
      message: "Payment method must be card, upi, cod or netbanking",
    }),
    couponCode: z.string().optional(),
    notes: z
      .string()
      .max(300, "Notes cannot exceed 300 characters")
      .optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    orderStatus: z.enum(
      ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      { message: "Invalid order status" }
    ),
    trackingNumber: z.string().optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>["body"];
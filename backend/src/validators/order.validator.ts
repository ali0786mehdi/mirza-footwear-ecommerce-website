import { z } from "zod";

const shippingAddressSchema = z.object({
  fullName: z.string().trim(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please provide a valid Indian mobile number"),
  street: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  pincode: z.string().regex(/^\d{6}$/, "Please provide a valid 6-digit pincode"),
  country: z.string().default("India"),
});

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
    paymentMethod: z.enum(["card", "upi", "cod", "netbanking"]),
    couponCode: z.string().optional(),
    notes: z.string().max(300).optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>["body"];
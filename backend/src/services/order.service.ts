import mongoose, { SortOrder } from "mongoose";
import Order, { IOrder, OrderStatus } from "../models/Order.model";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";
import Coupon from "../models/Coupon.model";
import { clearCartService } from "./cart.service";
import { CreateOrderInput } from "../validators/order.validator";

// ─── Reusable error creator ────────────────────────────────────────
const createError = (message: string, statusCode: number): Error => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

// ─── TAX & SHIPPING CONSTANTS ─────────────────────────────────────
const GST_RATE = 0.18;              // 18% GST
const FREE_SHIPPING_THRESHOLD = 999; // free shipping above ₹999
const SHIPPING_CHARGE = 99;          // ₹99 below threshold

// ─── CREATE ORDER ─────────────────────────────────────────────────
export const createOrderService = async (
  userId: string,
  data: CreateOrderInput
): Promise<IOrder> => {
  const { shippingAddress, paymentMethod, couponCode, notes } = data;

  // ── STEP 1: Fetch user's cart ──────────────────────────────────
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    throw createError(
      "Your cart is empty. Add items before placing an order",
      400
    );
  }

  // ── STEP 2: Validate ALL products and stock BEFORE touching DB ──
  // We check everything first. If size 9 is out of stock,
  // we do NOT deduct size 8 stock. All or nothing.
  const validationErrors: string[] = [];

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);

    if (!product) {
      validationErrors.push(
        `Product "${cartItem.name}" is no longer available`
      );
      continue;
    }

    if (!product.isActive) {
      validationErrors.push(
        `Product "${product.name}" has been discontinued`
      );
      continue;
    }

    const sizeEntry = product.sizes.find((s) => s.size === cartItem.size);

    if (!sizeEntry) {
      validationErrors.push(
        `Size ${cartItem.size} is no longer available for "${product.name}"`
      );
      continue;
    }

    if (sizeEntry.stock < cartItem.quantity) {
      validationErrors.push(
        `Only ${sizeEntry.stock} pairs available in size ${cartItem.size} for "${product.name}". You requested ${cartItem.quantity}`
      );
    }
  }

  // If any validation failed, throw ALL errors at once
  // Customer sees all problems in one response, not one at a time
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(" | ")) as Error & {
      statusCode: number;
    };
    error.statusCode = 400;
    throw error;
  }

  // ── STEP 3: Calculate itemsTotal ──────────────────────────────
  // Use the price stored in cart (snapshot) not current product price
  const itemsTotal = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ── STEP 4: Calculate shipping charge ────────────────────────
  const shippingCharge = itemsTotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : SHIPPING_CHARGE;

  // ── STEP 5: Calculate GST tax ─────────────────────────────────
  // GST is applied on itemsTotal only, not on shipping
  const taxAmount = Math.round(itemsTotal * GST_RATE);

  // ── STEP 6: Validate and apply coupon if provided ─────────────
  let discountAmount = 0;
  let validatedCouponCode: string | undefined;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
    });

    if (!coupon) {
      throw createError(`Coupon "${couponCode}" does not exist`, 404);
    }

    if (!coupon.isActive) {
      throw createError("This coupon is no longer active", 400);
    }

    if (new Date() > coupon.expiresAt) {
      throw createError("This coupon has expired", 400);
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw createError("This coupon has reached its usage limit", 400);
    }

    if (itemsTotal < coupon.minOrderAmount) {
      throw createError(
        `This coupon requires a minimum order of ₹${coupon.minOrderAmount}. Your order total is ₹${itemsTotal}`,
        400
      );
    }

    // Calculate discount
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round(itemsTotal * (coupon.discountValue / 100));
      // Apply max discount cap if set
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed itemsTotal
    if (discountAmount > itemsTotal) {
      discountAmount = itemsTotal;
    }

    validatedCouponCode = coupon.code;
  }

  // ── STEP 7: Calculate final totalAmount ───────────────────────
  const totalAmount =
    itemsTotal + shippingCharge + taxAmount - discountAmount;

  // ── STEP 8: Build order items as snapshots ────────────────────
  // We copy name, image, price FROM the cart snapshot
  // This means even if product is deleted later,
  // the order still shows what was ordered
  const orderItems = cart.items.map((item) => ({
    product: item.product,
    name: item.name,
    image: item.image,
    size: item.size,
    quantity: item.quantity,
    price: item.price,
  }));

  // ── STEP 9: Deduct stock for each item ────────────────────────
  // Using $inc with negative value is atomic —
  // MongoDB handles concurrent orders correctly
  // We use Promise.all to run all deductions in parallel
  await Promise.all(
    cart.items.map((item) =>
      Product.findOneAndUpdate(
        {
          _id: item.product,
          "sizes.size": item.size,
        },
        {
          $inc: { "sizes.$.stock": -item.quantity },
        }
      )
    )
  );

  // ── STEP 10: Create the order ─────────────────────────────────
  // orderNumber is auto-generated in Order.model.ts pre-save hook
  const order = await Order.create({
    user: new mongoose.Types.ObjectId(userId),
    items: orderItems,
    shippingAddress,
    itemsTotal,
    shippingCharge,
    taxAmount,
    discountAmount,
    totalAmount,
    couponCode: validatedCouponCode,
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    orderStatus: "pending",
    notes,
  });

  // ── STEP 11: Increment coupon usage count ─────────────────────
  // Only done AFTER order is created successfully
  if (validatedCouponCode) {
    await Coupon.findOneAndUpdate(
      { code: validatedCouponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  // ── STEP 12: Clear the cart ───────────────────────────────────
  // Only done AFTER order is created successfully
  await clearCartService(userId);

  return order;
};

// ─── GET MY ORDERS (customer) ─────────────────────────────────────
export const getMyOrdersService = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  orders: IOrder[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v"),
    Order.countDocuments({ user: userId }),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// ─── GET SINGLE ORDER BY ID ───────────────────────────────────────
// Verifies the order belongs to the requesting user
// Admins bypass this check in a separate service function
export const getOrderByIdService = async (
  orderId: string,
  userId: string
): Promise<IOrder> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  // Security check — customer can only see their own orders
  if (order.user.toString() !== userId) {
    throw createError("Access denied. This order does not belong to you", 403);
  }

  return order;
};

// ─── CANCEL ORDER (customer) ──────────────────────────────────────
// Customer can only cancel if order is still pending or confirmed
// Once processing/shipped, cancellation must go through admin
export const cancelOrderService = async (
  orderId: string,
  userId: string
): Promise<IOrder> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  if (order.user.toString() !== userId) {
    throw createError("Access denied. This order does not belong to you", 403);
  }

  const cancellableStatuses: OrderStatus[] = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    throw createError(
      `Order cannot be cancelled. Current status is "${order.orderStatus}". Contact support for help`,
      400
    );
  }

  // Restore stock for each item when order is cancelled
  await Promise.all(
    order.items.map((item) =>
      Product.findOneAndUpdate(
        {
          _id: item.product,
          "sizes.size": item.size,
        },
        {
          $inc: { "sizes.$.stock": item.quantity }, // add back
        }
      )
    )
  );

  order.orderStatus = "cancelled";
  await order.save();

  return order;
};

// ─── GET ALL ORDERS (admin) ───────────────────────────────────────
export const getAllOrdersService = async (
  page: number = 1,
  limit: number = 20,
  orderStatus?: string,
  paymentStatus?: string
): Promise<{
  orders: IOrder[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const filter: Record<string, unknown> = {};
  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const skip = (page - 1) * limit;
  const sortOptions: Record<string, SortOrder> = { createdAt: -1 };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

// ─── UPDATE ORDER STATUS (admin) ──────────────────────────────────
export const updateOrderStatusService = async (
  orderId: string,
  orderStatus: OrderStatus,
  trackingNumber?: string
): Promise<IOrder> => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createError("Order not found", 404);
  }

  // Prevent invalid status transitions
  // e.g. you cannot go from "delivered" back to "pending"
  const statusFlow: Record<string, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: ["refunded"],
    cancelled: [],   // terminal state
    refunded: [],    // terminal state
  };

  const allowedNext = statusFlow[order.orderStatus] || [];
  if (!allowedNext.includes(orderStatus)) {
    throw createError(
      `Cannot change status from "${order.orderStatus}" to "${orderStatus}"`,
      400
    );
  }

  order.orderStatus = orderStatus;

  // Set deliveredAt timestamp when marked as delivered
  if (orderStatus === "delivered") {
    order.deliveredAt = new Date();
    order.paymentStatus = "paid"; // mark as paid on delivery for COD
  }

  // Set tracking number if provided
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  // Restore stock if order is cancelled by admin
  if (orderStatus === "cancelled") {
    await Promise.all(
      order.items.map((item) =>
        Product.findOneAndUpdate(
          { _id: item.product, "sizes.size": item.size },
          { $inc: { "sizes.$.stock": item.quantity } }
        )
      )
    );
  }

  await order.save();
  return order;
};

// ─── GET ORDER STATS (admin dashboard) ───────────────────────────
export const getOrderStatsService = async (): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenueToday: number;
}> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [stats, todayRevenue] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]),
  ]);

  const s = stats[0] || {};

  return {
    totalOrders: s.totalOrders || 0,
    totalRevenue: s.totalRevenue || 0,
    pendingOrders: s.pendingOrders || 0,
    deliveredOrders: s.deliveredOrders || 0,
    cancelledOrders: s.cancelledOrders || 0,
    revenueToday: todayRevenue[0]?.revenue || 0,
  };
};
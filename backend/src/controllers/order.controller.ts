import { Response } from "express";
import { AuthRequest } from "../utils/jwt.utils";
import asyncWrapper from "../utils/asyncWrapper.utils";
import { sendSuccess, sendError } from "../utils/apiResponse.utils";
import {
  createOrderService,
  getMyOrdersService,
  getOrderByIdService,
  cancelOrderService,
  getAllOrdersService,
  updateOrderStatusService,
  getOrderStatsService,
} from "../services/order.service";
import { OrderStatus } from "../models/Order.model";

// ─── POST /api/v1/orders ──────────────────────────────────────────
export const createOrder = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const order = await createOrderService(req.user!.id, req.body);
    sendSuccess(res, "Order placed successfully", { order }, 201);
  }
);

// ─── GET /api/v1/orders/my-orders ─────────────────────────────────
export const getMyOrders = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const result = await getMyOrdersService(req.user!.id, page, limit);
    sendSuccess(res, "Orders fetched successfully", result);
  }
);

// ─── GET /api/v1/orders/stats — admin only ────────────────────────
export const getOrderStats = asyncWrapper(
  async (_req: AuthRequest, res: Response): Promise<void> => {
    const stats = await getOrderStatsService();
    sendSuccess(res, "Order stats fetched", { stats });
  }
);

// ─── GET /api/v1/orders/:id ───────────────────────────────────────
export const getOrderById = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const orderId = req.params.id as string;
    const order = await getOrderByIdService(orderId, req.user!.id);
    sendSuccess(res, "Order fetched successfully", { order });
  }
);

// ─── PUT /api/v1/orders/:id/cancel ────────────────────────────────
export const cancelOrder = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const orderId = req.params.id as string;
    const order = await cancelOrderService(orderId, req.user!.id);
    sendSuccess(res, "Order cancelled successfully", { order });
  }
);

// ─── GET /api/v1/orders — admin only ─────────────────────────────
export const getAllOrders = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const orderStatus = req.query.orderStatus as string | undefined;
    const paymentStatus = req.query.paymentStatus as string | undefined;

    const result = await getAllOrdersService(
      page,
      limit,
      orderStatus,
      paymentStatus
    );
    sendSuccess(res, "All orders fetched", result);
  }
);

// ─── PUT /api/v1/orders/:id/status — admin only ───────────────────
export const updateOrderStatus = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const orderId = req.params.id as string;
    const { orderStatus, trackingNumber } = req.body;

    if (!orderStatus) {
      sendError(res, "orderStatus is required", 400);
      return;
    }

    const order = await updateOrderStatusService(
      orderId,
      orderStatus as OrderStatus,
      trackingNumber
    );
    sendSuccess(res, "Order status updated", { order });
  }
);
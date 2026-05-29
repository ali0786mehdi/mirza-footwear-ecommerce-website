import { Response } from "express";
import { AuthRequest } from "../utils/jwt.utils";
import asyncWrapper from "../utils/asyncWrapper.utils";
import { sendSuccess, sendError } from "../utils/apiResponse.utils";
import {
  getCartService,
  addToCartService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  getCartItemCountService,
} from "../services/cart.service";

// ─── GET /api/v1/cart ─────────────────────────────────────────────
// Returns the full cart with populated product details.
// If no cart exists yet, returns empty cart structure.
export const getCart = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const cart = await getCartService(req.user!.id);

    if (!cart) {
      // User has never added anything to cart
      sendSuccess(res, "Cart is empty", {
        cart: {
          items: [],
          totalAmount: 0,
        },
      });
      return;
    }

    sendSuccess(res, "Cart fetched successfully", { cart });
  }
);

// ─── GET /api/v1/cart/count ───────────────────────────────────────
// Returns just the item count for the cart badge in the navbar.
export const getCartCount = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const count = await getCartItemCountService(req.user!.id);
    sendSuccess(res, "Cart count fetched", { count });
  }
);

// ─── POST /api/v1/cart ────────────────────────────────────────────
// Adds an item to the cart or updates quantity if already exists.
export const addToCart = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { productId, size, quantity } = req.body;

    const cart = await addToCartService(req.user!.id, {
      productId,
      size: Number(size),
      quantity: Number(quantity) || 1,
    });

    sendSuccess(res, "Item added to cart successfully", { cart }, 201);
  }
);

// ─── PUT /api/v1/cart/:itemId ─────────────────────────────────────
// Updates the quantity of a specific cart item.
// itemId is the cart item's _id (subdocument id), NOT the product id.
export const updateCartItem = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const itemId = req.params.itemId as string;
    const { quantity } = req.body;

    if (!quantity || Number(quantity) < 1) {
      sendError(res, "Valid quantity is required", 400);
      return;
    }

    const cart = await updateCartItemService(
      req.user!.id,
      itemId,
      Number(quantity)
    );

    sendSuccess(res, "Cart updated successfully", { cart });
  }
);

// ─── DELETE /api/v1/cart/clear ────────────────────────────────────
// Clears all items from cart.
// This route MUST be defined before /:itemId route
// otherwise Express matches "clear" as an itemId.
export const clearCart = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    await clearCartService(req.user!.id);
    sendSuccess(res, "Cart cleared successfully");
  }
);

// ─── DELETE /api/v1/cart/:itemId ──────────────────────────────────
// Removes a single item from the cart.
export const removeCartItem = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const itemId = req.params.itemId as string;
    const cart = await removeCartItemService(req.user!.id, itemId);
    sendSuccess(res, "Item removed from cart", { cart });
  }
);
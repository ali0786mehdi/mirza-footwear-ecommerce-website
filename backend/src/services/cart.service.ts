import Cart, { ICart } from "../models/Cart.model";
import Product from "../models/Product.model";
import mongoose from "mongoose";

// ─── Helper: build a consistent AppError ──────────────────────────
const createError = (message: string, statusCode: number): Error => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

// ─── GET CART ─────────────────────────────────────────────────────
// Fetches the cart and populates product details for each item.
// If the user has no cart yet, returns an empty cart structure
// without saving anything to the database.
export const getCartService = async (userId: string): Promise<ICart | null> => {
  const cart = await Cart.findOne({ user: userId }).populate(
    "items.product",
    "name images price isActive slug"
  );

  return cart;
};

// ─── ADD TO CART ──────────────────────────────────────────────────
// This is the most complex cart operation. It handles:
// 1. Product validation (exists, is active, has the requested size)
// 2. Stock validation (enough stock for requested quantity)
// 3. Smart merging (if same product+size exists, update quantity)
// 4. Price snapshot (stores price at time of adding, not live price)
export const addToCartService = async (
  userId: string,
  data: { productId: string; size: number; quantity: number }
): Promise<ICart> => {
  const { productId, size, quantity } = data;

  // ── 1. Validate product exists and is active ───────────────────
  const product = await Product.findById(productId);
  if (!product) {
    throw createError("Product not found", 404);
  }
  if (!product.isActive) {
    throw createError("This product is no longer available", 400);
  }

  // ── 2. Validate the requested size exists on this product ──────
  const sizeEntry = product.sizes.find((s) => s.size === size);
  if (!sizeEntry) {
    throw createError(
      `Size ${size} is not available for this product`,
      400
    );
  }

  // ── 3. Validate enough stock for requested quantity ────────────
  if (sizeEntry.stock < quantity) {
    throw createError(
      `Only ${sizeEntry.stock} pairs available in size ${size}`,
      400
    );
  }

  // ── 4. Find existing cart or create a new one ─────────────────
  // We use findOne first so we can apply smart merging logic below.
  // Cart.create() would always make a new document.
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    // First time this user adds anything to cart
    cart = new Cart({
      user: new mongoose.Types.ObjectId(userId),
      items: [],
      totalAmount: 0,
    });
  }

  // ── 5. Check if same product with same size already in cart ────
  // If yes → update quantity instead of adding a duplicate item.
  // We match on BOTH productId AND size because the same shoe
  // in size 8 and size 9 are different cart items.
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId && item.size === size
  );

  if (existingItemIndex > -1) {
    // Item already exists — update quantity
    const existingItem = cart.items[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;

    // Check stock for the combined quantity
    if (sizeEntry.stock < newQuantity) {
      throw createError(
        `Cannot add ${quantity} more. Only ${sizeEntry.stock} available in size ${size}. You already have ${existingItem.quantity} in your cart.`,
        400
      );
    }

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // New item — push with price/name/image snapshot
    // We snapshot the price because if admin changes product price later,
    // the cart should still show what the customer added at.
    cart.items.push({
      product: new mongoose.Types.ObjectId(productId),
      size,
      quantity,
      price: product.discountPrice ?? product.price, // use discount price if available
      name: product.name,
      image: product.images[0], // first image as thumbnail
    } as any);
  }

  // ── 6. Save — pre-save hook auto-calculates totalAmount ────────
  await cart.save();

  // ── 7. Return populated cart ───────────────────────────────────
  const populatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price discountPrice isActive slug"
  );

  return populatedCart!;
};

// ─── UPDATE CART ITEM QUANTITY ────────────────────────────────────
// Updates the quantity of a specific item in the cart.
// itemId is the _id of the cart item subdocument (not the product id).
export const updateCartItemService = async (
  userId: string,
  itemId: string,
  quantity: number
): Promise<ICart> => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw createError("Cart not found", 404);
  }

  // Find the specific item inside the cart's items array
  const itemIndex = cart.items.findIndex(
    (item) => item._id?.toString() === itemId
  );

  if (itemIndex === -1) {
    throw createError("Item not found in cart", 404);
  }

  const cartItem = cart.items[itemIndex];

  // Re-validate stock with the new quantity
  // Product price/stock can change after item was added to cart
  const product = await Product.findById(cartItem.product);
  if (!product) {
    throw createError("Product no longer exists", 404);
  }

  const sizeEntry = product.sizes.find((s) => s.size === cartItem.size);
  if (!sizeEntry || sizeEntry.stock < quantity) {
    throw createError(
      `Only ${sizeEntry?.stock ?? 0} pairs available in size ${cartItem.size}`,
      400
    );
  }

  // Update the quantity
  cart.items[itemIndex].quantity = quantity;

  // Save — pre-save hook recalculates totalAmount automatically
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price discountPrice isActive slug"
  );

  return populatedCart!;
};

// ─── REMOVE ITEM FROM CART ────────────────────────────────────────
// Removes a single item from the cart using the item's _id.
// Does NOT remove the entire cart — just that one item.
export const removeCartItemService = async (
  userId: string,
  itemId: string
): Promise<ICart> => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw createError("Cart not found", 404);
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id?.toString() === itemId
  );

  if (itemIndex === -1) {
    throw createError("Item not found in cart", 404);
  }

  // Remove the item using splice
  cart.items.splice(itemIndex, 1);

  // Save — pre-save hook recalculates totalAmount
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price discountPrice isActive slug"
  );

  return populatedCart!;
};

// ─── CLEAR ENTIRE CART ────────────────────────────────────────────
// Removes ALL items from the cart.
// Called automatically after an order is successfully placed.
// Can also be called manually by the user.
export const clearCartService = async (userId: string): Promise<void> => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    // No cart exists — nothing to clear, not an error
    return;
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();
};

// ─── GET CART ITEM COUNT ──────────────────────────────────────────
// Returns just the number of items in the cart.
// Used by the frontend to show the cart badge count.
export const getCartItemCountService = async (
  userId: string
): Promise<number> => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};
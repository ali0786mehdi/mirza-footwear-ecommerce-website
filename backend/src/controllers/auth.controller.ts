import { Response } from "express";
import { AuthRequest } from "../utils/jwt.utils";
import asyncWrapper from "../utils/asyncWrapper.utils";
import { sendSuccess, sendError } from "../utils/apiResponse.utils";
import {
  registerService,
  loginService,
  getProfileService,
  updateProfileService,
  changePasswordService,
  addAddressService,
  deleteAddressService,
} from "../services/auth.service";
import { Request } from "express";

// ─── POST /api/v1/auth/register ───────────────────────────────────
// Public — no token needed
export const register = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await registerService(req.body);
    sendSuccess(res, "Account created successfully", { user, token }, 201);
  }
);

// ─── POST /api/v1/auth/login ──────────────────────────────────────
// Public — no token needed
export const login = asyncWrapper(
  async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await loginService(req.body);
    sendSuccess(res, "Login successful", { user, token });
  }
);

// ─── GET /api/v1/auth/me ──────────────────────────────────────────
// Protected — uses AuthRequest so req.user is recognized
export const getMe = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await getProfileService(req.user!.id);
    sendSuccess(res, "Profile fetched successfully", { user });
  }
);

// ─── PUT /api/v1/auth/me ──────────────────────────────────────────
export const updateProfile = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, phone, avatar } = req.body;
    const user = await updateProfileService(req.user!.id, {
      name,
      phone,
      avatar,
    });
    sendSuccess(res, "Profile updated successfully", { user });
  }
);

// ─── PUT /api/v1/auth/change-password ────────────────────────────
export const changePassword = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      sendError(res, "Current password and new password are required", 400);
      return;
    }
    await changePasswordService(req.user!.id, currentPassword, newPassword);
    sendSuccess(res, "Password changed successfully");
  }
);

// ─── POST /api/v1/auth/address ────────────────────────────────────
export const addAddress = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const user = await addAddressService(req.user!.id, req.body);
    sendSuccess(res, "Address added successfully", { user }, 201);
  }
);

// ─── DELETE /api/v1/auth/address/:addressId ───────────────────────
export const deleteAddress = asyncWrapper(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const addressId = req.params.addressId as string;
    const user = await deleteAddressService(req.user!.id, addressId);
    sendSuccess(res, "Address deleted successfully", { user });
  }
);
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { ENV } from "../config/env";
import { IUser } from "../models/User.model";
import { Request } from "express";

export interface JwtPayload {
  id: string;
  role: string;
  email: string;
}

// ─── Use this type in ANY controller that needs req.user ──────────
// Instead of Request, import and use AuthRequest
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    id: (user._id as mongoose.Types.ObjectId).toString(),
    role: user.role,
    email: user.email,
  };

  return jwt.sign(payload, ENV.JWT_SECRET as string, {
    expiresIn: "7d",
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
};
import { Response, NextFunction } from "express";
import { AuthRequest } from "../utils/jwt.utils";
import { sendError } from "../utils/apiResponse.utils";

const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "admin") {
    sendError(res, "Access denied. Admin privileges required", 403);
    return;
  }
  next();
};

export default adminOnly;
import { Response, NextFunction } from "express";
import { verifyToken, AuthRequest } from "../utils/jwt.utils";
import { sendError } from "../utils/apiResponse.utils";

const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Access denied. No token provided", 401);
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      sendError(res, "Access denied. Invalid token format", 401);
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, "Access denied. Token is invalid or expired", 401);
  }
};

export default protect;
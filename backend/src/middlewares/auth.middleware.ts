import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../api/auth/auth.utils";
import { IAuthUser } from "../api/auth/auth.interfaces";

export interface AuthRequest extends Request {
  user?: IAuthUser;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const path = req.path;
    const isPublicPath =
      path.startsWith("/api/v1/auth") || path.startsWith("/health");

    if (isPublicPath) {
      next();
      return;
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
      return;
    }

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

import { Response, NextFunction } from "express";
import { verifyToken } from "../api/auth/auth.utils";
import { IAuthUser } from "../api/auth/auth.interfaces";
import { AuthRequest } from "./auth.middleware";

export const aclMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
  permission: string
): Promise<void> => {
  try {
    if (req.method === "OPTIONS") return next();

    if (!permission) {
      next();
      return;
    }
    console.log(req.user?.user_role?.role_permissions);
    if (!req.user?.user_role?.role_permissions) {
      res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission to access this resource.",
      });
      return;
    }
    if (
      !req.user?.user_role?.role_permissions?.some(
        (p) => p.permission.name === permission
      )
    ) {
      res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission to access this resource.",
      });
      return;
    }

    // Attach user to request

    next();
  } catch (error) {
    console.error("ACL middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

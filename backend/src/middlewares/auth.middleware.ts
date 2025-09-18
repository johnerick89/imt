import { Response, NextFunction } from "express";
import { verifyToken } from "../api/auth/auth.utils";
import { IAuthUser } from "../api/auth/auth.interfaces";
import CustomReq from "../types/CustomReq.type";
import { RoleService } from "../api/roles/roles.services";

export interface AuthRequest extends CustomReq {
  user?: IAuthUser;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const roleService = new RoleService();
  try {
    if (req.method === "OPTIONS") return next();
    const authHeader = req.headers.authorization;
    const path = req.path;
    const isPublicPath =
      path.includes("/login") ||
      path.includes("/register") ||
      path.includes("/health") ||
      path.includes("/seed");

    console.log(
      "authHeader",
      authHeader,
      "isPublicPath",
      isPublicPath,
      "path",
      path
    );

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
    const role = decoded?.role_id
      ? await roleService.getRoleById(decoded?.role_id)
      : null;
    req.user = { ...decoded, user_role: role?.data || null };
    req.organisation_id = decoded.organisation_id ?? undefined;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

import { Request, Response, NextFunction } from "express";
import {
  setPrismaContext,
  clearPrismaContext,
  generateRequestId,
} from "./prisma.middleware";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organisation_id?: string;
  };
}

export const auditMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Generate a unique request ID
  const requestId = generateRequestId();

  // Get IP address
  const ipAddress =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "unknown";

  // Set up context for Prisma middleware
  const context = {
    userId: req.user?.id || "anonymous",
    organizationId: req.user?.organisation_id,
    ipAddress,
    requestId,
    userAgent: req.get("User-Agent"),
    metadata: {
      method: req.method,
      url: req.url,
      userEmail: req.user?.email,
      userRole: req.user?.role,
    },
  };

  // Store context for Prisma middleware
  setPrismaContext(requestId, context);

  // Add request ID to response headers for debugging
  res.setHeader("X-Request-ID", requestId);

  // Clean up context after response is sent
  res.on("finish", () => {
    clearPrismaContext(requestId);
  });

  next();
};

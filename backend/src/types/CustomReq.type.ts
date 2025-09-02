import { Request } from "express";
import { IAuthUser } from "../api/auth/auth.interfaces";

interface PrismaContext {
  userId?: string;
  organizationId?: string;
  ipAddress?: string;
  requestId: string;
  userAgent?: string;
  metadata?: any;
}

interface CustomReq extends Request {
  user?: IAuthUser;
  prismaContext?: PrismaContext;
}
export default CustomReq;

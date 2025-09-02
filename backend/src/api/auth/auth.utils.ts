import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, IAuthUser } from "./auth.interfaces";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: IUser): string => {
  const payload: IAuthUser = {
    id: user.id,
    email: user.email,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    role: user.role || "",
    status: user.status,
    phone: user.phone || "",
    address: user.address || "",
    organisation_id: user.organisation_id || "",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): IAuthUser | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IAuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const sanitizeUser = (user: IUser): IAuthUser => {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    role: user.role || "",
    status: user.status,
    phone: user.phone || "",
    address: user.address || "",
    organisation_id: user.organisation_id || "",
  };
};

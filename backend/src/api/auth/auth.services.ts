import { prisma } from "../../lib/prisma.lib";
import {
  IUser,
  ILoginRequest,
  ILoginResponse,
  IRegisterRequest,
} from "./auth.interfaces";
import {
  hashPassword,
  comparePassword,
  generateToken,
  sanitizeUser,
} from "./auth.utils";

export class AuthService {
  async login(loginData: ILoginRequest): Promise<ILoginResponse> {
    try {
      const { email, password } = loginData;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          organisation: {
            select: {
              id: true,
              name: true,
              description: true,
              created_at: true,
              updated_at: true,
            },
          },
        },
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Check if user is active
      if (user.status !== "ACTIVE") {
        return {
          success: false,
          message: "Account is not active. Please contact support.",
        };
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() },
      });

      // Generate JWT token
      const token = generateToken(user);

      return {
        success: true,
        message: "Login successful",
        token,
        user: sanitizeUser(user),
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }

  async register(registerData: IRegisterRequest): Promise<ILoginResponse> {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        role,
        phone,
        address,
        organisation_id,
      } = registerData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists",
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          role: role || "USER",
          phone,
          address,
          organisation_id,
          status: "ACTIVE",
        },
      });

      // Generate JWT token
      const token = generateToken(newUser);

      return {
        success: true,
        message: "Registration successful",
        token,
        user: sanitizeUser(newUser),
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      return user;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }
}

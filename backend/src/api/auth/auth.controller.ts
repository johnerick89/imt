import { Request, Response } from "express";
import { AuthService } from "./auth.services";
import { loginSchema, registerSchema } from "./auth.validation";
import { IAuthResponse } from "./auth.interfaces";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
        const response: IAuthResponse = {
          success: false,
          message: "Validation failed",
          error: validationResult.error.issues[0]?.message || "Invalid input",
        };
        res.status(400).json(response);
        return;
      }

      const loginData = validationResult.data;
      const result = await authService.login(loginData);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error("Login controller error:", error);
      const response: IAuthResponse = {
        success: false,
        message: "Internal server error",
        error: "An unexpected error occurred",
      };
      res.status(500).json(response);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body);

      if (!validationResult.success) {
        const response: IAuthResponse = {
          success: false,
          message: "Validation failed",
          error: validationResult.error.issues[0]?.message || "Invalid input",
        };
        res.status(400).json(response);
        return;
      }

      const registerData = validationResult.data;
      const result = await authService.register(registerData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Register controller error:", error);
      const response: IAuthResponse = {
        success: false,
        message: "Internal server error",
        error: "An unexpected error occurred",
      };
      res.status(500).json(response);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // The user will be attached to req by the auth middleware
      const user = (req as any).user;

      if (!user) {
        const response: IAuthResponse = {
          success: false,
          message: "User not found",
          error: "Authentication required",
        };
        res.status(401).json(response);
        return;
      }

      const response: IAuthResponse = {
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      };
      res.status(200).json(response);
    } catch (error) {
      console.error("Get profile controller error:", error);
      const response: IAuthResponse = {
        success: false,
        message: "Internal server error",
        error: "An unexpected error occurred",
      };
      res.status(500).json(response);
    }
  }
}

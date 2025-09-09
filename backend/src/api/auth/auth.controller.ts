import { Request, Response } from "express";
import { AuthService } from "./auth.services";
import { loginSchema, registerSchema } from "./auth.validation";
import { IAuthResponse } from "./auth.interfaces";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
} from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const authService = new AuthService();

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new ValidationError(
        validationResult.error.issues[0]?.message || "Invalid input"
      );
    }

    const loginData = validationResult.data;
    const result = await authService.login(loginData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      throw new UnauthorizedError(result.message || "Login failed");
    }
  });

  register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new ValidationError(
          validationResult.error.issues[0]?.message || "Invalid input"
        );
      }

      const registerData = validationResult.data;
      const result = await authService.register(registerData);

      if (result.success) {
        res.status(201).json(result);
      } else {
        throw new AppError(result.message || "Registration failed", 400);
      }
    }
  );

  getProfile = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // The user will be attached to req by the auth middleware
      const user = (req as any).user;

      if (!user) {
        throw new UnauthorizedError("User not authenticated");
      }

      const response: IAuthResponse = {
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      };
      res.status(200).json(response);
    }
  );
}

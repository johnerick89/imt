import { Request, Response } from "express";
import { UsersService } from "./users.services";
import {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  toggleUserStatusSchema,
  updatePasswordSchema,
  resetPasswordSchema,
  userStatsFiltersSchema,
} from "./users.validation";
import { IUserResponse, IUsersListResponse } from "./users.interfaces";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const usersService = new UsersService();

export class UsersController {
  createUser = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validationResult = createUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0]?.message || "Invalid input",
          400
        );
      }

      const result = await usersService.createUser(validationResult.data);

      if (!result.success) {
        throw new AppError(result.message || "Failed to create user", 400);
      }

      res.status(201).json(result);
    }
  );

  getUsers = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const filters = {
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as any,
        organisation_id: req.query.organisation_id as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const validationResult = userFiltersSchema.safeParse(filters);
      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0]?.message || "Invalid input",
          400
        );
      }

      const result = await usersService.getUsers(validationResult.data);

      if (!result.success) {
        throw new AppError(result.message || "Failed to get users", 400);
      }

      res.status(200).json(result);
    }
  );

  getUserById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("User ID is required", 400);
      }

      const result = await usersService.getUserById(id);

      if (!result.success) {
        throw new AppError(result.message || "Failed to get user", 400);
      }

      res.status(200).json(result);
    }
  );

  updateUser = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("User ID is required", 400);
      }

      const validationResult = updateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0]?.message || "Invalid input",
          400
        );
      }

      const result = await usersService.updateUser(id, validationResult.data);

      if (!result.success) {
        throw new AppError(result.message || "Failed to update user", 400);
      }

      res.status(200).json(result);
    }
  );

  toggleUserStatus = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("User ID is required", 400);
      }

      const validationResult = toggleUserStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0]?.message || "Invalid input",
          400
        );
      }

      const result = await usersService.toggleUserStatus(
        id,
        validationResult.data.status
      );

      if (!result.success) {
        throw new AppError(
          result.message || "Failed to toggle user status",
          400
        );
      }

      res.status(200).json(result);
    }
  );

  deleteUser = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("User ID is required", 400);
      }

      const result = await usersService.deleteUser(id);

      if (!result.success) {
        throw new AppError(result.message || "Failed to delete user", 400);
      }

      res.status(200).json(result);
    }
  );

  getUserStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validationResult = userStatsFiltersSchema.safeParse(req.query);
      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0]?.message || "Invalid input",
          400
        );
      }
      const result = await usersService.getUserStats(validationResult.data);

      if (!result.success) {
        throw new AppError(result.message || "Failed to get user stats", 400);
      }

      res.status(200).json(result);
    }
  );

  updatePassword = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("User ID is required", 400);
      }

      const validationResult = updatePasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0]?.message || "Invalid input",
          400
        );
      }

      const result = await usersService.updatePassword(
        id,
        req.body.oldPassword,
        req.body.newPassword,
        req.body.confirmPassword
      );

      if (!result.success) {
        throw new AppError(result.message || "Failed to reset password", 400);
      }

      res.status(200).json(result);
    }
  );

  resetPassword = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("User ID is required", 400);
      }

      const validationResult = resetPasswordSchema.safeParse(req.body);
      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0]?.message || "Invalid input",
          400
        );
      }

      const result = await usersService.resetPassword(
        id,
        req.body.newPassword,
        req.body.confirmPassword
      );

      if (!result.success) {
        throw new AppError(result.message || "Failed to reset password", 400);
      }

      res.status(200).json(result);
    }
  );
}

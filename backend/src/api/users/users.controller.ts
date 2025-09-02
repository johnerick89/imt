import { Request, Response } from "express";
import { UsersService } from "./users.services";
import {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  toggleUserStatusSchema,
} from "./users.validation";
import { IUserResponse, IUsersListResponse } from "./users.interfaces";

const usersService = new UsersService();

export class UsersController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = createUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        const response: IUserResponse = {
          success: false,
          message: "Validation failed",
          error: validationResult.error.issues[0]?.message || "Invalid input",
        };
        res.status(400).json(response);
        return;
      }

      const result = await usersService.createUser(validationResult.data);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in createUser controller:", error);
      const response: IUserResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
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
        const response: IUsersListResponse = {
          success: false,
          message: "Validation failed",
          error: validationResult.error.issues[0]?.message || "Invalid input",
        };
        res.status(400).json(response);
        return;
      }

      const result = await usersService.getUsers(validationResult.data);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getUsers controller:", error);
      const response: IUsersListResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: IUserResponse = {
          success: false,
          message: "User ID is required",
          error: "MISSING_ID",
        };
        res.status(400).json(response);
        return;
      }

      const result = await usersService.getUserById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Error in getUserById controller:", error);
      const response: IUserResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: IUserResponse = {
          success: false,
          message: "User ID is required",
          error: "MISSING_ID",
        };
        res.status(400).json(response);
        return;
      }

      const validationResult = updateUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        const response: IUserResponse = {
          success: false,
          message: "Validation failed",
          error: validationResult.error.issues[0]?.message || "Invalid input",
        };
        res.status(400).json(response);
        return;
      }

      const result = await usersService.updateUser(id, validationResult.data);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in updateUser controller:", error);
      const response: IUserResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: IUserResponse = {
          success: false,
          message: "User ID is required",
          error: "MISSING_ID",
        };
        res.status(400).json(response);
        return;
      }

      const validationResult = toggleUserStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        const response: IUserResponse = {
          success: false,
          message: "Validation failed",
          error: validationResult.error.issues[0]?.message || "Invalid input",
        };
        res.status(400).json(response);
        return;
      }

      const result = await usersService.toggleUserStatus(
        id,
        validationResult.data.status
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in toggleUserStatus controller:", error);
      const response: IUserResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        const response: IUserResponse = {
          success: false,
          message: "User ID is required",
          error: "MISSING_ID",
        };
        res.status(400).json(response);
        return;
      }

      const result = await usersService.deleteUser(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in deleteUser controller:", error);
      const response: IUserResponse = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }

  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await usersService.getUserStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getUserStats controller:", error);
      const response = {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      };
      res.status(500).json(response);
    }
  }
}

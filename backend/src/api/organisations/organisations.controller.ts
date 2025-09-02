import { Request, Response } from "express";
import { OrganisationsService } from "./organisations.service";
import {
  createOrganisationSchema,
  updateOrganisationSchema,
  organisationFiltersSchema,
  organisationIdSchema,
} from "./organisations.validation";
import { OrganisationStatus } from "@prisma/client";

const organisationsService = new OrganisationsService();

export class OrganisationsController {
  async createOrganisation(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      console.log(req.body);
      const validatedData = createOrganisationSchema.parse(req.body);

      // Get user ID from request (set by auth middleware)
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          error: "UNAUTHORIZED",
        });
        return;
      }

      const result = await organisationsService.createOrganisation(
        validatedData,
        userId
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error in createOrganisation controller:", error);
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: error.message || "VALIDATION_ERROR",
      });
    }
  }

  async getOrganisations(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const validatedFilters = organisationFiltersSchema.parse(req.query);

      const result = await organisationsService.getOrganisations(
        validatedFilters
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error in getOrganisations controller:", error);
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        error: error.message || "VALIDATION_ERROR",
      });
    }
  }

  async getOrganisationById(req: Request, res: Response): Promise<void> {
    try {
      // Validate organisation ID
      const { id } = organisationIdSchema.parse(req.params);

      const result = await organisationsService.getOrganisationById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      console.error("Error in getOrganisationById controller:", error);
      res.status(400).json({
        success: false,
        message: "Invalid organisation ID",
        error: error.message || "VALIDATION_ERROR",
      });
    }
  }

  async updateOrganisation(req: Request, res: Response): Promise<void> {
    try {
      // Validate organisation ID and request body
      const { id } = organisationIdSchema.parse(req.params);
      const validatedData = updateOrganisationSchema.parse(req.body);

      const result = await organisationsService.updateOrganisation(
        id,
        validatedData
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error in updateOrganisation controller:", error);
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: error.message || "VALIDATION_ERROR",
      });
    }
  }

  async deleteOrganisation(req: Request, res: Response): Promise<void> {
    try {
      // Validate organisation ID
      const { id } = organisationIdSchema.parse(req.params);

      const result = await organisationsService.deleteOrganisation(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error in deleteOrganisation controller:", error);
      res.status(400).json({
        success: false,
        message: "Invalid organisation ID",
        error: error.message || "VALIDATION_ERROR",
      });
    }
  }

  async toggleOrganisationStatus(req: Request, res: Response): Promise<void> {
    try {
      // Validate organisation ID and status
      const { id } = organisationIdSchema.parse(req.params);
      const { status } = req.body;

      if (!status || !Object.values(OrganisationStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status value",
          error: "INVALID_STATUS",
        });
        return;
      }

      const result = await organisationsService.toggleOrganisationStatus(
        id,
        status
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error in toggleOrganisationStatus controller:", error);
      res.status(400).json({
        success: false,
        message: "Invalid request data",
        error: error.message || "VALIDATION_ERROR",
      });
    }
  }

  async getOrganisationStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await organisationsService.getOrganisationStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error in getOrganisationStats controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve organisation stats",
        error: "INTERNAL_ERROR",
      });
    }
  }

  async getAllOrganisations(req: Request, res: Response): Promise<void> {
    try {
      const result = await organisationsService.getAllOrganisations();
      res.status(200).json({
        success: true,
        message: "All organisations retrieved successfully",
        data: {
          organisations: result,
          total: result.length,
          page: 1,
          limit: result.length,
          totalPages: 1,
        },
      });
    } catch (error: any) {
      console.error("Error in getAllOrganisations controller:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve all organisations",
        error: "INTERNAL_ERROR",
      });
    }
  }
}

import { Request, Response } from "express";
import { OrganisationsService } from "./organisations.service";
import {
  createOrganisationSchema,
  updateOrganisationSchema,
  organisationFiltersSchema,
  organisationIdSchema,
} from "./organisations.validation";
import { OrganisationStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const organisationsService = new OrganisationsService();

export class OrganisationsController {
  createOrganisation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate request body
      console.log(req.body);
      const validatedData = createOrganisationSchema.parse(req.body);

      // Get user ID from request (set by auth middleware)
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User ID is required", 400);
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
    }
  );

  getOrganisations = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
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
    }
  );

  getOrganisationById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate organisation ID
      const { id } = organisationIdSchema.parse(req.params);

      const result = await organisationsService.getOrganisationById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    }
  );

  updateOrganisation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
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
    }
  );

  deleteOrganisation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate organisation ID
      const { id } = organisationIdSchema.parse(req.params);

      const result = await organisationsService.deleteOrganisation(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  );

  toggleOrganisationStatus = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate organisation ID and status
      const { id } = organisationIdSchema.parse(req.params);
      const { status } = req.body;

      if (!status || !Object.values(OrganisationStatus).includes(status)) {
        throw new AppError("Invalid status value", 400);
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
    }
  );

  getOrganisationStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await organisationsService.getOrganisationStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    }
  );

  getAllOrganisations = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
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
    }
  );
}

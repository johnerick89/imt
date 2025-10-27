import { Request, Response } from "express";
import { OrganisationsService } from "./organisations.service";
import {
  createOrganisationSchema,
  updateOrganisationSchema,
  organisationFiltersSchema,
  organisationIdSchema,
  toggleOrganisationStatusSchema,
} from "./organisations.validation";
import { OrganisationStatus } from "@prisma/client";
import { asyncHandler } from "../../middlewares/error.middleware";
import { AppError, ZodValidationError } from "../../utils/AppError";
import { parseZodError } from "../../utils/validation.utils";

const organisationsService = new OrganisationsService();

export class OrganisationsController {
  createOrganisation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Validate request body
      const validation = createOrganisationSchema.safeParse(req.body);
      if (!validation.success) {
        console.error(
          "validation error",
          parseZodError(validation.error),
          "req.body",
          req.body
        );
        throw new ZodValidationError(parseZodError(validation.error));
      }

      // Get user ID from request (set by auth middleware)
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      const result = await organisationsService.createOrganisation(
        validation.data,
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
      const validation = organisationFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        console.error(
          "validation error",
          parseZodError(validation.error),
          "req.query",
          req.query
        );
        throw new ZodValidationError(parseZodError(validation.error));
      }

      const result = await organisationsService.getOrganisations(
        validation.data
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
      const validation = organisationIdSchema.safeParse(req.params);
      if (!validation.success) {
        console.error(
          "validation error",
          parseZodError(validation.error),
          "req.params",
          req.params
        );
        throw new ZodValidationError(parseZodError(validation.error));
      }

      const result = await organisationsService.getOrganisationById(
        validation.data.id
      );

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
      const idValidation = organisationIdSchema.safeParse(req.params);
      const bodyValidation = updateOrganisationSchema.safeParse(req.body);
      if (!idValidation.success) {
        console.error(
          "validation error",
          parseZodError(idValidation.error),
          "req.params",
          req.params
        );
        throw new ZodValidationError(parseZodError(idValidation.error));
      }

      if (!bodyValidation.success) {
        console.error(
          "validation error",
          parseZodError(bodyValidation.error),
          "req.body",
          req.body
        );
        throw new ZodValidationError(parseZodError(bodyValidation.error));
      }

      const result = await organisationsService.updateOrganisation(
        idValidation.data.id,
        bodyValidation.data
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
      const validation = organisationIdSchema.safeParse(req.params);
      if (!validation.success) {
        console.error(
          "validation error",
          parseZodError(validation.error),
          "req.params",
          req.params
        );
        throw new ZodValidationError(parseZodError(validation.error));
      }

      const result = await organisationsService.deleteOrganisation(
        validation.data.id
      );

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
      const idValidation = organisationIdSchema.safeParse(req.params);
      const bodyValidation = toggleOrganisationStatusSchema.safeParse(req.body);
      if (!idValidation.success) {
        console.error(
          "validation error",
          parseZodError(idValidation.error),
          "req.params",
          req.params
        );
        throw new ZodValidationError(parseZodError(idValidation.error));
      }
      if (!bodyValidation.success) {
        console.error(
          "validation error",
          parseZodError(bodyValidation.error),
          "req.body",
          req.body
        );
        throw new ZodValidationError(parseZodError(bodyValidation.error));
      }

      const result = await organisationsService.toggleOrganisationStatus(
        idValidation.data.id,
        bodyValidation.data.status
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

import { Request, Response } from "express";
import { OrgBalanceService } from "./orgbalances.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import { AppError, ZodValidationError } from "../../utils/AppError";
import { parseZodError } from "../../utils/validation.utils";
import type CustomRequest from "../../types/CustomReq.type";
import { organisationIdParamSchema } from "./orgbalances.validation";

export class OrgBalanceController {
  private orgBalanceService: OrgBalanceService;

  constructor() {
    this.orgBalanceService = new OrgBalanceService();
  }

  /**
   * Manually trigger the close all periodic org balances job
   * POST /api/v1/orgbalances/jobs/close-periodic-balances
   */
  public triggerClosePeriodicBalancesJob = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      const result = await this.orgBalanceService.closeAllPeriodicOrgBalances({
        userId,
      });

      res.status(200).json(result);
    }
  );

  /**
   * Get current periodic org balance for an organization
   * GET /api/v1/orgbalances/:organisationId/periodic-balance
   */
  public getCurrentPeriodicOrgBalance = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validation = organisationIdParamSchema.safeParse(req.params);
      if (!validation.success) {
        console.error(
          "validation error",
          parseZodError(validation.error),
          "req.params",
          req.params
        );
        throw new ZodValidationError(parseZodError(validation.error));
      }

      const periodicBalance =
        await this.orgBalanceService.getCurrentPeriodicOrgBalance({
          organisationId: validation.data.organisationId,
        });

      res.status(200).json({
        success: true,
        message: "Current periodic org balance retrieved successfully",
        data: periodicBalance,
      });
    }
  );

  /**
   * Create periodic org balance for an organization
   * POST /api/v1/orgbalances/:organisationId/periodic-balance
   */
  public createPeriodicOrgBalance = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const paramsValidation = organisationIdParamSchema.safeParse(req.params);
      if (!paramsValidation.success) {
        console.error(
          "validation error",
          parseZodError(paramsValidation.error),
          "req.params",
          req.params
        );
        throw new ZodValidationError(parseZodError(paramsValidation.error));
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      const periodicBalance =
        await this.orgBalanceService.createPeriodicOrgBalance({
          organisationId: paramsValidation.data.organisationId,
          userId,
        });

      res.status(201).json({
        success: true,
        message: "Periodic org balance created successfully",
        data: periodicBalance,
      });
    }
  );

  /**
   * Close periodic org balance for an organization
   * POST /api/v1/orgbalances/:organisationId/close-periodic-balance
   */
  public closePeriodicOrgBalance = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const paramsValidation = organisationIdParamSchema.safeParse(req.params);
      if (!paramsValidation.success) {
        console.error(
          "validation error",
          parseZodError(paramsValidation.error),
          "req.params",
          req.params
        );
        throw new ZodValidationError(parseZodError(paramsValidation.error));
      }

      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("User ID is required", 400);
      }

      const result = await this.orgBalanceService.closePeriodicOrgBalance({
        organisationId: paramsValidation.data.organisationId,
        userId,
      });

      res.status(200).json({
        success: true,
        message: "Periodic org balance closed successfully",
        data: result,
      });
    }
  );
}

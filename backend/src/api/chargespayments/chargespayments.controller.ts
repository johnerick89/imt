import { Response } from "express";
import { ChargesPaymentService } from "./chargespayments.services";
import {
  createChargesPaymentSchema,
  approveChargesPaymentSchema,
  reverseChargesPaymentSchema,
  chargesPaymentFiltersSchema,
  pendingTransactionChargesFiltersSchema,
} from "./chargespayments.validation";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const chargesPaymentService = new ChargesPaymentService();

export class ChargesPaymentController {
  // Get pending transaction charges
  getPendingTransactionCharges = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const validation = pendingTransactionChargesFiltersSchema.safeParse(
        req.query
      );
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const result = await chargesPaymentService.getPendingTransactionCharges(
        orgId,
        validation.data
      );

      res.status(200).json(result);
    }
  );

  // Get pending charges stats
  getPendingChargesStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const result = await chargesPaymentService.getPendingChargesStats(orgId);
      res.status(200).json(result);
    }
  );

  // Get charge payments stats
  getChargePaymentsStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const result = await chargesPaymentService.getChargePaymentsStats(orgId);
      res.status(200).json(result);
    }
  );

  // Create charges payment
  createChargesPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const validation = createChargesPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await chargesPaymentService.createChargesPayment(
        orgId,
        validation.data,
        userId!
      );

      res.status(201).json(result);
    }
  );

  // Get charges payments
  getChargesPayments = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const validation = chargesPaymentFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const result = await chargesPaymentService.getChargesPayments(
        orgId,
        validation.data
      );

      res.status(200).json(result);
    }
  );

  // Get charges payment by ID
  getChargesPaymentById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw new AppError("Payment ID is required", 400);
      }

      const result = await chargesPaymentService.getChargesPaymentById(
        paymentId
      );
      res.status(200).json(result);
    }
  );

  // Approve charges payment
  approveChargesPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw new AppError("Payment ID is required", 400);
      }

      const validation = approveChargesPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }
      const result = await chargesPaymentService.approveChargesPayment(
        paymentId,
        validation.data
      );

      res.status(200).json(result);
    }
  );

  // Reverse charges payment
  reverseChargesPayment = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { paymentId } = req.params;
      if (!paymentId) {
        throw new AppError("Payment ID is required", 400);
      }

      const validation = reverseChargesPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await chargesPaymentService.reverseChargesPayment(
        paymentId,
        validation.data,
        userId
      );

      res.status(200).json(result);
    }
  );
}

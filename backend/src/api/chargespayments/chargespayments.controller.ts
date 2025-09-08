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

const chargesPaymentService = new ChargesPaymentService();

export class ChargesPaymentController {
  // Get pending transaction charges
  async getPendingTransactionCharges(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const validation = pendingTransactionChargesFiltersSchema.safeParse(
        req.query
      );
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const result = await chargesPaymentService.getPendingTransactionCharges(
        orgId,
        validation.data
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching pending transaction charges:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch pending transaction charges",
      });
    }
  }

  // Get pending charges stats
  async getPendingChargesStats(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const result = await chargesPaymentService.getPendingChargesStats(orgId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching pending charges stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch pending charges stats",
      });
    }
  }

  // Get charge payments stats
  async getChargePaymentsStats(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const result = await chargesPaymentService.getChargePaymentsStats(orgId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching charge payments stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch charge payments stats",
      });
    }
  }

  // Create charges payment
  async createChargesPayment(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const validation = createChargesPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await chargesPaymentService.createChargesPayment(
        orgId,
        validation.data,
        userId
      );

      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating charges payment:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create charges payment",
      });
    }
  }

  // Get charges payments
  async getChargesPayments(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const validation = chargesPaymentFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const result = await chargesPaymentService.getChargesPayments(
        orgId,
        validation.data
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching charges payments:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch charges payments",
      });
    }
  }

  // Get charges payment by ID
  async getChargesPaymentById(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
        return;
      }

      const result = await chargesPaymentService.getChargesPaymentById(
        paymentId
      );
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching charges payment:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch charges payment",
      });
    }
  }

  // Approve charges payment
  async approveChargesPayment(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
        return;
      }

      const validation = approveChargesPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await chargesPaymentService.approveChargesPayment(
        paymentId,
        validation.data,
        userId
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error approving charges payment:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to approve charges payment",
      });
    }
  }

  // Reverse charges payment
  async reverseChargesPayment(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { paymentId } = req.params;
      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: "Payment ID is required",
        });
        return;
      }

      const validation = reverseChargesPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await chargesPaymentService.reverseChargesPayment(
        paymentId,
        validation.data,
        userId
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error reversing charges payment:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to reverse charges payment",
      });
    }
  }
}

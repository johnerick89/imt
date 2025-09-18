import { Request, Response } from "express";
import { CustomerService } from "./customers.services";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerFiltersSchema,
  customerStatsFiltersSchema,
} from "./customers.validation";
import type CustomRequest from "../../types/CustomReq.type";

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async createCustomer(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const validatedData = createCustomerSchema.parse(req.body);

      const result = await this.customerService.createCustomer(
        validatedData,
        userId
      );
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getCustomers(req: Request, res: Response) {
    try {
      const validatedFilters = customerFiltersSchema.parse(req.query);
      const result = await this.customerService.getCustomers(validatedFilters);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getCustomerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.customerService.getCustomerById(id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateCustomerSchema.parse(req.body);
      const result = await this.customerService.updateCustomer(
        id,
        validatedData
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async deleteCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.customerService.deleteCustomer(id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getCustomerStats(req: Request, res: Response) {
    try {
      const validatedFilters = customerStatsFiltersSchema.parse(req.query);
      const result = await this.customerService.getCustomerStats(
        validatedFilters
      );
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

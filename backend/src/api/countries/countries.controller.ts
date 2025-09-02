import { Request, Response } from "express";
import { CountryService } from "./countries.services";
import {
  createCountrySchema,
  updateCountrySchema,
  countryFiltersSchema,
} from "./countries.validation";

const countryService = new CountryService();

export class CountryController {
  async createCountry(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createCountrySchema.parse(req.body);
      const country = await countryService.createCountry(validatedData);

      res.status(201).json({
        success: true,
        message: "Country created successfully",
        data: country,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: "VALIDATION_ERROR",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: "INTERNAL_ERROR",
        });
      }
    }
  }

  async getCountries(req: Request, res: Response): Promise<void> {
    try {
      const validatedFilters = countryFiltersSchema.parse(req.query);
      const result = await countryService.getCountries(validatedFilters);

      res.status(200).json({
        success: true,
        message: "Countries retrieved successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
          error: "VALIDATION_ERROR",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: "INTERNAL_ERROR",
        });
      }
    }
  }

  async getCountryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const country = await countryService.getCountryById(id);

      if (!country) {
        res.status(404).json({
          success: false,
          message: "Country not found",
          error: "NOT_FOUND",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Country retrieved successfully",
        data: country,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      });
    }
  }

  async updateCountry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateCountrySchema.parse(req.body);
      const country = await countryService.updateCountry(id, validatedData);

      res.status(200).json({
        success: true,
        message: "Country updated successfully",
        data: country,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({
            success: false,
            message: error.message,
            error: "NOT_FOUND",
          });
        } else if (error.message.includes("already exists")) {
          res.status(409).json({
            success: false,
            message: error.message,
            error: "CONFLICT",
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
            error: "VALIDATION_ERROR",
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: "INTERNAL_ERROR",
        });
      }
    }
  }

  async deleteCountry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await countryService.deleteCountry(id);

      res.status(200).json({
        success: true,
        message: "Country deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          res.status(404).json({
            success: false,
            message: error.message,
            error: "NOT_FOUND",
          });
        } else if (error.message.includes("being used")) {
          res.status(409).json({
            success: false,
            message: error.message,
            error: "CONFLICT",
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
            error: "VALIDATION_ERROR",
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
          error: "INTERNAL_ERROR",
        });
      }
    }
  }

  async getCountryStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await countryService.getCountryStats();

      res.status(200).json({
        success: true,
        message: "Country stats retrieved successfully",
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      });
    }
  }

  async getAllCountries(req: Request, res: Response): Promise<void> {
    try {
      const countries = await countryService.getAllCountries();

      res.status(200).json({
        success: true,
        message: "All countries retrieved successfully",
        data: {
          countries,
          total: countries.length,
          page: 1,
          limit: countries.length,
          totalPages: 1,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      });
    }
  }
}

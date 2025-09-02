"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndustryController = void 0;
const industries_services_1 = require("./industries.services");
const industries_validation_1 = require("./industries.validation");
class IndustryController {
    constructor() {
        this.industryService = new industries_services_1.IndustryService();
    }
    async createIndustry(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            const validatedData = industries_validation_1.createIndustrySchema.parse(req.body);
            const result = await this.industryService.createIndustry(validatedData, userId);
            return res.status(201).json(result);
        }
        catch (error) {
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
    async getIndustries(req, res) {
        try {
            const validatedFilters = industries_validation_1.industryFiltersSchema.parse(req.query);
            const result = await this.industryService.getIndustries(validatedFilters);
            return res.status(200).json(result);
        }
        catch (error) {
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
    async getIndustryById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.industryService.getIndustryById(id);
            return res.status(200).json(result);
        }
        catch (error) {
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
    async updateIndustry(req, res) {
        try {
            const { id } = req.params;
            const validatedData = industries_validation_1.updateIndustrySchema.parse(req.body);
            const result = await this.industryService.updateIndustry(id, validatedData);
            return res.status(200).json(result);
        }
        catch (error) {
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
    async deleteIndustry(req, res) {
        try {
            const { id } = req.params;
            const result = await this.industryService.deleteIndustry(id);
            return res.status(200).json(result);
        }
        catch (error) {
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
    async getIndustryStats(req, res) {
        try {
            const result = await this.industryService.getIndustryStats();
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
}
exports.IndustryController = IndustryController;
//# sourceMappingURL=industries.controller.js.map
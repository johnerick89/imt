"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupationController = void 0;
const occupations_services_1 = require("./occupations.services");
const occupations_validation_1 = require("./occupations.validation");
class OccupationController {
    constructor() {
        this.occupationService = new occupations_services_1.OccupationService();
    }
    async createOccupation(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            const validatedData = occupations_validation_1.createOccupationSchema.parse(req.body);
            const result = await this.occupationService.createOccupation(validatedData, userId);
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
    async getOccupations(req, res) {
        try {
            const validatedFilters = occupations_validation_1.occupationFiltersSchema.parse(req.query);
            const result = await this.occupationService.getOccupations(validatedFilters);
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
    async getOccupationById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.occupationService.getOccupationById(id);
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
    async updateOccupation(req, res) {
        try {
            const { id } = req.params;
            const validatedData = occupations_validation_1.updateOccupationSchema.parse(req.body);
            const result = await this.occupationService.updateOccupation(id, validatedData);
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
    async deleteOccupation(req, res) {
        try {
            const { id } = req.params;
            const result = await this.occupationService.deleteOccupation(id);
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
    async getOccupationStats(req, res) {
        try {
            const result = await this.occupationService.getOccupationStats();
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
exports.OccupationController = OccupationController;
//# sourceMappingURL=occupations.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorridorController = void 0;
const corridors_services_1 = require("./corridors.services");
const corridors_validation_1 = require("./corridors.validation");
class CorridorController {
    constructor() {
        this.corridorService = new corridors_services_1.CorridorService();
    }
    async createCorridor(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            const validatedData = corridors_validation_1.createCorridorSchema.parse(req.body);
            const result = await this.corridorService.createCorridor(validatedData, userId);
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
    async getCorridors(req, res) {
        try {
            const validatedFilters = corridors_validation_1.corridorFiltersSchema.parse(req.query);
            const result = await this.corridorService.getCorridors(validatedFilters);
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
    async getCorridorById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.corridorService.getCorridorById(id);
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
    async updateCorridor(req, res) {
        try {
            const { id } = req.params;
            const validatedData = corridors_validation_1.updateCorridorSchema.parse(req.body);
            const result = await this.corridorService.updateCorridor(id, validatedData);
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
    async deleteCorridor(req, res) {
        try {
            const { id } = req.params;
            const result = await this.corridorService.deleteCorridor(id);
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
    async getCorridorStats(req, res) {
        try {
            const result = await this.corridorService.getCorridorStats();
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
exports.CorridorController = CorridorController;
//# sourceMappingURL=corridors.controller.js.map
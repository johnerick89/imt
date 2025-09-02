"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChargeController = void 0;
const charges_services_1 = require("./charges.services");
const charges_validation_1 = require("./charges.validation");
class ChargeController {
    constructor() {
        this.chargeService = new charges_services_1.ChargeService();
    }
    async createCharge(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            console.log("req.body", req.body);
            const validatedData = charges_validation_1.createChargeSchema.parse(req.body);
            const result = await this.chargeService.createCharge(validatedData, userId);
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
    async getCharges(req, res) {
        try {
            const validatedFilters = charges_validation_1.chargeFiltersSchema.parse(req.query);
            const result = await this.chargeService.getCharges(validatedFilters);
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
    async getChargeById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.chargeService.getChargeById(id);
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
    async updateCharge(req, res) {
        try {
            const { id } = req.params;
            const validatedData = charges_validation_1.updateChargeSchema.parse(req.body);
            const result = await this.chargeService.updateCharge(id, validatedData);
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
    async deleteCharge(req, res) {
        try {
            const { id } = req.params;
            const result = await this.chargeService.deleteCharge(id);
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
    async getChargeStats(req, res) {
        try {
            const result = await this.chargeService.getChargeStats();
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
exports.ChargeController = ChargeController;
//# sourceMappingURL=charges.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeneficiaryController = void 0;
const beneficiaries_services_1 = require("./beneficiaries.services");
const beneficiaries_validation_1 = require("./beneficiaries.validation");
class BeneficiaryController {
    constructor() {
        this.beneficiaryService = new beneficiaries_services_1.BeneficiaryService();
    }
    async createBeneficiary(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            const validatedData = beneficiaries_validation_1.createBeneficiarySchema.parse(req.body);
            const result = await this.beneficiaryService.createBeneficiary(validatedData, userId);
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
    async getBeneficiaries(req, res) {
        try {
            const validatedFilters = beneficiaries_validation_1.beneficiaryFiltersSchema.parse(req.query);
            const result = await this.beneficiaryService.getBeneficiaries(validatedFilters);
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
    async getBeneficiaryById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.beneficiaryService.getBeneficiaryById(id);
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
    async updateBeneficiary(req, res) {
        try {
            const { id } = req.params;
            const validatedData = beneficiaries_validation_1.updateBeneficiarySchema.parse(req.body);
            const result = await this.beneficiaryService.updateBeneficiary(id, validatedData);
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
    async deleteBeneficiary(req, res) {
        try {
            const { id } = req.params;
            const result = await this.beneficiaryService.deleteBeneficiary(id);
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
    async getBeneficiaryStats(req, res) {
        try {
            const result = await this.beneficiaryService.getBeneficiaryStats();
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
exports.BeneficiaryController = BeneficiaryController;
//# sourceMappingURL=beneficiaries.controller.js.map
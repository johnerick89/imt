"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationController = void 0;
const integrations_services_1 = require("./integrations.services");
const integrations_validation_1 = require("./integrations.validation");
class IntegrationController {
    constructor() {
        this.integrationService = new integrations_services_1.IntegrationService();
    }
    async createIntegration(req, res) {
        try {
            const validatedData = integrations_validation_1.createIntegrationSchema.parse(req.body);
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            const result = await this.integrationService.createIntegration(validatedData, userId);
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
    async getIntegrations(req, res) {
        try {
            const validatedFilters = integrations_validation_1.integrationFiltersSchema.parse(req.query);
            const result = await this.integrationService.getIntegrations(validatedFilters);
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
    async getIntegrationById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.integrationService.getIntegrationById(id);
            return res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Integration not found") {
                    return res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                }
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
    async updateIntegration(req, res) {
        try {
            const { id } = req.params;
            const validatedData = integrations_validation_1.updateIntegrationSchema.parse(req.body);
            const result = await this.integrationService.updateIntegration(id, validatedData);
            return res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Integration not found") {
                    return res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                }
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
    async deleteIntegration(req, res) {
        try {
            const { id } = req.params;
            const result = await this.integrationService.deleteIntegration(id);
            return res.status(200).json(result);
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === "Integration not found") {
                    return res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                }
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
    async getIntegrationStats(req, res) {
        try {
            const result = await this.integrationService.getIntegrationStats();
            return res.status(200).json({
                success: true,
                message: "Integration stats retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
}
exports.IntegrationController = IntegrationController;
//# sourceMappingURL=integrations.controller.js.map
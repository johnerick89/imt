"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationsController = void 0;
const organisations_service_1 = require("./organisations.service");
const organisations_validation_1 = require("./organisations.validation");
const client_1 = require("@prisma/client");
const organisationsService = new organisations_service_1.OrganisationsService();
class OrganisationsController {
    async createOrganisation(req, res) {
        try {
            console.log(req.body);
            const validatedData = organisations_validation_1.createOrganisationSchema.parse(req.body);
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                    error: "UNAUTHORIZED",
                });
                return;
            }
            const result = await organisationsService.createOrganisation(validatedData, userId);
            if (result.success) {
                res.status(201).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in createOrganisation controller:", error);
            res.status(400).json({
                success: false,
                message: "Invalid request data",
                error: error.message || "VALIDATION_ERROR",
            });
        }
    }
    async getOrganisations(req, res) {
        try {
            const validatedFilters = organisations_validation_1.organisationFiltersSchema.parse(req.query);
            const result = await organisationsService.getOrganisations(validatedFilters);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in getOrganisations controller:", error);
            res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: error.message || "VALIDATION_ERROR",
            });
        }
    }
    async getOrganisationById(req, res) {
        try {
            const { id } = organisations_validation_1.organisationIdSchema.parse(req.params);
            const result = await organisationsService.getOrganisationById(id);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(404).json(result);
            }
        }
        catch (error) {
            console.error("Error in getOrganisationById controller:", error);
            res.status(400).json({
                success: false,
                message: "Invalid organisation ID",
                error: error.message || "VALIDATION_ERROR",
            });
        }
    }
    async updateOrganisation(req, res) {
        try {
            const { id } = organisations_validation_1.organisationIdSchema.parse(req.params);
            const validatedData = organisations_validation_1.updateOrganisationSchema.parse(req.body);
            const result = await organisationsService.updateOrganisation(id, validatedData);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in updateOrganisation controller:", error);
            res.status(400).json({
                success: false,
                message: "Invalid request data",
                error: error.message || "VALIDATION_ERROR",
            });
        }
    }
    async deleteOrganisation(req, res) {
        try {
            const { id } = organisations_validation_1.organisationIdSchema.parse(req.params);
            const result = await organisationsService.deleteOrganisation(id);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in deleteOrganisation controller:", error);
            res.status(400).json({
                success: false,
                message: "Invalid organisation ID",
                error: error.message || "VALIDATION_ERROR",
            });
        }
    }
    async toggleOrganisationStatus(req, res) {
        try {
            const { id } = organisations_validation_1.organisationIdSchema.parse(req.params);
            const { status } = req.body;
            if (!status || !Object.values(client_1.OrganisationStatus).includes(status)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid status value",
                    error: "INVALID_STATUS",
                });
                return;
            }
            const result = await organisationsService.toggleOrganisationStatus(id, status);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in toggleOrganisationStatus controller:", error);
            res.status(400).json({
                success: false,
                message: "Invalid request data",
                error: error.message || "VALIDATION_ERROR",
            });
        }
    }
    async getOrganisationStats(req, res) {
        try {
            const result = await organisationsService.getOrganisationStats();
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in getOrganisationStats controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve organisation stats",
                error: "INTERNAL_ERROR",
            });
        }
    }
    async getAllOrganisations(req, res) {
        try {
            const result = await organisationsService.getAllOrganisations();
            res.status(200).json({
                success: true,
                message: "All organisations retrieved successfully",
                data: {
                    organisations: result,
                    total: result.length,
                    page: 1,
                    limit: result.length,
                    totalPages: 1,
                },
            });
        }
        catch (error) {
            console.error("Error in getAllOrganisations controller:", error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve all organisations",
                error: "INTERNAL_ERROR",
            });
        }
    }
}
exports.OrganisationsController = OrganisationsController;
//# sourceMappingURL=organisations.controller.js.map
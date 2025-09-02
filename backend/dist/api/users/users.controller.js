"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_services_1 = require("./users.services");
const users_validation_1 = require("./users.validation");
const usersService = new users_services_1.UsersService();
class UsersController {
    async createUser(req, res) {
        try {
            const validationResult = users_validation_1.createUserSchema.safeParse(req.body);
            if (!validationResult.success) {
                const response = {
                    success: false,
                    message: "Validation failed",
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                };
                res.status(400).json(response);
                return;
            }
            const result = await usersService.createUser(validationResult.data);
            if (result.success) {
                res.status(201).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in createUser controller:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            };
            res.status(500).json(response);
        }
    }
    async getUsers(req, res) {
        try {
            const filters = {
                search: req.query.search,
                role: req.query.role,
                status: req.query.status,
                organisation_id: req.query.organisation_id,
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
            };
            const validationResult = users_validation_1.userFiltersSchema.safeParse(filters);
            if (!validationResult.success) {
                const response = {
                    success: false,
                    message: "Validation failed",
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                };
                res.status(400).json(response);
                return;
            }
            const result = await usersService.getUsers(validationResult.data);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in getUsers controller:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            };
            res.status(500).json(response);
        }
    }
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                const response = {
                    success: false,
                    message: "User ID is required",
                    error: "MISSING_ID",
                };
                res.status(400).json(response);
                return;
            }
            const result = await usersService.getUserById(id);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(404).json(result);
            }
        }
        catch (error) {
            console.error("Error in getUserById controller:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            };
            res.status(500).json(response);
        }
    }
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                const response = {
                    success: false,
                    message: "User ID is required",
                    error: "MISSING_ID",
                };
                res.status(400).json(response);
                return;
            }
            const validationResult = users_validation_1.updateUserSchema.safeParse(req.body);
            if (!validationResult.success) {
                const response = {
                    success: false,
                    message: "Validation failed",
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                };
                res.status(400).json(response);
                return;
            }
            const result = await usersService.updateUser(id, validationResult.data);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in updateUser controller:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            };
            res.status(500).json(response);
        }
    }
    async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                const response = {
                    success: false,
                    message: "User ID is required",
                    error: "MISSING_ID",
                };
                res.status(400).json(response);
                return;
            }
            const validationResult = users_validation_1.toggleUserStatusSchema.safeParse(req.body);
            if (!validationResult.success) {
                const response = {
                    success: false,
                    message: "Validation failed",
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                };
                res.status(400).json(response);
                return;
            }
            const result = await usersService.toggleUserStatus(id, validationResult.data.status);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in toggleUserStatus controller:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            };
            res.status(500).json(response);
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                const response = {
                    success: false,
                    message: "User ID is required",
                    error: "MISSING_ID",
                };
                res.status(400).json(response);
                return;
            }
            const result = await usersService.deleteUser(id);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in deleteUser controller:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            };
            res.status(500).json(response);
        }
    }
    async getUserStats(req, res) {
        try {
            const result = await usersService.getUserStats();
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in getUserStats controller:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            };
            res.status(500).json(response);
        }
    }
}
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map
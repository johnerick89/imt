"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_services_1 = require("./auth.services");
const auth_validation_1 = require("./auth.validation");
const authService = new auth_services_1.AuthService();
class AuthController {
    async login(req, res) {
        try {
            const validationResult = auth_validation_1.loginSchema.safeParse(req.body);
            if (!validationResult.success) {
                const response = {
                    success: false,
                    message: "Validation failed",
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                };
                res.status(400).json(response);
                return;
            }
            const loginData = validationResult.data;
            const result = await authService.login(loginData);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(401).json(result);
            }
        }
        catch (error) {
            console.error("Login controller error:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "An unexpected error occurred",
            };
            res.status(500).json(response);
        }
    }
    async register(req, res) {
        try {
            const validationResult = auth_validation_1.registerSchema.safeParse(req.body);
            if (!validationResult.success) {
                const response = {
                    success: false,
                    message: "Validation failed",
                    error: validationResult.error.issues[0]?.message || "Invalid input",
                };
                res.status(400).json(response);
                return;
            }
            const registerData = validationResult.data;
            const result = await authService.register(registerData);
            if (result.success) {
                res.status(201).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Register controller error:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "An unexpected error occurred",
            };
            res.status(500).json(response);
        }
    }
    async getProfile(req, res) {
        try {
            const user = req.user;
            if (!user) {
                const response = {
                    success: false,
                    message: "User not found",
                    error: "Authentication required",
                };
                res.status(401).json(response);
                return;
            }
            const response = {
                success: true,
                message: "Profile retrieved successfully",
                data: user,
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error("Get profile controller error:", error);
            const response = {
                success: false,
                message: "Internal server error",
                error: "An unexpected error occurred",
            };
            res.status(500).json(response);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
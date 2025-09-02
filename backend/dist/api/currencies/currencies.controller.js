"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyController = void 0;
const currencies_services_1 = require("./currencies.services");
const currencies_validation_1 = require("./currencies.validation");
const currencyService = new currencies_services_1.CurrencyService();
class CurrencyController {
    async createCurrency(req, res) {
        try {
            const validatedData = currencies_validation_1.createCurrencySchema.parse(req.body);
            const currency = await currencyService.createCurrency(validatedData);
            res.status(201).json({
                success: true,
                message: "Currency created successfully",
                data: currency,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                    error: "VALIDATION_ERROR",
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: "INTERNAL_ERROR",
                });
            }
        }
    }
    async getCurrencies(req, res) {
        try {
            const validatedFilters = currencies_validation_1.currencyFiltersSchema.parse(req.query);
            const result = await currencyService.getCurrencies(validatedFilters);
            res.status(200).json({
                success: true,
                message: "Currencies retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                    error: "VALIDATION_ERROR",
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: "INTERNAL_ERROR",
                });
            }
        }
    }
    async getCurrencyById(req, res) {
        try {
            const { id } = req.params;
            const currency = await currencyService.getCurrencyById(id);
            if (!currency) {
                res.status(404).json({
                    success: false,
                    message: "Currency not found",
                    error: "NOT_FOUND",
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Currency retrieved successfully",
                data: currency,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            });
        }
    }
    async updateCurrency(req, res) {
        try {
            const { id } = req.params;
            const validatedData = currencies_validation_1.updateCurrencySchema.parse(req.body);
            const currency = await currencyService.updateCurrency(id, validatedData);
            res.status(200).json({
                success: true,
                message: "Currency updated successfully",
                data: currency,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                        error: "NOT_FOUND",
                    });
                }
                else if (error.message.includes("already exists")) {
                    res.status(409).json({
                        success: false,
                        message: error.message,
                        error: "CONFLICT",
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                        error: "VALIDATION_ERROR",
                    });
                }
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: "INTERNAL_ERROR",
                });
            }
        }
    }
    async deleteCurrency(req, res) {
        try {
            const { id } = req.params;
            await currencyService.deleteCurrency(id);
            res.status(200).json({
                success: true,
                message: "Currency deleted successfully",
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("not found")) {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                        error: "NOT_FOUND",
                    });
                }
                else if (error.message.includes("being used")) {
                    res.status(409).json({
                        success: false,
                        message: error.message,
                        error: "CONFLICT",
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: error.message,
                        error: "VALIDATION_ERROR",
                    });
                }
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: "INTERNAL_ERROR",
                });
            }
        }
    }
    async getCurrencyStats(req, res) {
        try {
            const stats = await currencyService.getCurrencyStats();
            res.status(200).json({
                success: true,
                message: "Currency stats retrieved successfully",
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            });
        }
    }
    async getAllCurrencies(req, res) {
        try {
            const currencies = await currencyService.getAllCurrencies();
            res.status(200).json({
                success: true,
                message: "All currencies retrieved successfully",
                data: currencies,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            });
        }
    }
}
exports.CurrencyController = CurrencyController;
//# sourceMappingURL=currencies.controller.js.map
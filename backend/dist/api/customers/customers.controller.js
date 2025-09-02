"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customers_services_1 = require("./customers.services");
const customers_validation_1 = require("./customers.validation");
class CustomerController {
    constructor() {
        this.customerService = new customers_services_1.CustomerService();
    }
    async createCustomer(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            const validatedData = customers_validation_1.createCustomerSchema.parse(req.body);
            const result = await this.customerService.createCustomer(validatedData, userId);
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
    async getCustomers(req, res) {
        try {
            const validatedFilters = customers_validation_1.customerFiltersSchema.parse(req.query);
            const result = await this.customerService.getCustomers(validatedFilters);
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
    async getCustomerById(req, res) {
        try {
            const { id } = req.params;
            const result = await this.customerService.getCustomerById(id);
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
    async updateCustomer(req, res) {
        try {
            const { id } = req.params;
            const validatedData = customers_validation_1.updateCustomerSchema.parse(req.body);
            const result = await this.customerService.updateCustomer(id, validatedData);
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
    async deleteCustomer(req, res) {
        try {
            const { id } = req.params;
            const result = await this.customerService.deleteCustomer(id);
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
    async getCustomerStats(req, res) {
        try {
            const result = await this.customerService.getCustomerStats();
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
exports.CustomerController = CustomerController;
//# sourceMappingURL=customers.controller.js.map
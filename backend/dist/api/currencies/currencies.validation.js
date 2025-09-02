"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyFiltersSchema = exports.updateCurrencySchema = exports.createCurrencySchema = void 0;
const zod_1 = require("zod");
exports.createCurrencySchema = zod_1.z.object({
    currency_name: zod_1.z
        .string()
        .min(1, "Currency name is required")
        .max(100, "Currency name must be less than 100 characters"),
    currency_code: zod_1.z
        .string()
        .min(1, "Currency code is required")
        .max(10, "Currency code must be less than 10 characters")
        .toUpperCase(),
    currency_symbol: zod_1.z
        .string()
        .min(1, "Currency symbol is required")
        .max(10, "Currency symbol must be less than 10 characters"),
    symbol_native: zod_1.z.string().optional(),
    decimal_digits: zod_1.z.number().min(0).max(8).optional(),
    rounding: zod_1.z.number().optional(),
    name_plural: zod_1.z.string().optional(),
});
exports.updateCurrencySchema = zod_1.z.object({
    currency_name: zod_1.z
        .string()
        .min(1, "Currency name is required")
        .max(100, "Currency name must be less than 100 characters")
        .optional(),
    currency_code: zod_1.z
        .string()
        .min(1, "Currency code is required")
        .max(10, "Currency code must be less than 10 characters")
        .toUpperCase()
        .optional(),
    currency_symbol: zod_1.z
        .string()
        .min(1, "Currency symbol is required")
        .max(10, "Currency symbol must be less than 10 characters")
        .optional(),
    symbol_native: zod_1.z.string().optional(),
    decimal_digits: zod_1.z.number().min(0).max(8).optional(),
    rounding: zod_1.z.number().optional(),
    name_plural: zod_1.z.string().optional(),
});
exports.currencyFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    currency_code: zod_1.z.string().optional(),
    page: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().min(1).max(100))
        .optional(),
    limit: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().min(1).max(100))
        .optional(),
});
//# sourceMappingURL=currencies.validation.js.map
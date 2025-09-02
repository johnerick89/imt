import { z } from "zod";
export declare const createCurrencySchema: z.ZodObject<{
    currency_name: z.ZodString;
    currency_code: z.ZodString;
    currency_symbol: z.ZodString;
    symbol_native: z.ZodOptional<z.ZodString>;
    decimal_digits: z.ZodOptional<z.ZodNumber>;
    rounding: z.ZodOptional<z.ZodNumber>;
    name_plural: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCurrencySchema: z.ZodObject<{
    currency_name: z.ZodOptional<z.ZodString>;
    currency_code: z.ZodOptional<z.ZodString>;
    currency_symbol: z.ZodOptional<z.ZodString>;
    symbol_native: z.ZodOptional<z.ZodString>;
    decimal_digits: z.ZodOptional<z.ZodNumber>;
    rounding: z.ZodOptional<z.ZodNumber>;
    name_plural: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const currencyFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    currency_code: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
}, z.core.$strip>;
//# sourceMappingURL=currencies.validation.d.ts.map
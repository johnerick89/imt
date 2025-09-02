import { z } from "zod";
export declare const createCountrySchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
}, z.core.$strip>;
export declare const updateCountrySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const countryFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
}, z.core.$strip>;
//# sourceMappingURL=countries.validation.d.ts.map
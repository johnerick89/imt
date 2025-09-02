import type { ICurrency, CreateCurrencyRequest, UpdateCurrencyRequest, CurrencyFilters, CurrencyStats } from "./currencies.interfaces";
export declare class CurrencyService {
    createCurrency(data: CreateCurrencyRequest): Promise<ICurrency>;
    getCurrencies(filters?: CurrencyFilters): Promise<{
        currencies: ICurrency[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCurrencyById(id: string): Promise<ICurrency | null>;
    updateCurrency(id: string, data: UpdateCurrencyRequest): Promise<ICurrency>;
    deleteCurrency(id: string): Promise<void>;
    getCurrencyStats(): Promise<CurrencyStats>;
    getAllCurrencies(): Promise<ICurrency[]>;
}
//# sourceMappingURL=currencies.services.d.ts.map
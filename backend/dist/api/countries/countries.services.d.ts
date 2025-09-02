import type { ICountry, CreateCountryRequest, UpdateCountryRequest, CountryFilters, CountryStats } from "./countries.interfaces";
export declare class CountryService {
    createCountry(data: CreateCountryRequest): Promise<ICountry>;
    getCountries(filters?: CountryFilters): Promise<{
        countries: ICountry[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCountryById(id: string): Promise<ICountry | null>;
    updateCountry(id: string, data: UpdateCountryRequest): Promise<ICountry>;
    deleteCountry(id: string): Promise<void>;
    getCountryStats(): Promise<CountryStats>;
    getAllCountries(): Promise<ICountry[]>;
}
//# sourceMappingURL=countries.services.d.ts.map
export interface ICountry {
    id: string;
    name: string;
    code: string;
    created_at: Date;
    updated_at: Date;
    created_by: string | null;
}
export interface CreateCountryRequest {
    name: string;
    code: string;
}
export interface UpdateCountryRequest {
    name?: string;
    code?: string;
}
export interface CountryFilters {
    search?: string;
    code?: string;
    page?: number;
    limit?: number;
}
export interface CountryListResponse {
    success: boolean;
    message: string;
    data: {
        countries: ICountry[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
export interface CountryResponse {
    success: boolean;
    message: string;
    data: ICountry;
}
export interface CountryStats {
    totalCountries: number;
}
export interface CountryStatsResponse {
    success: boolean;
    message: string;
    data: CountryStats;
}
//# sourceMappingURL=countries.interfaces.d.ts.map
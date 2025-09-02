"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CountryService {
    async createCountry(data) {
        const existingCountry = await prisma.country.findFirst({
            where: { code: data.code.toUpperCase() },
        });
        if (existingCountry) {
            throw new Error(`Country with code ${data.code} already exists`);
        }
        const country = await prisma.country.create({
            data: {
                name: data.name,
                code: data.code.toUpperCase(),
            },
        });
        return country;
    }
    async getCountries(filters = {}) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { code: { contains: filters.search, mode: "insensitive" } },
            ];
        }
        if (filters.code) {
            where.code = { contains: filters.code, mode: "insensitive" };
        }
        const [countries, total] = await Promise.all([
            prisma.country.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: "asc" },
            }),
            prisma.country.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            countries,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }
    async getCountryById(id) {
        const country = await prisma.country.findUnique({
            where: { id },
        });
        return country;
    }
    async updateCountry(id, data) {
        const existingCountry = await prisma.country.findUnique({
            where: { id },
        });
        if (!existingCountry) {
            throw new Error(`Country with id ${id} not found`);
        }
        if (data.code && data.code !== existingCountry.code) {
            const codeExists = await prisma.country.findFirst({
                where: {
                    code: data.code.toUpperCase(),
                    id: { not: id },
                },
            });
            if (codeExists) {
                throw new Error(`Country with code ${data.code} already exists`);
            }
        }
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.code)
            updateData.code = data.code.toUpperCase();
        const country = await prisma.country.update({
            where: { id },
            data: updateData,
        });
        return country;
    }
    async deleteCountry(id) {
        const existingCountry = await prisma.country.findUnique({
            where: { id },
        });
        if (!existingCountry) {
            throw new Error(`Country with id ${id} not found`);
        }
        const organisationsUsingCountry = await prisma.organisation.findFirst({
            where: { country_id: id },
        });
        if (organisationsUsingCountry) {
            throw new Error(`Cannot delete country. It is being used by organisation: ${organisationsUsingCountry.name}`);
        }
        await prisma.country.delete({
            where: { id },
        });
    }
    async getCountryStats() {
        const totalCountries = await prisma.country.count();
        return {
            totalCountries,
        };
    }
    async getAllCountries() {
        const countries = await prisma.country.findMany({
            orderBy: { name: "asc" },
        });
        return countries;
    }
}
exports.CountryService = CountryService;
//# sourceMappingURL=countries.services.js.map
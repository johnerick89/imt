import { prisma } from "../../lib/prisma.lib";
import type {
  ICurrency,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
  CurrencyFilters,
  CurrencyStats,
} from "./currencies.interfaces";

export class CurrencyService {
  async createCurrency(data: CreateCurrencyRequest): Promise<ICurrency> {
    // Check if currency code already exists
    const existingCurrency = await prisma.currency.findFirst({
      where: { currency_code: data.currency_code.toUpperCase() },
    });

    if (existingCurrency) {
      throw new Error(
        `Currency with code ${data.currency_code} already exists`
      );
    }

    const currency = await prisma.currency.create({
      data: {
        currency_name: data.currency_name,
        currency_code: data.currency_code.toUpperCase(),
        currency_symbol: data.currency_symbol,
        symbol_native: data.symbol_native,
        decimal_digits: data.decimal_digits,
        rounding: data.rounding,
        name_plural: data.name_plural,
      },
    });

    return currency;
  }

  async getCurrencies(filters: CurrencyFilters = {}): Promise<{
    currencies: ICurrency[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { currency_name: { contains: filters.search, mode: "insensitive" } },
        { currency_code: { contains: filters.search, mode: "insensitive" } },
        { currency_symbol: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.currency_code) {
      where.currency_code = {
        contains: filters.currency_code,
        mode: "insensitive",
      };
    }

    const [currencies, total] = await Promise.all([
      prisma.currency.findMany({
        where,
        skip,
        take: limit,
        orderBy: { currency_name: "asc" },
      }),
      prisma.currency.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      currencies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getCurrencyById(id: string): Promise<ICurrency | null> {
    const currency = await prisma.currency.findUnique({
      where: { id },
    });

    return currency;
  }

  async updateCurrency(
    id: string,
    data: UpdateCurrencyRequest
  ): Promise<ICurrency> {
    // Check if currency exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { id },
    });

    if (!existingCurrency) {
      throw new Error(`Currency with id ${id} not found`);
    }

    // If updating code, check if new code already exists
    if (
      data.currency_code &&
      data.currency_code !== existingCurrency.currency_code
    ) {
      const codeExists = await prisma.currency.findFirst({
        where: {
          currency_code: data.currency_code.toUpperCase(),
          id: { not: id },
        },
      });

      if (codeExists) {
        throw new Error(
          `Currency with code ${data.currency_code} already exists`
        );
      }
    }

    const updateData: any = {};
    if (data.currency_name) updateData.currency_name = data.currency_name;
    if (data.currency_code)
      updateData.currency_code = data.currency_code.toUpperCase();
    if (data.currency_symbol) updateData.currency_symbol = data.currency_symbol;
    if (data.symbol_native !== undefined)
      updateData.symbol_native = data.symbol_native;
    if (data.decimal_digits !== undefined)
      updateData.decimal_digits = data.decimal_digits;
    if (data.rounding !== undefined) updateData.rounding = data.rounding;
    if (data.name_plural !== undefined)
      updateData.name_plural = data.name_plural;

    const currency = await prisma.currency.update({
      where: { id },
      data: updateData,
    });

    return currency;
  }

  async deleteCurrency(id: string): Promise<void> {
    // Check if currency exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { id },
    });

    if (!existingCurrency) {
      throw new Error(`Currency with id ${id} not found`);
    }

    // Check if currency is being used by any organisation
    const organisationsUsingCurrency = await prisma.organisation.findFirst({
      where: { base_currency_id: id },
    });

    if (organisationsUsingCurrency) {
      throw new Error(
        `Cannot delete currency. It is being used by organisation: ${organisationsUsingCurrency.name}`
      );
    }

    await prisma.currency.delete({
      where: { id },
    });
  }

  async getCurrencyStats(): Promise<CurrencyStats> {
    const totalCurrencies = await prisma.currency.count();

    return {
      totalCurrencies,
    };
  }

  async getAllCurrencies(): Promise<ICurrency[]> {
    const currencies = await prisma.currency.findMany({
      orderBy: { currency_name: "asc" },
    });

    return currencies;
  }
}

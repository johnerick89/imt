import { z } from "zod";
import { ExchangeRateStatus, ExchangeRateOperatorStatus } from "@prisma/client";

export const createExchangeRateSchema = z.object({
  name: z.string().optional(),
  from_currency_id: z.string().uuid().optional(),
  to_currency_id: z.string().uuid().optional(),
  origin_country_id: z.string().uuid().optional(),
  destination_country_id: z.string().uuid().optional(),
  buy_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive("Buy rate must be positive")),
  sell_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive("Sell rate must be positive")),
  exchange_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive("Exchange rate must be positive")),
  min_buy_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  max_buy_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  min_sell_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  max_sell_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  min_exchange_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  max_exchange_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  status: z.enum(Object.values(ExchangeRateStatus)).optional(),
  valid_from: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return val;
  }, z.string().optional()),
  valid_to: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return val;
  }, z.string().optional()),
});

export const updateExchangeRateSchema = z.object({
  name: z.string().optional(),
  from_currency_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  to_currency_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  origin_country_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  destination_country_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  buy_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  sell_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  exchange_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  min_buy_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  max_buy_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  min_sell_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  max_sell_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  min_exchange_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  max_exchange_rate: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().positive().optional()),
  status: z.enum(Object.values(ExchangeRateStatus)).optional(),
  valid_from: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return val;
  }, z.string().optional()),
  valid_to: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return val;
  }, z.string().optional()),
});

export const exchangeRateFiltersSchema = z.object({
  page: z.preprocess(
    (val) => (val ? parseInt(val as string) : 1),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(val as string) : 10),
    z.number().int().positive().max(100).optional()
  ),
  search: z.string().optional(),
  from_currency_id: z.string().uuid().optional(),
  to_currency_id: z.string().uuid().optional(),
  origin_country_id: z.string().uuid().optional(),
  destination_country_id: z.string().uuid().optional(),
  status: z.enum(Object.values(ExchangeRateStatus)).optional(),
  created_by: z.string().uuid().optional(),
});

export const approveExchangeRateSchema = z.object({
  status: z.enum([
    ExchangeRateStatus.PENDING_APPROVAL,
    ExchangeRateStatus.APPROVED,
    ExchangeRateStatus.ACTIVE,
    ExchangeRateStatus.INACTIVE,
    ExchangeRateStatus.REJECTED,
  ]),
  operator_status: z.enum([
    ExchangeRateOperatorStatus.PENDING_APPROVAL,
    ExchangeRateOperatorStatus.APPROVED,
    ExchangeRateOperatorStatus.REJECTED,
  ]),
});

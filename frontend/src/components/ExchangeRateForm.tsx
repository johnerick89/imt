import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { SearchableSelect } from "./ui/SearchableSelect";
import {
  useCurrencies,
  useCountries,
  useSession,
  useAllOrganisations,
} from "../hooks";
import type {
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
  ExchangeRate,
} from "../types/ExchangeRatesTypes";

interface ExchangeRateFormProps {
  initialData?: ExchangeRate;
  onSubmit: (
    data: CreateExchangeRateRequest | UpdateExchangeRateRequest
  ) => void;
  isLoading?: boolean;
}

const ExchangeRateForm: React.FC<ExchangeRateFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = !!initialData;
  const { user } = useSession();
  const currentOrganisationId = user?.organisation_id;
  const { data: organisationsData } = useAllOrganisations();
  const userOrganisation = organisationsData?.data?.organisations?.find(
    (org) => org.id === currentOrganisationId
  );
  console.log(
    "userOrganisation",
    userOrganisation,
    "organisationsData",
    organisationsData,
    "currentOrganisationId",
    currentOrganisationId
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateExchangeRateRequest>({
    defaultValues: {
      name: initialData?.name || "",
      from_currency_id:
        initialData?.from_currency_id ||
        userOrganisation?.base_currency_id ||
        "",
      to_currency_id:
        initialData?.to_currency_id || userOrganisation?.base_currency_id || "",
      origin_country_id:
        initialData?.origin_country_id || userOrganisation?.country_id || "",
      destination_country_id: initialData?.destination_country_id || "",
      buy_rate: initialData?.buy_rate || 0,
      sell_rate: initialData?.sell_rate || 0,
      exchange_rate: initialData?.exchange_rate || 0,
      min_buy_rate: initialData?.min_buy_rate || undefined,
      max_buy_rate: initialData?.max_buy_rate || undefined,
      min_sell_rate: initialData?.min_sell_rate || undefined,
      max_sell_rate: initialData?.max_sell_rate || undefined,
      min_exchange_rate: initialData?.min_exchange_rate || undefined,
      max_exchange_rate: initialData?.max_exchange_rate || undefined,
      organisation_id:
        initialData?.organisation_id || currentOrganisationId || "",
      date_from: initialData?.date_from
        ? new Date(initialData.date_from).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      date_to: initialData?.date_to
        ? new Date(initialData.date_to).toISOString().split("T")[0]
        : undefined,
    },
  });

  // Data for dropdowns
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: countriesData } = useCountries({ limit: 1000 });

  const currencies = currenciesData?.data?.currencies || [];
  const countries = countriesData?.data?.countries || [];

  const handleFormSubmit = (data: CreateExchangeRateRequest) => {
    try {
      // Convert empty strings to undefined for optional fields and format dates
      const cleanedData = {
        ...data,
        name: data.name || undefined,
        from_currency_id:
          data.from_currency_id || userOrganisation?.base_currency_id || "",
        to_currency_id:
          data.to_currency_id || userOrganisation?.base_currency_id || "",
        origin_country_id:
          data.origin_country_id || userOrganisation?.country_id || "",
        destination_country_id: data.destination_country_id || undefined,
        min_buy_rate: data.min_buy_rate || undefined,
        max_buy_rate: data.max_buy_rate || undefined,
        min_sell_rate: data.min_sell_rate || undefined,
        max_sell_rate: data.max_sell_rate || undefined,
        min_exchange_rate: data.min_exchange_rate || undefined,
        max_exchange_rate: data.max_exchange_rate || undefined,
        organisation_id: data.organisation_id || currentOrganisationId,
        date_from: data.date_from
          ? new Date(data.date_from).toISOString()
          : undefined,
        date_to: data.date_to
          ? new Date(data.date_to).toISOString()
          : undefined,
        buy_rate: Number(data.buy_rate),
        sell_rate: Number(data.sell_rate),
        exchange_rate: Number(data.exchange_rate),
      };
      onSubmit(cleanedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Exchange Rate Information
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <FormItem
            label="Name"
            invalid={!!errors.name}
            errorMessage={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter exchange rate name (optional)"
                  disabled={isLoading}
                  invalid={!!errors.name}
                />
              )}
            />
          </FormItem>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem
              label="From Currency"
              invalid={!!errors.from_currency_id}
              errorMessage={errors.from_currency_id?.message}
            >
              <Controller
                name="from_currency_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    {...field}
                    options={currencies.map((currency) => ({
                      value: currency.id,
                      label: `${currency.currency_code} - ${currency.currency_name}`,
                    }))}
                    placeholder="Select from currency"
                    disabled={isLoading}
                    invalid={!!errors.from_currency_id}
                  />
                )}
              />
            </FormItem>

            <FormItem
              label="To Currency"
              invalid={!!errors.to_currency_id}
              errorMessage={errors.to_currency_id?.message}
            >
              <Controller
                name="to_currency_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    {...field}
                    options={currencies.map((currency) => ({
                      value: currency.id,
                      label: `${currency.currency_code} - ${currency.currency_name}`,
                    }))}
                    placeholder="Select to currency"
                    disabled={isLoading}
                    invalid={!!errors.to_currency_id}
                  />
                )}
              />
            </FormItem>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem
              label="Origin Country"
              invalid={!!errors.origin_country_id}
              errorMessage={errors.origin_country_id?.message}
            >
              <Controller
                name="origin_country_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    {...field}
                    options={countries.map((country) => ({
                      value: country.id,
                      label: country.name,
                    }))}
                    placeholder="Select origin country"
                    disabled={isLoading}
                    invalid={!!errors.origin_country_id}
                  />
                )}
              />
            </FormItem>

            <FormItem
              label="Destination Country"
              invalid={!!errors.destination_country_id}
              errorMessage={errors.destination_country_id?.message}
            >
              <Controller
                name="destination_country_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    {...field}
                    options={countries.map((country) => ({
                      value: country.id,
                      label: country.name,
                    }))}
                    placeholder="Select destination country"
                    disabled={isLoading}
                    invalid={!!errors.destination_country_id}
                  />
                )}
              />
            </FormItem>
          </div>
        </div>
      </div>

      {/* Exchange Rates */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Exchange Rates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormItem
            label="Buy Rate"
            invalid={!!errors.buy_rate}
            errorMessage={errors.buy_rate?.message}
            required
          >
            <Controller
              name="buy_rate"
              control={control}
              rules={{
                required: "Buy rate is required",
                min: { value: 0, message: "Buy rate must be positive" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.000000001"
                  placeholder="0.000000000"
                  disabled={isLoading}
                  invalid={!!errors.buy_rate}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Sell Rate"
            invalid={!!errors.sell_rate}
            errorMessage={errors.sell_rate?.message}
            required
          >
            <Controller
              name="sell_rate"
              control={control}
              rules={{
                required: "Sell rate is required",
                min: { value: 0, message: "Sell rate must be positive" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.000000001"
                  placeholder="0.000000000"
                  disabled={isLoading}
                  invalid={!!errors.sell_rate}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Exchange Rate"
            invalid={!!errors.exchange_rate}
            errorMessage={errors.exchange_rate?.message}
            required
          >
            <Controller
              name="exchange_rate"
              control={control}
              rules={{
                required: "Exchange rate is required",
                min: { value: 0, message: "Exchange rate must be positive" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.000000001"
                  placeholder="0.000000000"
                  disabled={isLoading}
                  invalid={!!errors.exchange_rate}
                />
              )}
            />
          </FormItem>
        </div>
      </div>

      {/* Rate Limits */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rate Limits (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              Buy Rate Limits
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormItem
                label="Min Buy Rate"
                invalid={!!errors.min_buy_rate}
                errorMessage={errors.min_buy_rate?.message}
              >
                <Controller
                  name="min_buy_rate"
                  control={control}
                  rules={{
                    min: { value: 0, message: "Min buy rate must be positive" },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.000000001"
                      placeholder="Optional"
                      disabled={isLoading}
                      invalid={!!errors.min_buy_rate}
                    />
                  )}
                />
              </FormItem>

              <FormItem
                label="Max Buy Rate"
                invalid={!!errors.max_buy_rate}
                errorMessage={errors.max_buy_rate?.message}
              >
                <Controller
                  name="max_buy_rate"
                  control={control}
                  rules={{
                    min: { value: 0, message: "Max buy rate must be positive" },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.000000001"
                      placeholder="Optional"
                      disabled={isLoading}
                      invalid={!!errors.max_buy_rate}
                    />
                  )}
                />
              </FormItem>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              Sell Rate Limits
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormItem
                label="Min Sell Rate"
                invalid={!!errors.min_sell_rate}
                errorMessage={errors.min_sell_rate?.message}
              >
                <Controller
                  name="min_sell_rate"
                  control={control}
                  rules={{
                    min: {
                      value: 0,
                      message: "Min sell rate must be positive",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.000000001"
                      placeholder="Optional"
                      disabled={isLoading}
                      invalid={!!errors.min_sell_rate}
                    />
                  )}
                />
              </FormItem>

              <FormItem
                label="Max Sell Rate"
                invalid={!!errors.max_sell_rate}
                errorMessage={errors.max_sell_rate?.message}
              >
                <Controller
                  name="max_sell_rate"
                  control={control}
                  rules={{
                    min: {
                      value: 0,
                      message: "Max sell rate must be positive",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      step="0.000000001"
                      placeholder="Optional"
                      disabled={isLoading}
                      invalid={!!errors.max_sell_rate}
                    />
                  )}
                />
              </FormItem>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Exchange Rate Limits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem
              label="Min Exchange Rate"
              invalid={!!errors.min_exchange_rate}
              errorMessage={errors.min_exchange_rate?.message}
            >
              <Controller
                name="min_exchange_rate"
                control={control}
                rules={{
                  min: {
                    value: 0,
                    message: "Min exchange rate must be positive",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.000000001"
                    placeholder="Optional"
                    disabled={isLoading}
                    invalid={!!errors.min_exchange_rate}
                  />
                )}
              />
            </FormItem>

            <FormItem
              label="Max Exchange Rate"
              invalid={!!errors.max_exchange_rate}
              errorMessage={errors.max_exchange_rate?.message}
            >
              <Controller
                name="max_exchange_rate"
                control={control}
                rules={{
                  min: {
                    value: 0,
                    message: "Max exchange rate must be positive",
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.000000001"
                    placeholder="Optional"
                    disabled={isLoading}
                    invalid={!!errors.max_exchange_rate}
                  />
                )}
              />
            </FormItem>
          </div>
        </div>
      </div>

      {/* Validity Period */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Validity Period
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Valid From"
            invalid={!!errors.date_from}
            errorMessage={errors.date_from?.message}
          >
            <Controller
              name="date_from"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  disabled={isLoading}
                  invalid={!!errors.date_from}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Valid To"
            invalid={!!errors.date_to}
            errorMessage={errors.date_to?.message}
          >
            <Controller
              name="date_to"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  disabled={isLoading}
                  invalid={!!errors.date_to}
                />
              )}
            />
          </FormItem>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading
            ? "Saving..."
            : isEdit
            ? "Update Exchange Rate"
            : "Create Exchange Rate"}
        </button>
      </div>
    </form>
  );
};

export default ExchangeRateForm;

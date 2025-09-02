import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./FormItem";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { SearchableSelect } from "./SearchableSelect";
import { useAllCountries, useAllCurrencies } from "../hooks";
import type {
  CreateCorridorRequest,
  UpdateCorridorRequest,
  Corridor,
} from "../types/CorridorsTypes";
import type { Country } from "../types/CountriesTypes";
import type { Currency } from "../types/CurrenciesTypes";

interface CorridorFormProps {
  initialData?: Corridor;
  onSubmit: (data: CreateCorridorRequest | UpdateCorridorRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const CorridorForm: React.FC<CorridorFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const { data: countriesData } = useAllCountries();
  const { data: currenciesData } = useAllCurrencies();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCorridorRequest>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          base_country_id: initialData.base_country?.id || "",
          destination_country_id: initialData.destination_country?.id || "",
          base_currency_id: initialData.base_currency?.id || "",
          organisation_id: initialData.organisation_id,
          status: initialData.status,
        }
      : {
          name: "",
          description: "",
          base_country_id: "",
          destination_country_id: "",
          base_currency_id: "",
          organisation_id: "",
          status: "ACTIVE",
        },
  });

  const handleFormSubmit = (data: CreateCorridorRequest) => {
    onSubmit(data);
  };
  console.log("countriesData", countriesData);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormItem
          label="Name"
          required
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter corridor name"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Status"
          required
          invalid={!!errors.status}
          errorMessage={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <Select {...field} disabled={isLoading}>
                <option value="">Select status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="BLOCKED">Blocked</option>
              </Select>
            )}
          />
        </FormItem>

        <FormItem
          label="Base Country"
          required
          invalid={!!errors.base_country_id}
          errorMessage={errors.base_country_id?.message}
        >
          <Controller
            name="base_country_id"
            control={control}
            rules={{ required: "Base country is required" }}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={
                  countriesData?.data?.countries?.map((country: Country) => ({
                    value: country.id,
                    label: country.name,
                  })) || []
                }
                placeholder="Select base country"
                searchPlaceholder="Search countries..."
                disabled={isLoading}
                invalid={!!errors.base_country_id}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Destination Country"
          required
          invalid={!!errors.destination_country_id}
          errorMessage={errors.destination_country_id?.message}
        >
          <Controller
            name="destination_country_id"
            control={control}
            rules={{ required: "Destination country is required" }}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={
                  countriesData?.data?.countries?.map((country: Country) => ({
                    value: country.id,
                    label: country.name,
                  })) || []
                }
                placeholder="Select destination country"
                searchPlaceholder="Search countries..."
                disabled={isLoading}
                invalid={!!errors.destination_country_id}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Base Currency"
          required
          invalid={!!errors.base_currency_id}
          errorMessage={errors.base_currency_id?.message}
        >
          <Controller
            name="base_currency_id"
            control={control}
            rules={{ required: "Base currency is required" }}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={
                  currenciesData?.data?.map((currency: Currency) => ({
                    value: currency.id,
                    label: `${currency.currency_code} - ${currency.currency_name}`,
                  })) || []
                }
                placeholder="Select base currency"
                searchPlaceholder="Search currencies..."
                disabled={isLoading}
                invalid={!!errors.base_currency_id}
              />
            )}
          />
        </FormItem>

        {/* Hidden organisation_id field */}
        <Controller
          name="organisation_id"
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
      </div>

      <FormItem
        label="Description"
        required
        invalid={!!errors.description}
        errorMessage={errors.description?.message}
      >
        <Controller
          name="description"
          control={control}
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Enter corridor description"
              rows={3}
              disabled={isLoading}
            />
          )}
        />
      </FormItem>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Saving..."
            : isEdit
            ? "Update Corridor"
            : "Create Corridor"}
        </button>
      </div>
    </form>
  );
};

export default CorridorForm;

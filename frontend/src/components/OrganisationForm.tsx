import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  useCreateOrganisation,
  useUpdateOrganisation,
  useOrganisation,
  useAllCurrencies,
  useAllCountries,
} from "../hooks";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { SearchableSelect } from "./ui/SearchableSelect";
import type {
  UpdateOrganisationRequest,
  OrganisationType,
  IntegrationMode,
} from "../types/OrganisationsTypes";
import type { Country } from "../types/CountriesTypes";

interface OrganisationFormProps {
  organisationId?: string;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface OrganisationFormData {
  name: string;
  description: string;
  type: OrganisationType;
  integration_mode: IntegrationMode;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_city: string;
  contact_state: string;
  contact_zip: string;
  base_currency_id: string;
  country_id: string;
}

const OrganisationForm: React.FC<OrganisationFormProps> = ({
  organisationId,
  mode,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = mode === "edit";

  // React Query hooks
  const { data: organisationData, isLoading: organisationLoading } =
    useOrganisation(organisationId || "");
  const { data: currenciesData, isLoading: currenciesLoading } =
    useAllCurrencies();
  const { data: countriesData, isLoading: countriesLoading } =
    useAllCountries();
  const createOrganisationMutation = useCreateOrganisation();
  const updateOrganisationMutation = useUpdateOrganisation();

  console.log("countriesData", countriesData);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganisationFormData>({
    defaultValues: {
      name: "",
      description: "",
      type: "PARTNER" as OrganisationType,
      integration_mode: "INTERNAL" as IntegrationMode,
      contact_person: "",
      contact_email: "",
      contact_phone: "",
      contact_address: "",
      contact_city: "",
      contact_state: "",
      contact_zip: "",
      base_currency_id: "",
      country_id: "",
    },
  });

  // Load organisation data for edit mode
  useEffect(() => {
    if (isEditMode && organisationData?.data) {
      const org = organisationData.data;
      reset({
        name: org.name,
        description: org.description || "",
        type: org.type,
        integration_mode: org.integration_mode,
        contact_person: org.contact_person || "",
        contact_email: org.contact_email || "",
        contact_phone: org.contact_phone || "",
        contact_address: org.contact_address || "",
        contact_city: org.contact_city || "",
        contact_state: org.contact_state || "",
        contact_zip: org.contact_zip || "",
        base_currency_id: org.base_currency_id || "",
        country_id: org.country_id || "",
      });
    }
  }, [isEditMode, organisationData, reset]);

  const onSubmit = async (data: OrganisationFormData) => {
    try {
      let response;
      if (isEditMode && organisationId) {
        const updateData: UpdateOrganisationRequest = {
          name: data.name,
          description: data.description,
          type: data.type,
          integration_mode: data.integration_mode,
          contact_person: data.contact_person,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          contact_address: data.contact_address,
          contact_city: data.contact_city,
          contact_state: data.contact_state,
          contact_zip: data.contact_zip,
          base_currency_id: data.base_currency_id,
          country_id: data.country_id,
        };

        response = await updateOrganisationMutation.mutateAsync({
          id: organisationId,
          organisationData: updateData,
        });
      } else {
        response = await createOrganisationMutation.mutateAsync(data);
      }

      console.log(response);

      // Call success callback to close modal and refresh data
      onSuccess?.();
    } catch (error) {
      console.error("Error saving organisation:", error);
    }
  };

  if (isEditMode && organisationLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <FormItem
            label="Organisation Name"
            invalid={Boolean(errors.name)}
            errorMessage={errors.name?.message}
            required
          >
            <Controller
              name="name"
              control={control}
              rules={{ required: "Organisation name is required" }}
              render={({ field }) => (
                <Input
                  type="text"
                  placeholder="Enter organisation name"
                  invalid={Boolean(errors.name)}
                  {...field}
                />
              )}
            />
          </FormItem>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <FormItem label="Description">
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  rows={3}
                  placeholder="Enter organisation description"
                  {...field}
                />
              )}
            />
          </FormItem>
        </div>

        {/* Type */}
        <FormItem
          label="Organisation Type"
          invalid={Boolean(errors.type)}
          errorMessage={errors.type?.message}
          required
        >
          <Controller
            name="type"
            control={control}
            rules={{ required: "Organisation type is required" }}
            render={({ field }) => (
              <Select invalid={Boolean(errors.type)} {...field}>
                <option value="">Select organisation type</option>
                <option value="PARTNER">Partner</option>
                <option value="AGENCY">Agency</option>
              </Select>
            )}
          />
        </FormItem>

        {/* Integration Mode */}
        <FormItem
          label="Integration Mode"
          invalid={Boolean(errors.integration_mode)}
          errorMessage={errors.integration_mode?.message}
          required
        >
          <Controller
            name="integration_mode"
            control={control}
            rules={{ required: "Integration mode is required" }}
            render={({ field }) => (
              <Select invalid={Boolean(errors.integration_mode)} {...field}>
                <option value="">Select integration mode</option>
                <option value="INTERNAL">Internal</option>
                <option value="EXTERNAL">External</option>
              </Select>
            )}
          />
        </FormItem>

        <FormItem label="Contact Person">
          <Controller
            name="contact_person"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="Full name" {...field} />
            )}
          />
        </FormItem>

        {/* Contact Email */}
        <FormItem
          label="Contact Email"
          invalid={Boolean(errors.contact_email)}
          errorMessage={errors.contact_email?.message}
        >
          <Controller
            name="contact_email"
            control={control}
            rules={{
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Contact email is invalid",
              },
            }}
            render={({ field }) => (
              <Input
                type="email"
                placeholder="email@example.com"
                invalid={Boolean(errors.contact_email)}
                {...field}
              />
            )}
          />
        </FormItem>

        {/* Contact Phone */}
        <FormItem label="Contact Phone">
          <Controller
            name="contact_phone"
            control={control}
            render={({ field }) => (
              <Input type="tel" placeholder="+1234567890" {...field} />
            )}
          />
        </FormItem>

        <FormItem label="Contact Address">
          <Controller
            name="contact_address"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="Street address" {...field} />
            )}
          />
        </FormItem>

        {/* City */}
        <FormItem label="City">
          <Controller
            name="contact_city"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="City" {...field} />
            )}
          />
        </FormItem>

        {/* State */}
        <FormItem label="State/Province">
          <Controller
            name="contact_state"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="State/Province" {...field} />
            )}
          />
        </FormItem>

        {/* ZIP Code */}
        <FormItem label="ZIP/Postal Code">
          <Controller
            name="contact_zip"
            control={control}
            render={({ field }) => (
              <Input type="text" placeholder="ZIP/Postal Code" {...field} />
            )}
          />
        </FormItem>

        {/* Base Currency */}
        <FormItem label="Base Currency">
          <Controller
            name="base_currency_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={
                  currenciesData?.data
                    ? currenciesData.data.map((currency) => ({
                        value: currency.id,
                        label: `${currency.currency_name} (${currency.currency_code})`,
                      }))
                    : []
                }
                placeholder="Select a currency"
                searchPlaceholder="Search currencies..."
                loading={currenciesLoading}
                invalid={Boolean(errors.base_currency_id)}
              />
            )}
          />
        </FormItem>

        {/* Country */}
        <FormItem label="Country">
          <Controller
            name="country_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={
                  countriesData?.data
                    ? countriesData.data.countries.map((country: Country) => ({
                        value: country.id,
                        label: `${country.name} (${country.code})`,
                      }))
                    : []
                }
                placeholder="Select a country"
                searchPlaceholder="Search countries..."
                loading={countriesLoading}
                invalid={Boolean(errors.country_id)}
              />
            )}
          />
        </FormItem>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Saving...
            </div>
          ) : isEditMode ? (
            "Update Organisation"
          ) : (
            "Create Organisation"
          )}
        </button>
      </div>
    </form>
  );
};

export default OrganisationForm;

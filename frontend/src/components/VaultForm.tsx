import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { SearchableSelect } from "./ui/SearchableSelect";
import { useOrganisations, useCurrencies, useOrganisation } from "../hooks";
import type {
  CreateVaultRequest,
  UpdateVaultRequest,
  Vault,
} from "../types/VaultsTypes";
import { useSession } from "../hooks";
interface VaultFormProps {
  initialData?: Vault;
  onSubmit: (data: CreateVaultRequest | UpdateVaultRequest) => void;
  isLoading?: boolean;
}

const VaultForm: React.FC<VaultFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = !!initialData;
  const { user: currentUser } = useSession();
  const organisationId = currentUser?.organisation_id;
  const { data: userOrganisationData } = useOrganisation(organisationId || "");
  const userOrganisation = userOrganisationData?.data;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateVaultRequest>({
    defaultValues: {
      name: initialData?.name || "",
      organisation_id:
        initialData?.organisation_id ||
        organisationId ||
        userOrganisation?.id ||
        "",
      currency_id:
        initialData?.currency_id || userOrganisation?.base_currency_id || "",
      opening_balance: 0,
    },
  });
  console.log(initialData);

  // Data for dropdowns
  const { data: organisationsData } = useOrganisations({ limit: 100 });
  const { data: currenciesData } = useCurrencies({ limit: 1000 });

  const organisations = organisationsData?.data?.organisations || [];
  const currencies = currenciesData?.data?.currencies || [];
  const currentOrganisation = organisations.find(
    (org) => org.id === organisationId || userOrganisation?.id
  );
  const currentOrganisationName = currentOrganisation?.name;

  const handleFormSubmit = (data: CreateVaultRequest) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      ) as CreateVaultRequest;
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
          Vault Information
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <FormItem
            label="Vault Name"
            invalid={!!errors.name}
            errorMessage={errors.name?.message}
            required
          >
            <Controller
              name="name"
              control={control}
              rules={{ required: "Vault name is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter vault name"
                  disabled={isLoading}
                  invalid={!!errors.name}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Organisation"
            invalid={!!errors.organisation_id}
            errorMessage={errors.organisation_id?.message}
            required
          >
            <Controller
              name="organisation_id"
              control={control}
              rules={{ required: "Organisation is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  value={currentOrganisationName}
                  placeholder={currentOrganisationName}
                  disabled={true}
                  invalid={!!errors.organisation_id}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Currency"
            invalid={!!errors.currency_id}
            errorMessage={errors.currency_id?.message}
          >
            <Controller
              name="currency_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  {...field}
                  options={currencies.map((currency) => ({
                    value: currency.id,
                    label: `${currency.currency_code} - ${currency.currency_name}`,
                  }))}
                  placeholder="Select currency (optional)"
                  disabled={isLoading}
                  invalid={!!errors.currency_id}
                />
              )}
            />
          </FormItem>

          {!isEdit && (
            <FormItem
              label="Opening Balance"
              invalid={!!errors.opening_balance}
              errorMessage={errors.opening_balance?.message}
            >
              <Controller
                name="opening_balance"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="Enter opening balance"
                    disabled={isLoading}
                    invalid={!!errors.opening_balance}
                  />
                )}
              />
            </FormItem>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? "Saving..." : isEdit ? "Update Vault" : "Create Vault"}
        </button>
      </div>
    </form>
  );
};

export default VaultForm;

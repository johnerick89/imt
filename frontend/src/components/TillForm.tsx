import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { SearchableSelect } from "./ui/SearchableSelect";
import {
  useVaults,
  useCurrencies,
  useOrganisations,
  useSession,
  useOrganisation,
} from "../hooks";
import { TillStatus } from "../types/TillsTypes";
import type {
  CreateTillRequest,
  UpdateTillRequest,
  Till,
} from "../types/TillsTypes";

interface TillFormProps {
  initialData?: Till;
  onSubmit: (data: CreateTillRequest | UpdateTillRequest) => void;
  isLoading?: boolean;
}

const TillForm: React.FC<TillFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = !!initialData;
  const { user } = useSession();
  const currentOrganisationId = user?.organisation_id;
  const { data: userOrganisationData } = useOrganisation(
    currentOrganisationId || ""
  );
  const userOrganisation = userOrganisationData?.data;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTillRequest>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || TillStatus.ACTIVE,
      location: initialData?.location || "",
      vault_id: initialData?.vault_id || "",
      currency_id:
        initialData?.currency_id || userOrganisation?.base_currency_id || "",
      organisation_id:
        initialData?.organisation_id ||
        currentOrganisationId ||
        userOrganisation?.id ||
        "",
      opening_balance: 0,
    },
  });

  // Data for dropdowns
  const { data: vaultsData } = useVaults({ limit: 100 });
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: organisationsData } = useOrganisations({ limit: 100 });

  const vaults = vaultsData?.data?.vaults || [];
  const currencies = currenciesData?.data?.currencies || [];
  const organisations = organisationsData?.data?.organisations || [];
  const currentOrganisation = organisations.find(
    (organisation) => organisation.id === currentOrganisationId
  );

  const organisationName = currentOrganisation?.name || "";

  const statusOptions = [
    { value: TillStatus.ACTIVE, label: "Active" },
    { value: TillStatus.INACTIVE, label: "Inactive" },
    { value: TillStatus.PENDING, label: "Pending" },
    { value: TillStatus.BLOCKED, label: "Blocked" },
  ];

  const handleFormSubmit = (data: CreateTillRequest) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      ) as CreateTillRequest;
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
          Till Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <FormItem
            label="Till Name"
            invalid={!!errors.name}
            errorMessage={errors.name?.message}
            required
          >
            <Controller
              name="name"
              control={control}
              rules={{ required: "Till name is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter till name"
                  disabled={isLoading}
                  invalid={!!errors.name}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Description"
            invalid={!!errors.description}
            errorMessage={errors.description?.message}
            required
          >
            <Controller
              name="description"
              control={control}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Enter till description"
                  disabled={isLoading}
                  invalid={!!errors.description}
                  rows={3}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Status"
            invalid={!!errors.status}
            errorMessage={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  {...field}
                  options={statusOptions}
                  placeholder="Select status"
                  disabled={isLoading}
                  invalid={!!errors.status}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Location"
            invalid={!!errors.location}
            errorMessage={errors.location?.message}
          >
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter till location"
                  disabled={isLoading}
                  invalid={!!errors.location}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Vault"
            invalid={!!errors.vault_id}
            errorMessage={errors.vault_id?.message}
          >
            <Controller
              name="vault_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  {...field}
                  options={vaults.map((vault) => ({
                    value: vault.id,
                    label: vault.name,
                  }))}
                  placeholder="Select vault (optional)"
                  disabled={isLoading}
                  invalid={!!errors.vault_id}
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

          <FormItem
            label="Organisation"
            invalid={!!errors.organisation_id}
            errorMessage={errors.organisation_id?.message}
          >
            <Controller
              name="organisation_id"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={organisationName}
                  placeholder={organisationName}
                  disabled={isLoading}
                  invalid={!!errors.organisation_id}
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
          {isLoading ? "Saving..." : isEdit ? "Update Till" : "Create Till"}
        </button>
      </div>
    </form>
  );
};

export default TillForm;

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { SearchableSelect } from "./ui/SearchableSelect";
import { useCurrencies, useOrganisations, useBankAccounts } from "../hooks";
import type {
  CreateGlAccountRequest,
  UpdateGlAccountRequest,
  GlAccount,
} from "../types/GlAccountsTypes";

interface GlAccountFormProps {
  initialData?: GlAccount;
  onSubmit: (data: CreateGlAccountRequest | UpdateGlAccountRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const GlAccountForm: React.FC<GlAccountFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: organisationsData } = useOrganisations({ limit: 1000 });
  const { data: bankAccountsData } = useBankAccounts({ limit: 1000 });

  const currencies = currenciesData?.data?.currencies || [];
  const organisations = organisationsData?.data?.organisations || [];
  const bankAccounts = bankAccountsData?.data?.bankAccounts || [];

  const accountTypes = [
    { value: "ASSET", label: "Asset" },
    { value: "LIABILITY", label: "Liability" },
    { value: "EQUITY", label: "Equity" },
    { value: "REVENUE", label: "Revenue" },
    { value: "EXPENSE", label: "Expense" },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGlAccountRequest>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          balance: initialData.balance || 0,
          currency_id: initialData.currency_id || "",
          locked_balance: initialData.locked_balance || 0,
          max_balance: initialData.max_balance || 0,
          min_balance: initialData.min_balance || 0,
          organisation_id: initialData.organisation_id || "",
          bank_account_id: initialData.bank_account_id || "",
        }
      : {
          name: "",
          type: "ASSET",
          balance: 0,
          currency_id: "",
          locked_balance: 0,
          max_balance: 0,
          min_balance: 0,
          organisation_id: "",
          bank_account_id: "",
        },
  });

  const handleFormSubmit = (data: CreateGlAccountRequest) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormItem
          label="Account Name"
          required
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: "Account name is required" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter account name"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Account Type"
          required
          invalid={!!errors.type}
          errorMessage={errors.type?.message}
        >
          <Controller
            name="type"
            control={control}
            rules={{ required: "Account type is required" }}
            render={({ field }) => (
              <Select {...field} disabled={isLoading} invalid={!!errors.type}>
                <option value="">Select account type</option>
                {accountTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
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
                placeholder="Select currency"
                disabled={isLoading}
                invalid={!!errors.currency_id}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Organisation"
          invalid={!!errors.organisation_id}
          errorMessage={errors.organisation_id?.message}
        >
          <Controller
            name="organisation_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                options={organisations.map((org) => ({
                  value: org.id,
                  label: `${org.name} (${org.type})`,
                }))}
                placeholder="Select organisation"
                disabled={isLoading}
                invalid={!!errors.organisation_id}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Bank Account"
          invalid={!!errors.bank_account_id}
          errorMessage={errors.bank_account_id?.message}
        >
          <Controller
            name="bank_account_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                options={bankAccounts.map((account) => ({
                  value: account.id,
                  label: `${account.name} - ${account.bank_name}`,
                }))}
                placeholder="Select bank account (optional)"
                disabled={isLoading}
                invalid={!!errors.bank_account_id}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Initial Balance"
          invalid={!!errors.balance}
          errorMessage={errors.balance?.message}
        >
          <Controller
            name="balance"
            control={control}
            rules={{
              min: { value: 0, message: "Balance must be non-negative" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter initial balance"
                disabled={isLoading}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Locked Balance"
          invalid={!!errors.locked_balance}
          errorMessage={errors.locked_balance?.message}
        >
          <Controller
            name="locked_balance"
            control={control}
            rules={{
              min: { value: 0, message: "Locked balance must be non-negative" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter locked balance"
                disabled={isLoading}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Max Balance"
          invalid={!!errors.max_balance}
          errorMessage={errors.max_balance?.message}
        >
          <Controller
            name="max_balance"
            control={control}
            rules={{
              min: { value: 0, message: "Max balance must be non-negative" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter max balance"
                disabled={isLoading}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Min Balance"
          invalid={!!errors.min_balance}
          errorMessage={errors.min_balance?.message}
        >
          <Controller
            name="min_balance"
            control={control}
            rules={{
              min: { value: 0, message: "Min balance must be non-negative" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter min balance"
                disabled={isLoading}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
              />
            )}
          />
        </FormItem>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Saving..."
            : isEdit
            ? "Update GL Account"
            : "Create GL Account"}
        </button>
      </div>
    </form>
  );
};

export default GlAccountForm;

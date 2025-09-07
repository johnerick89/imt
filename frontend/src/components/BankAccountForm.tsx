import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./FormItem";
import { Input } from "./Input";
import { SearchableSelect } from "./SearchableSelect";
import { useCurrencies, useOrganisations, useSession } from "../hooks";
import type {
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  BankAccount,
} from "../types/BankAccountsTypes";

interface BankAccountFormProps {
  initialData?: BankAccount;
  onSubmit: (data: CreateBankAccountRequest | UpdateBankAccountRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: organisationsData } = useOrganisations({ limit: 1000 });
  const { user } = useSession();
  const organisationId = user?.organisation_id;

  const currencies = currenciesData?.data?.currencies || [];
  const organisations = organisationsData?.data?.organisations || [];
  const organisationName = organisations.find(
    (org) => org.id === organisationId
  )?.name;
  console.log(
    "organisationId",
    organisationId,
    user,
    "organisationName",
    organisationName
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBankAccountRequest>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          account_number: initialData.account_number,
          bank_name: initialData.bank_name,
          swift_code: initialData.swift_code || "",
          currency_id: initialData.currency_id,
          organisation_id: initialData.organisation_id || organisationId || "",
          balance: initialData.balance,
          locked_balance: initialData.locked_balance || 0,
        }
      : {
          name: "",
          account_number: "",
          bank_name: "",
          swift_code: "",
          currency_id: "",
          organisation_id: organisationId || "",
          balance: 0,
          locked_balance: 0,
        },
  });

  const handleFormSubmit = (data: CreateBankAccountRequest) => {
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
          label="Account Number"
          required
          invalid={!!errors.account_number}
          errorMessage={errors.account_number?.message}
        >
          <Controller
            name="account_number"
            control={control}
            rules={{ required: "Account number is required" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter account number"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Bank Name"
          required
          invalid={!!errors.bank_name}
          errorMessage={errors.bank_name?.message}
        >
          <Controller
            name="bank_name"
            control={control}
            rules={{ required: "Bank name is required" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter bank name"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="SWIFT Code"
          invalid={!!errors.swift_code}
          errorMessage={errors.swift_code?.message}
        >
          <Controller
            name="swift_code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter SWIFT code"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Currency"
          required
          invalid={!!errors.currency_id}
          errorMessage={errors.currency_id?.message}
        >
          <Controller
            name="currency_id"
            control={control}
            rules={{ required: "Currency is required" }}
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
              <input
                {...field}
                value={organisationName}
                placeholder={organisationName || "Select organisation"}
                disabled={isLoading}
                readOnly
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Initial Balance"
          required
          invalid={!!errors.balance}
          errorMessage={errors.balance?.message}
        >
          <Controller
            name="balance"
            control={control}
            rules={{
              required: "Initial balance is required",
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
            ? "Update Bank Account"
            : "Create Bank Account"}
        </button>
      </div>
    </form>
  );
};

export default BankAccountForm;

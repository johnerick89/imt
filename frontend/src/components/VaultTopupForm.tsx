import React from "react";
import { useForm } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useBankAccounts } from "../hooks";
import type { VaultTopupRequest } from "../types/BalanceOperationsTypes";

interface VaultTopupFormProps {
  onSubmit: (data: VaultTopupRequest) => void;
  isLoading?: boolean;
  operation: "topup" | "withdraw";
  vaultCurrencyId?: string;
  onSuccess?: () => void;
}

export const VaultTopupForm: React.FC<VaultTopupFormProps> = ({
  onSubmit,
  isLoading = false,
  operation,
  vaultCurrencyId,
  onSuccess,
}) => {
  const { data: bankAccountsData } = useBankAccounts({ limit: 100 });
  const allBankAccounts = bankAccountsData?.data?.bankAccounts || [];

  // Filter bank accounts by currency_id matching vault's currency_id
  const bankAccounts = vaultCurrencyId
    ? allBankAccounts.filter(
        (account) => account.currency_id === vaultCurrencyId
      )
    : allBankAccounts;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VaultTopupRequest>({
    defaultValues: {
      amount: 0,
      description: "",
      source_id: "",
    },
  });

  const handleFormSubmit = (data: VaultTopupRequest) => {
    onSubmit(data);
    // Reset form after successful submission
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormItem
        label={
          operation === "topup"
            ? "Source Bank Account"
            : "Destination Bank Account"
        }
        invalid={!!errors.source_id}
        errorMessage={errors.source_id?.message}
        required
      >
        <select
          {...register("source_id", {
            required: `${
              operation === "topup" ? "Source" : "Destination"
            } bank account is required`,
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">
            {bankAccounts.length === 0
              ? "No bank accounts available with matching currency"
              : "Select a bank account"}
          </option>
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.account_number} -{" "}
              {account.currency?.currency_code || "No Currency"}
            </option>
          ))}
        </select>
      </FormItem>

      <FormItem
        label="Amount"
        invalid={!!errors.amount}
        errorMessage={errors.amount?.message}
        required
      >
        <Input
          type="number"
          step="0.01"
          min="0"
          {...register("amount", {
            required: "Amount is required",
            min: {
              value: 0.01,
              message: "Amount must be greater than 0",
            },
          })}
          placeholder="Enter amount"
        />
      </FormItem>

      <FormItem
        label="Description"
        invalid={!!errors.description}
        errorMessage={errors.description?.message}
      >
        <Textarea
          {...register("description")}
          placeholder={`Enter description for ${operation} operation`}
          rows={3}
        />
      </FormItem>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading
            ? "Processing..."
            : `${operation === "topup" ? "Topup" : "Withdraw"} Vault`}
        </Button>
      </div>
    </form>
  );
};

export default VaultTopupForm;

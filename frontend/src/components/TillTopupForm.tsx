import React from "react";
import { useForm } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useVaults } from "../hooks";
import type { TillTopupRequest } from "../types/BalanceOperationsTypes";

interface TillTopupFormProps {
  onSubmit: (data: TillTopupRequest) => void;
  isLoading?: boolean;
  operation: "topup" | "withdraw";
  tillCurrencyId?: string;
}

export const TillTopupForm: React.FC<TillTopupFormProps> = ({
  onSubmit,
  isLoading = false,
  operation,
  tillCurrencyId,
}) => {
  const { data: vaultsData } = useVaults({ limit: 100 });
  const allVaults = vaultsData?.data?.vaults || [];

  // Filter vaults by currency_id matching till's currency_id
  const vaults = tillCurrencyId
    ? allVaults.filter((vault) => vault.currency_id === tillCurrencyId)
    : allVaults;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TillTopupRequest>({
    defaultValues: {
      amount: 0,
      description: "",
      source_id: "",
    },
  });

  const handleFormSubmit = (data: TillTopupRequest) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormItem
        label={operation === "topup" ? "Source Vault" : "Destination Vault"}
        invalid={!!errors.source_id}
        errorMessage={errors.source_id?.message}
        required
      >
        <select
          {...register("source_id", {
            required: `${
              operation === "topup" ? "Source" : "Destination"
            } vault is required`,
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">
            {vaults.length === 0
              ? "No vaults available with matching currency"
              : "Select a vault"}
          </option>
          {vaults.map((vault) => (
            <option key={vault.id} value={vault.id}>
              {vault.name} - {vault.currency?.currency_code || "No Currency"}
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
            : `${operation === "topup" ? "Topup" : "Withdraw"} Till`}
        </Button>
      </div>
    </form>
  );
};

export default TillTopupForm;

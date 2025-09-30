import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "../ui/Modal";
import { SearchableSelect } from "../ui/SearchableSelect";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { FormItem } from "../ui/FormItem";
import type { PrefundRequest } from "../../types/BalanceOperationsTypes";
import type { BankAccount } from "../../types/BankAccountsTypes";
import type { Currency } from "../../types/CurrenciesTypes";

interface PrefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrefundRequest) => void;
  isLoading?: boolean;
  bankAccounts: BankAccount[];
  currencies: Currency[];
  defaultCurrencyId?: string;
  balanceExists?: boolean;
}

const PrefundModal: React.FC<PrefundModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  bankAccounts,
  currencies,
  defaultCurrencyId,
  balanceExists = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrefundRequest>({
    defaultValues: {
      amount: 0,
      source_type: "BANK_ACCOUNT",
      source_id: "",
      currency_id: defaultCurrencyId || "",
      description: "",
    },
  });

  const handleFormSubmit = (data: PrefundRequest) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Prefund Organisation"
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormItem
          label="Amount"
          required
          invalid={!!errors.amount}
          errorMessage={errors.amount?.message}
        >
          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be greater than 0" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter amount"
                disabled={isLoading}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || "")
                }
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
                disabled={isLoading || balanceExists}
                invalid={!!errors.currency_id}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Source Bank Account"
          required
          invalid={!!errors.source_id}
          errorMessage={errors.source_id?.message}
        >
          <Controller
            name="source_id"
            control={control}
            rules={{ required: "Source bank account is required" }}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                options={bankAccounts.map((account) => ({
                  value: account.id,
                  label: `${account.name} - ${account.bank_name} (${account.currency.currency_code})`,
                }))}
                placeholder="Select source bank account"
                disabled={isLoading}
                invalid={!!errors.source_id}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Description"
          invalid={!!errors.description}
          errorMessage={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Enter description (optional)"
                rows={3}
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Prefund"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PrefundModal;

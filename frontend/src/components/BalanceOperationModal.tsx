import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "./Modal";
import { FormItem } from "./FormItem";
import { Input } from "./Input";
import { SearchableSelect } from "./SearchableSelect";
import { Textarea } from "./Textarea";
import { useVaults, useBankAccounts } from "../hooks";
import type {
  TopupRequest,
  WithdrawalRequest,
} from "../types/BankAccountsTypes";

interface BalanceOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TopupRequest | WithdrawalRequest) => void;
  isLoading?: boolean;
  operationType: "topup" | "withdrawal";
  title: string;
  sourceType?: "BANK_ACCOUNT" | "VAULT";
  destinationType?: "BANK_ACCOUNT" | "VAULT";
}

const BalanceOperationModal: React.FC<BalanceOperationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  operationType,
  title,
  sourceType,
  destinationType,
}) => {
  const { data: vaultsData } = useVaults({ limit: 1000 });
  const { data: bankAccountsData } = useBankAccounts({ limit: 1000 });

  const vaults = vaultsData?.data?.vaults || [];
  const bankAccounts = bankAccountsData?.data?.bankAccounts || [];

  const [selectedSourceType, setSelectedSourceType] = useState<
    "BANK_ACCOUNT" | "VAULT"
  >(sourceType || "BANK_ACCOUNT");
  const [selectedDestinationType, setSelectedDestinationType] = useState<
    "BANK_ACCOUNT" | "VAULT"
  >(destinationType || "BANK_ACCOUNT");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopupRequest | WithdrawalRequest>({
    defaultValues: {
      amount: 0,
      source_type: sourceType || "BANK_ACCOUNT",
      source_id: "",
      destination_type: destinationType || "BANK_ACCOUNT",
      destination_id: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: TopupRequest | WithdrawalRequest) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const sourceOptions =
    selectedSourceType === "BANK_ACCOUNT"
      ? bankAccounts.map((account) => ({
          value: account.id,
          label: `${account.name} - ${account.bank_name} (${account.currency.currency_code})`,
        }))
      : vaults.map((vault) => ({
          value: vault.id,
          label: `${vault.name} (${vault.currency?.currency_code || "N/A"})`,
        }));

  const destinationOptions =
    selectedDestinationType === "BANK_ACCOUNT"
      ? bankAccounts.map((account) => ({
          value: account.id,
          label: `${account.name} - ${account.bank_name} (${account.currency.currency_code})`,
        }))
      : vaults.map((vault) => ({
          value: vault.id,
          label: `${vault.name} (${vault.currency?.currency_code || "N/A"})`,
        }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
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
                  field.onChange(parseFloat(e.target.value) || 0)
                }
              />
            )}
          />
        </FormItem>

        {operationType === "topup" && (
          <>
            <FormItem label="Source Type" required>
              <select
                value={selectedSourceType}
                onChange={(e) =>
                  setSelectedSourceType(
                    e.target.value as "BANK_ACCOUNT" | "VAULT"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="BANK_ACCOUNT">Bank Account</option>
                <option value="VAULT">Vault</option>
              </select>
            </FormItem>

            <FormItem
              label="Source"
              required
              invalid={!!errors.source_id}
              errorMessage={errors.source_id?.message}
            >
              <Controller
                name="source_id"
                control={control}
                rules={{ required: "Source is required" }}
                render={({ field }) => (
                  <SearchableSelect
                    {...field}
                    options={sourceOptions}
                    placeholder="Select source"
                    disabled={isLoading}
                    invalid={!!errors.source_id}
                  />
                )}
              />
            </FormItem>
          </>
        )}

        {operationType === "withdrawal" && (
          <>
            <FormItem label="Destination Type" required>
              <select
                value={selectedDestinationType}
                onChange={(e) =>
                  setSelectedDestinationType(
                    e.target.value as "BANK_ACCOUNT" | "VAULT"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="BANK_ACCOUNT">Bank Account</option>
                <option value="VAULT">Vault</option>
              </select>
            </FormItem>

            <FormItem
              label="Destination"
              required
              invalid={!!errors.destination_id}
              errorMessage={errors.destination_id?.message}
            >
              <Controller
                name="destination_id"
                control={control}
                rules={{ required: "Destination is required" }}
                render={({ field }) => (
                  <SearchableSelect
                    {...field}
                    options={destinationOptions}
                    placeholder="Select destination"
                    disabled={isLoading}
                    invalid={!!errors.destination_id}
                  />
                )}
              />
            </FormItem>
          </>
        )}

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
            {isLoading
              ? "Processing..."
              : operationType === "topup"
              ? "Top Up"
              : "Withdraw"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BalanceOperationModal;

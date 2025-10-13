import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "../ui/Modal";
import { SearchableSelect } from "../ui/SearchableSelect";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { FormItem } from "../ui/FormItem";
import type { AgencyFloatRequest } from "../../types/BalanceOperationsTypes";
import type { BankAccount } from "../../types/BankAccountsTypes";
import type { Organisation } from "../../types/OrganisationsTypes";

interface AgencyFloatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgencyFloatRequest) => void;
  isLoading?: boolean;
  bankAccounts: BankAccount[];
  agencies: Organisation[];
}

const AgencyFloatModal: React.FC<AgencyFloatModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  bankAccounts,
  agencies,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgencyFloatRequest>({
    defaultValues: {
      amount: 0,
      dest_org_id: "",
      currency_id: "",
      bank_account_id: "",
      description: "",
    },
  });

  const selectedAgencyId = watch("dest_org_id");
  const selectedAgency = agencies.find((org) => org.id === selectedAgencyId);

  // Auto-select currency when agency is selected
  useEffect(() => {
    if (selectedAgency?.base_currency_id) {
      setValue("currency_id", selectedAgency.base_currency_id);
    }
  }, [selectedAgency, setValue]);

  const handleFormSubmit = (data: AgencyFloatRequest) => {
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
      title="Add Agency Float Balance"
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormItem
          label="Agency/Partner"
          required
          invalid={!!errors.dest_org_id}
          errorMessage={errors.dest_org_id?.message}
        >
          <Controller
            name="dest_org_id"
            control={control}
            rules={{ required: "Agency is required" }}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                options={agencies.map((agency) => ({
                  value: agency.id,
                  label: `${agency.name} (${agency.type})`,
                }))}
                placeholder="Select agency/partner"
                disabled={isLoading}
                invalid={!!errors.dest_org_id}
              />
            )}
          />
        </FormItem>

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
              <Input
                {...field}
                value={
                  selectedAgency?.base_currency?.currency_code || field.value
                }
                placeholder="Currency (auto-selected from agency)"
                disabled={true}
                readOnly
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Deposit to Bank Account (Optional)"
          invalid={!!errors.bank_account_id}
          errorMessage={errors.bank_account_id?.message}
        >
          <Controller
            name="bank_account_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                options={[
                  { value: "", label: "No bank account" },
                  ...bankAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.name} - ${account.bank_name} (${account.currency.currency_code})`,
                  })),
                ]}
                placeholder="Select bank account to deposit (optional)"
                disabled={isLoading}
                invalid={!!errors.bank_account_id}
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
            {isLoading ? "Processing..." : "Add Float"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgencyFloatModal;

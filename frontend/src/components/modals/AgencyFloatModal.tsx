import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "../ui/Modal";
import { SearchableSelect } from "../ui/SearchableSelect";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { FormItem } from "../ui/FormItem";
import type {
  AgencyFloatRequest,
  ReduceFloatRequest,
} from "../../types/BalanceOperationsTypes";
import type { BankAccount } from "../../types/BankAccountsTypes";
import type { Organisation } from "../../types/OrganisationsTypes";

interface AgencyFloatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgencyFloatRequest | ReduceFloatRequest) => void;
  isLoading?: boolean;
  bankAccounts: BankAccount[];
  agencies: Organisation[];
  selectedOrganisationId?: string;
  defaultCurrencyId?: string;
  mode?: "create" | "reduce" | "edit";
  title?: string;
  existingBalance?: {
    agency: Organisation;
    currency: { id: string; currency_code: string; currency_name: string };
  };
}

const AgencyFloatModal: React.FC<AgencyFloatModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  bankAccounts,
  agencies,
  selectedOrganisationId,
  defaultCurrencyId,
  mode = "create",
  title,
  existingBalance,
}) => {
  console.log(
    "defaultCurrencyId",
    defaultCurrencyId,
    "existingBalance",
    existingBalance
  );
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<AgencyFloatRequest>({
    defaultValues: {
      amount: 0,
      dest_org_id:
        mode === "edit" && existingBalance
          ? existingBalance.agency.id
          : selectedOrganisationId || "",
      currency_id:
        mode === "edit" && existingBalance
          ? existingBalance.currency.id
          : defaultCurrencyId || "",
      bank_account_id: "",
      limit: 0,
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

  const handleFormSubmit = (data: AgencyFloatRequest | ReduceFloatRequest) => {
    if (existingBalance) {
      data.currency_id = existingBalance.currency.id;
      data.dest_org_id = existingBalance.agency.id;
    }
    if (!data.dest_org_id) {
      data.dest_org_id = selectedOrganisationId || "";
    }
    console.log("data...1", data);
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
      title={
        title ||
        (mode === "reduce"
          ? "Reduce Agency Float"
          : mode === "edit"
          ? "Topup Agency Float"
          : "Add Agency Float Balance")
      }
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {(mode === "create" || mode === "edit") && (
          <FormItem
            label="Agency/Partner"
            required
            invalid={!!errors.dest_org_id}
            errorMessage={errors.dest_org_id?.message as string}
          >
            {mode === "edit" && existingBalance ? (
              <Input
                value={`${existingBalance.agency.name} (${existingBalance.agency.type})`}
                disabled={true}
                readOnly
                className="bg-gray-50"
              />
            ) : (
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
            )}
          </FormItem>
        )}

        {/* Hidden fields for reduce mode */}
        {mode === "reduce" && (
          <>
            <input type="hidden" {...register("dest_org_id")} />
            <input type="hidden" {...register("currency_id")} />
          </>
        )}

        <FormItem
          label="Amount"
          required
          invalid={!!errors.amount}
          errorMessage={errors.amount?.message as string}
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

        {/* {(mode == "create" || mode === "edit") && (
          <FormItem
            label="Currency"
            required
            invalid={!!errors.currency_id}
            errorMessage={errors.currency_id?.message as string}
          >
            <Controller
              name="currency_id"
              control={control}
              rules={{ required: "Currency is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  value={
                    mode === "edit" && existingBalance
                      ? existingBalance.currency.currency_code
                      : selectedAgency?.base_currency?.currency_code ||
                        field.value
                  }
                  placeholder="Currency (auto-selected from agency)"
                  disabled={true}
                  readOnly
                  className="bg-gray-50"
                />
              )}
            />
          </FormItem>
        )} */}

        <FormItem
          label="Deposit to Bank Account (Optional)"
          invalid={!!errors.bank_account_id}
          errorMessage={errors.bank_account_id?.message as string}
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

        {mode === "create" && (
          <FormItem
            label="Float Limit (Optional)"
            invalid={!!errors.limit}
            errorMessage={errors.limit?.message as string}
          >
            <Controller
              name="limit"
              control={control}
              rules={{
                min: { value: 0, message: "Limit must be non-negative" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="Enter float limit (optional)"
                  disabled={isLoading}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              )}
            />
          </FormItem>
        )}

        <FormItem
          label="Description"
          invalid={!!errors.description}
          errorMessage={errors.description?.message as string}
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
              : mode === "reduce"
              ? "Reduce Float"
              : mode === "edit"
              ? "Topup Float"
              : "Add Float"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgencyFloatModal;

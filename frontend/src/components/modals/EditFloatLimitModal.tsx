import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { FormItem } from "../ui/FormItem";
import type { OrgBalance } from "../../types/BalanceOperationsTypes";

interface EditFloatLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (balance: OrgBalance) => void;
  balance: OrgBalance;
  isLoading?: boolean;
}

interface EditFloatLimitForm {
  limit: number;
}

const EditFloatLimitModal: React.FC<EditFloatLimitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  balance,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFloatLimitForm>({
    defaultValues: {
      limit: balance.limit || 0,
    },
  });

  const handleFormSubmit = (data: EditFloatLimitForm) => {
    const updatedBalance = {
      ...balance,
      limit: data.limit,
    };
    onSubmit(updatedBalance);
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
      title="Edit Float Limit"
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">
            Balance Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Agency:</span>
              <p className="font-medium">{balance.dest_org.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Currency:</span>
              <p className="font-medium">{balance.currency.currency_code}</p>
            </div>
            <div>
              <span className="text-gray-600">Current Balance:</span>
              <p className="font-medium">
                {balance.balance} {balance.currency.currency_code}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Current Limit:</span>
              <p className="font-medium">
                {balance.limit || 0} {balance.currency.currency_code}
              </p>
            </div>
          </div>
        </div>

        <FormItem
          label="New Float Limit"
          required
          invalid={!!errors.limit}
          errorMessage={errors.limit?.message}
        >
          <Controller
            name="limit"
            control={control}
            rules={{
              required: "Limit is required",
              min: { value: 0, message: "Limit must be non-negative" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter new float limit"
                disabled={isLoading}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
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
            {isLoading ? "Updating..." : "Update Limit"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFloatLimitModal;

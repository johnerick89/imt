import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { SearchableSelect } from "./ui/SearchableSelect";
import { Textarea } from "./ui/Textarea";
import { InboundTransactionService } from "../services/InboundTransactionService";
import type {
  Transaction,
  UpdateInboundTransactionReceiverDetailsRequest,
  IndividualIDType,
} from "../types/TransactionsTypes";

interface UpdateReceiverDetailsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTransaction: Transaction) => void;
  transaction: Transaction | null;
}

const ID_TYPE_OPTIONS = [
  { value: "PASSPORT", label: "Passport" },
  { value: "NATIONAL_ID", label: "National ID" },
  { value: "DRIVERS_LICENSE", label: "Driver's License" },
  { value: "OTHER", label: "Other" },
];

export const UpdateReceiverDetailsForm: React.FC<
  UpdateReceiverDetailsFormProps
> = ({ isOpen, onClose, onSuccess, transaction }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateInboundTransactionReceiverDetailsRequest>();

  const watchedIdType = watch("id_type");

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction && isOpen) {
      const receiverParty = transaction.receiver_trasaction_party;
      if (receiverParty) {
        reset({
          id_type: receiverParty.id_type as IndividualIDType,
          id_number: receiverParty.id_number || "",
          email: (receiverParty.metadata as any)?.email || "",
          phone:
            (receiverParty.metadata as any)?.phone ||
            receiverParty.payout_phone ||
            "",
          address: (receiverParty.metadata as any)?.address || "",
        });
      }
    }
  }, [transaction, isOpen, reset]);

  const onSubmit = async (
    data: UpdateInboundTransactionReceiverDetailsRequest
  ) => {
    if (!transaction) return;

    setIsLoading(true);
    setError(null);

    try {
      const service = InboundTransactionService.getInstance();
      const response = await service.updateReceiverDetails(
        transaction.id,
        data
      );

      onSuccess(response.data);
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to update receiver details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Receiver Details"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Type *
            </label>
            <SearchableSelect
              options={ID_TYPE_OPTIONS}
              value={watchedIdType}
              onChange={(value) =>
                setValue("id_type", value as IndividualIDType)
              }
              placeholder="Select ID type"
            />
            {errors.id_type && (
              <p className="text-red-500 text-xs mt-1">
                {errors.id_type.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Number *
            </label>
            <Input
              {...register("id_number", { required: "ID number is required" })}
              placeholder="Enter ID number"
            />
            {errors.id_number && (
              <p className="text-red-500 text-xs mt-1">
                {errors.id_number.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <Input
              {...register("phone", { required: "Phone is required" })}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <Textarea
            {...register("address", { required: "Address is required" })}
            placeholder="Enter full address"
            rows={3}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Updating..." : "Update Details"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

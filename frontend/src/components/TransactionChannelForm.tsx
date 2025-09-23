import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiX } from "react-icons/fi";
import { Modal } from "./ui/Modal";
import {
  type CreateTransactionChannelRequest,
  type UpdateTransactionChannelRequest,
  type ITransactionChannel,
} from "../types/TransactionChannelsTypes";

interface TransactionChannelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateTransactionChannelRequest | UpdateTransactionChannelRequest
  ) => void;
  channel?: ITransactionChannel | null;
  isLoading?: boolean;
  title?: string;
}

const DIRECTION_OPTIONS = [
  { value: "OUTBOUND", label: "Outbound" },
  { value: "INBOUND", label: "Inbound" },
  { value: "BOTH", label: "Both" },
];

const TransactionChannelForm: React.FC<TransactionChannelFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  channel = null,
  isLoading = false,
  title = "Transaction Channel",
}) => {
  const isEditMode = !!channel;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateTransactionChannelRequest & { directions: string[] }>({
    defaultValues: {
      name: "",
      description: "",
      direction: [],
      directions: [],
    },
  });

  const selectedDirections = watch("directions");

  useEffect(() => {
    if (channel) {
      reset({
        name: channel.name,
        description: channel.description,
        direction: channel.direction,
        directions: channel.direction,
      });
    } else {
      reset({
        name: "",
        description: "",
        direction: [],
        directions: [],
      });
    }
  }, [channel, reset]);

  const handleFormSubmit = (
    data: CreateTransactionChannelRequest & { directions: string[] }
  ) => {
    onSubmit({
      name: data.name,
      description: data.description,
      direction: data.directions,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDirectionChange = (direction: string, checked: boolean) => {
    const currentDirections = selectedDirections || [];
    if (checked) {
      setValue("directions", [...currentDirections, direction]);
    } else {
      setValue(
        "directions",
        currentDirections.filter((d) => d !== direction)
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditMode ? `Edit ${title}` : `Create ${title}`}
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Channel Name *
            </label>
            <input
              type="text"
              id="name"
              {...register("name", {
                required: "Channel name is required",
                maxLength: {
                  value: 255,
                  message: "Name must be less than 255 characters",
                },
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter channel name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description", {
                required: "Description is required",
                maxLength: {
                  value: 1000,
                  message: "Description must be less than 1000 characters",
                },
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter channel description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Directions *
            </label>
            <div className="space-y-2">
              {DIRECTION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedDirections?.includes(option.value) || false
                    }
                    onChange={(e) =>
                      handleDirectionChange(option.value, e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.directions && (
              <p className="mt-1 text-sm text-red-600">
                {errors.directions.message}
              </p>
            )}
            {selectedDirections?.length === 0 && (
              <p className="mt-1 text-sm text-red-600">
                At least one direction must be selected
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedDirections?.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Channel"
                : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TransactionChannelForm;

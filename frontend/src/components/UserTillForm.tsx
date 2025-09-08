import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { SearchableSelect } from "./ui/SearchableSelect";
import { useUsers } from "../hooks";
import { UserTillStatus } from "../types/TillsTypes";
import type {
  CreateUserTillRequest,
  UpdateUserTillRequest,
  UserTill,
} from "../types/TillsTypes";

interface UserTillFormProps {
  initialData?: UserTill;
  tillId?: string;
  onSubmit: (data: CreateUserTillRequest | UpdateUserTillRequest) => void;
  isLoading?: boolean;
}

const UserTillForm: React.FC<UserTillFormProps> = ({
  initialData,
  tillId,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = !!initialData;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserTillRequest>({
    defaultValues: {
      user_id: initialData?.user_id || "",
      till_id: tillId || initialData?.till_id || "",
      date: initialData?.date
        ? new Date(initialData.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      opening_balance: initialData?.opening_balance || 0,
      closing_balance: initialData?.closing_balance || undefined,
      status: initialData?.status || UserTillStatus.OPEN,
    },
  });

  // Data for dropdowns
  const { data: usersData } = useUsers({ limit: 1000 });
  const users = usersData?.data?.users || [];

  const statusOptions = [
    { value: UserTillStatus.OPEN, label: "Open" },
    { value: UserTillStatus.CLOSED, label: "Closed" },
    { value: UserTillStatus.BLOCKED, label: "Blocked" },
  ];

  const handleFormSubmit = (data: CreateUserTillRequest) => {
    try {
      // Convert date to ISO string and numbers
      const formattedData = {
        ...data,
        date: data.date
          ? new Date(data.date).toISOString()
          : new Date().toISOString(),
        opening_balance: Number(data.opening_balance),
        closing_balance: data.closing_balance
          ? Number(data.closing_balance)
          : undefined,
      };
      onSubmit(formattedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          User Till Information
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <FormItem
            label="User"
            invalid={!!errors.user_id}
            errorMessage={errors.user_id?.message}
            required
          >
            <Controller
              name="user_id"
              control={control}
              rules={{ required: "User is required" }}
              render={({ field }) => (
                <SearchableSelect
                  {...field}
                  options={users.map((user) => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name}`,
                  }))}
                  placeholder="Select user"
                  disabled={isLoading}
                  invalid={!!errors.user_id}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Date"
            invalid={!!errors.date}
            errorMessage={errors.date?.message}
            required
          >
            <Controller
              name="date"
              control={control}
              rules={{ required: "Date is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  disabled={isLoading}
                  invalid={!!errors.date}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Opening Balance"
            invalid={!!errors.opening_balance}
            errorMessage={errors.opening_balance?.message}
            required
          >
            <Controller
              name="opening_balance"
              control={control}
              rules={{
                required: "Opening balance is required",
                min: { value: 0, message: "Opening balance must be positive" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isLoading}
                  invalid={!!errors.opening_balance}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Closing Balance"
            invalid={!!errors.closing_balance}
            errorMessage={errors.closing_balance?.message}
          >
            <Controller
              name="closing_balance"
              control={control}
              rules={{
                min: { value: 0, message: "Closing balance must be positive" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="0.00 (optional)"
                  disabled={isLoading}
                  invalid={!!errors.closing_balance}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Status"
            invalid={!!errors.status}
            errorMessage={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  {...field}
                  options={statusOptions}
                  placeholder="Select status"
                  disabled={isLoading}
                  invalid={!!errors.status}
                />
              )}
            />
          </FormItem>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading
            ? "Saving..."
            : isEdit
            ? "Update User Till"
            : "Create User Till"}
        </button>
      </div>
    </form>
  );
};

export default UserTillForm;

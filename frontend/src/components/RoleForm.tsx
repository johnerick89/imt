import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./FormItem";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  Role,
} from "../types/RolesTypes";

interface RoleFormProps {
  initialData?: Role;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
  isLoading?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const isEdit = !!initialData;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleRequest>({
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const handleFormSubmit = (data: CreateRoleRequest) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      ) as CreateRoleRequest;
      onSubmit(cleanedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Role Information
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <FormItem
            label="Role Name"
            invalid={!!errors.name}
            errorMessage={errors.name?.message}
            required
          >
            <Controller
              name="name"
              control={control}
              rules={{ required: "Role name is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter role name"
                  disabled={isLoading}
                  invalid={!!errors.name}
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
                  placeholder="Enter role description"
                  disabled={isLoading}
                  invalid={!!errors.description}
                  rows={3}
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
          {isLoading ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;

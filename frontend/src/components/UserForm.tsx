import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useCreateUser, useUpdateUser, useUser } from "../hooks";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import type { UpdateUserRequest } from "../types/UsersTypes";
import { useRoles, useSession } from "../hooks";
import { useToast } from "../contexts/ToastContext";

interface UserFormProps {
  userId?: string;
  mode: "create" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
  myAccount?: boolean;
}

interface UserFormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  role_id: string;
  phone: string;
  address: string;
  organisation_id: string;
}

const UserForm: React.FC<UserFormProps> = ({
  userId,
  mode,
  onSuccess,
  onCancel,
  myAccount = false,
}) => {
  const isEditMode = mode === "edit";
  const { user } = useSession();
  const organisationId = user?.organisation_id;
  const { showToast } = useToast();
  // React Query hooks
  const { data: userData, isLoading: userLoading } = useUser(userId || "");
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<UserFormData>({
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "",
      role_id: "",
      phone: "",
      address: "",
      organisation_id: organisationId || "",
    },
  });

  const roleId = watch("role_id");
  useEffect(() => {
    if (roleId) {
      setValue(
        "role",
        rolesData?.data?.roles.find((role) => role.id === roleId)?.name || ""
      );
    }
  }, [roleId, rolesData, setValue]);

  // Load user data for edit mode
  useEffect(() => {
    if (isEditMode && userData?.data) {
      const user = userData.data;
      reset({
        email: user.email,
        password: "", // Don't populate password in edit mode
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        role_id: user.role_id,
        phone: user.phone || "",
        address: user.address || "",
        organisation_id: user.organisation_id || organisationId || "",
      });
    }
  }, [isEditMode, userData, reset, organisationId]);

  const onSubmit = async (data: UserFormData) => {
    try {
      let response;
      if (isEditMode && userId) {
        const updateData: UpdateUserRequest = {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role,
          role_id: data.role_id,
          phone: data.phone,
          address: data.address,
          organisation_id: data.organisation_id || organisationId || "",
        };

        // Only include password if it's provided
        if (data.password) {
          updateData.password = data.password;
        }

        response = await updateUserMutation.mutateAsync({
          userId,
          userData: updateData,
        });
      } else {
        response = await createUserMutation.mutateAsync(data);
      }

      if (!response.success) {
        showToast({
          message: response.message,
          type: "error",
          duration: 5000,
          title: "Failed to save user",
        });
        return;
      } else {
        showToast({
          message: response.message,
          type: "success",
          duration: 5000,
          title: "User saved successfully",
        });

        // Call success callback to close modal and refresh data
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error saving user:", error);
      showToast({
        message:
          error instanceof Error
            ? error.message
            : isEditMode
            ? "Failed to update user"
            : "Failed to create user",
        type: "error",
        duration: 5000,
        title: isEditMode ? "Failed to update user" : "Failed to create user",
      });
    }
  };

  if ((isEditMode && userLoading) || rolesLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="md:col-span-2">
          <FormItem
            label="Email Address"
            invalid={Boolean(errors.email)}
            errorMessage={errors.email?.message}
            required
          >
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Email is invalid",
                },
              }}
              render={({ field }) => (
                <Input
                  type="email"
                  placeholder="user@example.com"
                  invalid={Boolean(errors.email)}
                  {...field}
                  disabled={userId !== null || userId !== ""}
                />
              )}
            />
          </FormItem>
        </div>

        {/* Password */}
        {!isEditMode && (
          <div className="md:col-span-2">
            <FormItem
              label="Password"
              invalid={Boolean(errors.password)}
              errorMessage={errors.password?.message}
              required={!isEditMode}
            >
              <Controller
                name="password"
                control={control}
                rules={{
                  required: !isEditMode ? "Password is required" : false,
                  minLength: !isEditMode
                    ? {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      }
                    : undefined,
                }}
                render={({ field }) => (
                  <Input
                    type="password"
                    placeholder={
                      isEditMode
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    invalid={Boolean(errors.password)}
                    {...field}
                  />
                )}
              />
              {isEditMode && (
                <p className="mt-1 text-sm text-gray-500">
                  Leave blank to keep the current password
                </p>
              )}
            </FormItem>
          </div>
        )}

        {/* First Name */}
        <FormItem
          label="First Name"
          invalid={Boolean(errors.first_name)}
          errorMessage={errors.first_name?.message}
          required
        >
          <Controller
            name="first_name"
            control={control}
            rules={{ required: "First name is required" }}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="John"
                invalid={Boolean(errors.first_name)}
                {...field}
              />
            )}
          />
        </FormItem>

        {/* Last Name */}
        <FormItem
          label="Last Name"
          invalid={Boolean(errors.last_name)}
          errorMessage={errors.last_name?.message}
          required
        >
          <Controller
            name="last_name"
            control={control}
            rules={{ required: "Last name is required" }}
            render={({ field }) => (
              <Input
                type="text"
                placeholder="Doe"
                invalid={Boolean(errors.last_name)}
                {...field}
              />
            )}
          />
        </FormItem>

        {/* Role */}
        {!myAccount && (
          <FormItem
            label="Role"
            invalid={Boolean(errors.role_id)}
            errorMessage={errors.role_id?.message}
            required
          >
            <Controller
              name="role_id"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select invalid={Boolean(errors.role_id)} {...field}>
                  <option value="">Select a role</option>
                  {rolesData?.data?.roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormItem>
        )}

        {/* Phone */}
        <FormItem label="Phone Number">
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input type="tel" placeholder="+1234567890" {...field} />
            )}
          />
        </FormItem>

        {/* Address */}
        <div className="md:col-span-2">
          <FormItem label="Address">
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  placeholder="123 Main St, City, State, ZIP"
                  {...field}
                />
              )}
            />
          </FormItem>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Saving...
            </div>
          ) : isEditMode ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;

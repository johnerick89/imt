import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { FormItem } from "./ui/FormItem";
import { FiEye, FiEyeOff } from "react-icons/fi";
import type { UpdatePasswordRequest } from "../types/UsersTypes";

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdatePasswordRequest) => void;
  isLoading?: boolean;
  userName?: string;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  userName = "User",
}) => {
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordRequest>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const handleFormSubmit = (data: UpdatePasswordRequest) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Update Password - ${userName}`}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Current Password */}
          <FormItem
            label="Current Password"
            invalid={Boolean(errors.oldPassword)}
            errorMessage={errors.oldPassword?.message}
            required
          >
            <Controller
              name="oldPassword"
              control={control}
              rules={{
                required: "Current password is required",
              }}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    invalid={Boolean(errors.oldPassword)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? (
                      <FiEyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <FiEye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            />
          </FormItem>

          {/* New Password */}
          <FormItem
            label="New Password"
            invalid={Boolean(errors.newPassword)}
            errorMessage={errors.newPassword?.message}
            required
          >
            <Controller
              name="newPassword"
              control={control}
              rules={{
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              }}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password (min 6 characters)"
                    invalid={Boolean(errors.newPassword)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <FiEyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <FiEye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            />
          </FormItem>

          {/* Confirm New Password */}
          <FormItem
            label="Confirm New Password"
            invalid={Boolean(errors.confirmPassword)}
            errorMessage={errors.confirmPassword?.message}
            required
          >
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: "Please confirm your new password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              }}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    invalid={Boolean(errors.confirmPassword)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <FiEye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              )}
            />
          </FormItem>
        </div>

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Password Requirements:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Minimum 6 characters long</li>
            <li>• New password must be different from current password</li>
            <li>• Confirmation must match new password</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdatePasswordModal;

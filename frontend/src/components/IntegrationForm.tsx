import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./FormItem";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import type {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  Integration,
} from "../types/IntegrationsTypes";

interface IntegrationFormProps {
  initialData?: Integration;
  onSubmit: (data: CreateIntegrationRequest | UpdateIntegrationRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIntegrationRequest>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          type: initialData.type,
          status: initialData.status,
          api_key: initialData.api_key || "",
          api_secret: initialData.api_secret || "",
          endpoint_url: initialData.endpoint_url || "",
          webhook_secret: initialData.webhook_secret || "",
        }
      : {
          name: "",
          description: "",
          type: "API",
          status: "ACTIVE",
          api_key: "",
          api_secret: "",
          endpoint_url: "",
          webhook_secret: "",
        },
  });

  const handleFormSubmit = (data: CreateIntegrationRequest) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormItem
          label="Name"
          required
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter integration name"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Type"
          required
          invalid={!!errors.type}
          errorMessage={errors.type?.message}
        >
          <Controller
            name="type"
            control={control}
            rules={{ required: "Type is required" }}
            render={({ field }) => (
              <Select {...field} disabled={isLoading}>
                <option value="">Select type</option>
                <option value="API">API</option>
                <option value="WEBHOOK">Webhook</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </Select>
            )}
          />
        </FormItem>

        <FormItem
          label="Status"
          required
          invalid={!!errors.status}
          errorMessage={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <Select {...field} disabled={isLoading}>
                <option value="">Select status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
                <option value="BLOCKED">Blocked</option>
              </Select>
            )}
          />
        </FormItem>

        <FormItem
          label="API Key"
          invalid={!!errors.api_key}
          errorMessage={errors.api_key?.message}
        >
          <Controller
            name="api_key"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter API key"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="API Secret"
          invalid={!!errors.api_secret}
          errorMessage={errors.api_secret?.message}
        >
          <Controller
            name="api_secret"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                placeholder="Enter API secret"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Endpoint URL"
          invalid={!!errors.endpoint_url}
          errorMessage={errors.endpoint_url?.message}
        >
          <Controller
            name="endpoint_url"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter endpoint URL"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Webhook Secret"
          invalid={!!errors.webhook_secret}
          errorMessage={errors.webhook_secret?.message}
        >
          <Controller
            name="webhook_secret"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                placeholder="Enter webhook secret"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>
      </div>

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
              placeholder="Enter integration description"
              rows={3}
              disabled={isLoading}
            />
          )}
        />
      </FormItem>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Saving..."
            : isEdit
            ? "Update Integration"
            : "Create Integration"}
        </button>
      </div>
    </form>
  );
};

export default IntegrationForm;

import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { SearchableSelect } from "./ui/SearchableSelect";
import { Textarea } from "./ui/Textarea";
import { useSession, useOrganisations } from "../hooks";
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
  currentOrganisationId?: string; // For organisation profile context
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
  currentOrganisationId,
}) => {
  const { user } = useSession();
  const { data: organisationsData } = useOrganisations({ limit: 1000 });

  const organisations = organisationsData?.data?.organisations || [];

  // Filter organisations to only PARTNER or AGENCY types
  const availableOrganisations = useMemo(() => {
    return organisations.filter(
      (org) =>
        (org.type === "PARTNER" || org.type === "AGENCY") &&
        org.id !== user?.organisation_id // Exclude current user's organisation
    );
  }, [organisations, user?.organisation_id]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateIntegrationRequest>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || "",
          organisation_id: initialData.organisation_id || "",
          origin_organisation_id:
            initialData.origin_organisation_id || user?.organisation_id || "",
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
          organisation_id: currentOrganisationId || "",
          origin_organisation_id: user?.organisation_id || "",
          type: "API",
          status: "ACTIVE",
          api_key: "",
          api_secret: "",
          endpoint_url: "",
          webhook_secret: "",
        },
  });

  const watchedOrganisationId = watch("organisation_id");

  // Determine if we should show organisation selection
  const showOrganisationSelection = !currentOrganisationId; // Only show when not in organisation profile context

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    // If user has no organisation, disable form
    if (!user?.organisation_id) {
      return false;
    }

    // If in organisation profile context, ensure current org != view org
    if (
      currentOrganisationId &&
      currentOrganisationId === user.organisation_id
    ) {
      return false;
    }

    // If in standalone context, ensure organisation is selected and different from user's org
    if (showOrganisationSelection) {
      return (
        watchedOrganisationId && watchedOrganisationId !== user.organisation_id
      );
    }

    return true;
  }, [
    user?.organisation_id,
    currentOrganisationId,
    showOrganisationSelection,
    watchedOrganisationId,
  ]);

  const handleFormSubmit = (data: CreateIntegrationRequest) => {
    if (!isFormValid) return;

    // Set origin_organisation_id to current user's organisation
    const formData = {
      ...data,
      origin_organisation_id: user?.organisation_id,
      organisation_id: currentOrganisationId || data.organisation_id,
    };

    onSubmit(formData);
  };

  // Error message for invalid form state
  const getFormErrorMessage = () => {
    if (!user?.organisation_id) {
      return "You must be assigned to an organisation to create integrations.";
    }

    if (
      currentOrganisationId &&
      currentOrganisationId === user.organisation_id
    ) {
      return "You cannot create integrations with your own organisation.";
    }

    if (
      showOrganisationSelection &&
      watchedOrganisationId === user.organisation_id
    ) {
      return "You cannot create integrations with your own organisation.";
    }

    if (showOrganisationSelection && !watchedOrganisationId) {
      return "Please select a target organisation for this integration.";
    }

    return null;
  };

  const formErrorMessage = getFormErrorMessage();

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Error message */}
      {formErrorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-800 text-sm">{formErrorMessage}</div>
          </div>
        </div>
      )}

      {/* Organisation Selection (only when not in organisation profile context) */}
      {showOrganisationSelection && (
        <FormItem
          label="Target Organisation"
          required
          invalid={!!errors.organisation_id}
          errorMessage={errors.organisation_id?.message}
        >
          <Controller
            name="organisation_id"
            control={control}
            rules={{ required: "Target organisation is required" }}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                options={availableOrganisations.map((org) => ({
                  value: org.id,
                  label: `${org.name} (${org.type})`,
                }))}
                placeholder="Select target organisation"
                disabled={isLoading}
                invalid={!!errors.organisation_id}
              />
            )}
          />
        </FormItem>
      )}

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
          disabled={isLoading || !isFormValid}
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

import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { SearchableSelect } from "./ui/SearchableSelect";
import {
  useAllCurrencies,
  useAllOrganisations,
  useOrganisation,
  useSession,
} from "../hooks";
import type {
  CreateChargeRequest,
  UpdateChargeRequest,
  Charge,
} from "../types/ChargesTypes";
import type { Organisation } from "../types/OrganisationsTypes";
import { useEffect } from "react";

interface ChargeFormProps {
  initialData?: Charge;
  onSubmit: (data: CreateChargeRequest | UpdateChargeRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
  currentOrganisationId?: string;
  isStandard?: boolean;
}

export default function ChargeForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
  currentOrganisationId,
  isStandard = false,
}: ChargeFormProps) {
  console.log("isStandard", isStandard);
  const { user } = useSession();
  const userOrganisationId = user?.organisation_id;
  const { data: userOrganisationData } = useOrganisation(
    userOrganisationId || ""
  );
  const userOrganisation = userOrganisationData?.data;
  const { data: currentOrganisationData } = useOrganisation(
    currentOrganisationId || ""
  );
  const currentOrganisation = currentOrganisationData?.data;
  const { data: currenciesData } = useAllCurrencies();
  const { data: organisationsData } = useAllOrganisations();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateChargeRequest>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          application_method: initialData.application_method,
          currency_id:
            initialData.currency_id ||
            currentOrganisation?.base_currency_id ||
            userOrganisation?.base_currency_id ||
            "",
          type: initialData.type,
          rate: initialData.rate,
          origin_organisation_id:
            initialData.origin_organisation_id || userOrganisationId || "",
          destination_organisation_id:
            initialData.destination_organisation_id ||
            currentOrganisationId ||
            "",
          is_reversible: initialData.is_reversible,
          direction: initialData.direction,
          origin_share_percentage:
            initialData.origin_share_percentage || undefined,
          destination_share_percentage:
            initialData.destination_share_percentage || undefined,
          status: initialData.status,
          min_amount: initialData.min_amount || undefined,
          max_amount: initialData.max_amount || undefined,
          payment_authority: initialData.payment_authority || undefined,
          internal_share_percentage:
            initialData.internal_share_percentage || undefined,
        }
      : {
          name: "",
          description: "",
          application_method: "PERCENTAGE",
          currency_id:
            currentOrganisation?.base_currency_id ||
            userOrganisation?.base_currency_id ||
            "",
          type: "COMMISSION",
          rate: 0,
          origin_organisation_id: userOrganisationId || "",
          destination_organisation_id: currentOrganisationId || "",
          is_reversible: false,
          direction: "OUTBOUND",
          origin_share_percentage: 60,
          destination_share_percentage: 40,
          status: "ACTIVE",
          min_amount: undefined,
          max_amount: undefined,
          payment_authority: undefined,
          internal_share_percentage: undefined,
        },
  });

  const watchedType = watch("type");

  useEffect(() => {
    if (watchedType === "COMMISSION") {
      setValue("origin_share_percentage", 40);
      setValue("destination_share_percentage", 30);
      setValue("internal_share_percentage", 30);
      setValue("payment_authority", undefined);
    } else if (watchedType === "TAX") {
      setValue("origin_share_percentage", 0);
      setValue("destination_share_percentage", 0);
      setValue("internal_share_percentage", 100);
      // Keep payment_authority as is for TAX type
    } else if (watchedType === "INTERNAL_FEE") {
      setValue("origin_share_percentage", 100);
      setValue("destination_share_percentage", 0);
      setValue("internal_share_percentage", 0);
      setValue("payment_authority", undefined);
    } else if (watchedType === "OTHER") {
      setValue("origin_share_percentage", 0);
      setValue("destination_share_percentage", 0);
      setValue("internal_share_percentage", 0);
      setValue("payment_authority", undefined);
    }
  }, [watchedType, setValue]);

  useEffect(() => {
    if (
      organisationsData &&
      organisationsData?.data?.organisations?.length &&
      organisationsData?.data?.organisations?.length > 0
    ) {
      const customerOrganisation = organisationsData?.data?.organisations?.find(
        (org: Organisation) => org.id === userOrganisationId
      );
      setValue("origin_organisation_id", customerOrganisation?.id || "");
      setValue("destination_organisation_id", currentOrganisationId || "");
    }
  }, [organisationsData, setValue, currentOrganisationId, userOrganisationId]);

  const handleFormSubmit = (data: CreateChargeRequest) => {
    const { origin_organisation_id, destination_organisation_id, ...rest } =
      data;

    // If isStandard, set organizations to undefined (null)
    if (isStandard) {
      onSubmit({
        origin_organisation_id: undefined,
        destination_organisation_id: undefined,
        ...rest,
      });
    } else {
      onSubmit({
        origin_organisation_id:
          origin_organisation_id || userOrganisationId || "",
        destination_organisation_id:
          destination_organisation_id || currentOrganisationId || "",
        ...rest,
      });
    }
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
                placeholder="Enter charge name"
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
                <option value="TAX">Tax</option>
                <option value="INTERNAL_FEE">Internal Fee</option>
                <option value="COMMISSION">Commission</option>
                <option value="OTHER">Other</option>
              </Select>
            )}
          />
        </FormItem>

        <FormItem
          label="Application Method"
          required
          invalid={!!errors.application_method}
          errorMessage={errors.application_method?.message}
        >
          <Controller
            name="application_method"
            control={control}
            rules={{ required: "Application method is required" }}
            render={({ field }) => (
              <Select {...field} disabled={isLoading}>
                <option value="">Select method</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed</option>
              </Select>
            )}
          />
        </FormItem>

        <FormItem
          label="Rate"
          required
          invalid={!!errors.rate}
          errorMessage={errors.rate?.message}
        >
          <Controller
            name="rate"
            control={control}
            rules={{
              required: "Rate is required",
              min: { value: 0, message: "Rate must be non-negative" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter rate"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Direction"
          required
          invalid={!!errors.direction}
          errorMessage={errors.direction?.message}
        >
          <Controller
            name="direction"
            control={control}
            rules={{ required: "Direction is required" }}
            render={({ field }) => (
              <Select {...field} disabled={isLoading}>
                <option value="">Select direction</option>
                <option value="OUTBOUND">Outbound</option>
                <option value="INBOUND">Inbound</option>
                <option value="BOTH">Both</option>
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
          label="Currency"
          invalid={!!errors.currency_id}
          errorMessage={errors.currency_id?.message}
        >
          <Controller
            name="currency_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={
                  currenciesData?.data?.map((currency) => ({
                    value: currency.id,
                    label: `${currency.currency_code} - ${currency.currency_name}`,
                  })) || []
                }
                placeholder="Select currency (optional)"
                searchPlaceholder="Search currencies..."
                disabled={isLoading}
                invalid={!!errors.currency_id}
              />
            )}
          />
        </FormItem>

        {!isStandard && (
          <>
            <FormItem
              label="Origin Organisation"
              invalid={!!errors.origin_organisation_id}
              errorMessage={errors.origin_organisation_id?.message}
            >
              <Controller
                name="origin_organisation_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={
                      organisationsData?.data?.organisations?.map((org) => ({
                        value: org.id,
                        label: org.name,
                      })) || []
                    }
                    placeholder="Select origin organisation"
                    searchPlaceholder="Search organisations..."
                    disabled={isLoading}
                    invalid={!!errors.origin_organisation_id}
                  />
                )}
              />
            </FormItem>

            <FormItem
              label="Destination Organisation"
              invalid={!!errors.destination_organisation_id}
              errorMessage={errors.destination_organisation_id?.message}
            >
              <Controller
                name="destination_organisation_id"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={
                      organisationsData?.data?.organisations?.map((org) => ({
                        value: org.id,
                        label: org.name,
                      })) || []
                    }
                    placeholder="Select destination organisation"
                    searchPlaceholder="Search organisations..."
                    disabled={isLoading}
                    invalid={!!errors.destination_organisation_id}
                  />
                )}
              />
            </FormItem>
          </>
        )}

        <FormItem
          label="Min Amount"
          invalid={!!errors.min_amount}
          errorMessage={errors.min_amount?.message}
        >
          <Controller
            name="min_amount"
            control={control}
            rules={{
              min: { value: 0, message: "Min amount must be non-negative" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter minimum amount (optional)"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Max Amount"
          invalid={!!errors.max_amount}
          errorMessage={errors.max_amount?.message}
        >
          <Controller
            name="max_amount"
            control={control}
            rules={{
              min: { value: 0, message: "Max amount must be non-negative" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter maximum amount (optional)"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Origin Share Percentage"
          invalid={!!errors.origin_share_percentage}
          errorMessage={errors.origin_share_percentage?.message}
        >
          <Controller
            name="origin_share_percentage"
            control={control}
            rules={{
              min: { value: 0, message: "Percentage must be non-negative" },
              max: { value: 100, message: "Percentage cannot exceed 100" },
              validate: (value) => {
                const originShare = value;
                const destinationShare = watch("destination_share_percentage");
                const internalShare = watch("internal_share_percentage");
                if (
                  originShare !== undefined &&
                  destinationShare !== undefined &&
                  internalShare !== undefined
                ) {
                  const total = originShare + destinationShare + internalShare;
                  if (total !== 100) {
                    return "Origin, destination and internal percentages must sum to 100";
                  }
                }
                return true;
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter origin share % (optional)"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Destination Share Percentage"
          invalid={!!errors.destination_share_percentage}
          errorMessage={errors.destination_share_percentage?.message}
        >
          <Controller
            name="destination_share_percentage"
            control={control}
            rules={{
              min: { value: 0, message: "Percentage must be non-negative" },
              max: { value: 100, message: "Percentage cannot exceed 100" },
              validate: (value) => {
                const destinationShare = value;
                const originShare = watch("origin_share_percentage");
                const internalShare = watch("internal_share_percentage");
                if (
                  originShare !== undefined &&
                  destinationShare !== undefined &&
                  internalShare !== undefined
                ) {
                  const total = originShare + destinationShare + internalShare;
                  if (total !== 100) {
                    return "Origin, destination and internal percentages must sum to 100";
                  }
                }
                return true;
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter destination share % (optional)"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Internal Share Percentage"
          invalid={!!errors.internal_share_percentage}
          errorMessage={errors.internal_share_percentage?.message}
        >
          <Controller
            name="internal_share_percentage"
            control={control}
            rules={{
              min: { value: 0, message: "Percentage must be non-negative" },
              max: { value: 100, message: "Percentage cannot exceed 100" },
              validate: (value) => {
                const internalShare = value;
                const destinationShare = watch("destination_share_percentage");
                const originShare = watch("origin_share_percentage");
                if (
                  originShare !== undefined &&
                  destinationShare !== undefined &&
                  internalShare !== undefined
                ) {
                  const total = originShare + destinationShare + internalShare;
                  if (total !== 100) {
                    return "Origin, destination and internal percentages must sum to 100";
                  }
                }
                return true;
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter internal share % (optional)"
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
              placeholder="Enter charge description"
              disabled={isLoading}
              rows={3}
            />
          )}
        />
      </FormItem>

      {/* Payment Authority - Only show for TAX type */}
      {watchedType === "TAX" && (
        <FormItem
          label="Payment Authority"
          invalid={!!errors.payment_authority}
          errorMessage={errors.payment_authority?.message}
        >
          <Controller
            name="payment_authority"
            control={control}
            rules={{
              required:
                watchedType === "TAX"
                  ? "Payment authority is required for TAX charges"
                  : false,
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter payment authority (e.g., government agency)"
                disabled={isLoading}
              />
            )}
          />
        </FormItem>
      )}

      <div className="flex items-center space-x-4">
        <Controller
          name="is_reversible"
          control={control}
          render={({ field }) => (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                disabled={isLoading}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Is Reversible</span>
            </label>
          )}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : isEdit ? "Update Charge" : "Create Charge"}
        </button>
      </div>
    </form>
  );
}

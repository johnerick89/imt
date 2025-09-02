import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./FormItem";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { SearchableSelect } from "./SearchableSelect";
import { useAllCountries } from "../hooks/useCountries";
import type {
  CreateBeneficiaryRequest,
  UpdateBeneficiaryRequest,
  Beneficiary,
} from "../types/BeneficiariesTypes";

interface BeneficiaryFormProps {
  initialData?: Beneficiary;
  onSubmit: (data: CreateBeneficiaryRequest | UpdateBeneficiaryRequest) => void;
  isLoading?: boolean;
  customerId: string;
  organisationId: string;
}

const BeneficiaryForm: React.FC<BeneficiaryFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  customerId,
  organisationId,
}) => {
  const isEdit = !!initialData;
  const { data: countriesData } = useAllCountries();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBeneficiaryRequest>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      id_type: initialData?.id_type || "NATIONAL_ID",
      id_number: initialData?.id_number || "",
      date_of_birth: initialData?.date_of_birth
        ? new Date(initialData.date_of_birth).toISOString().split("T")[0]
        : "",
      nationality_id: initialData?.nationality_id || "",
      address: initialData?.address || "",
      customer_id: customerId,
      organisation_id: organisationId,
    },
  });

  const handleFormSubmit = (data: CreateBeneficiaryRequest) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      ) as CreateBeneficiaryRequest;

      onSubmit(cleanedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormItem
          label="Full Name"
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: "Full name is required" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter full name"
                disabled={isLoading}
                invalid={!!errors.name}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Email"
          invalid={!!errors.email}
          errorMessage={errors.email?.message}
        >
          <Controller
            name="email"
            control={control}
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder="Enter email address"
                disabled={isLoading}
                invalid={!!errors.email}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Phone Number"
          invalid={!!errors.phone}
          errorMessage={errors.phone?.message}
        >
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter phone number"
                disabled={isLoading}
                invalid={!!errors.phone}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Date of Birth"
          invalid={!!errors.date_of_birth}
          errorMessage={errors.date_of_birth?.message}
        >
          <Controller
            name="date_of_birth"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                disabled={isLoading}
                invalid={!!errors.date_of_birth}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="ID Type"
          invalid={!!errors.id_type}
          errorMessage={errors.id_type?.message}
          required
        >
          <Controller
            name="id_type"
            control={control}
            rules={{ required: "ID type is required" }}
            render={({ field }) => (
              <Select
                {...field}
                disabled={isLoading}
                invalid={!!errors.id_type}
              >
                <option value="">Select ID type</option>
                <option value="PASSPORT">Passport</option>
                <option value="NATIONAL_ID">National ID</option>
                <option value="DRIVERS_LICENSE">Driver's License</option>
                <option value="ALIEN_CARD">Alien Card</option>
                <option value="KRA_PIN">KRA PIN</option>
                <option value="OTHER">Other</option>
              </Select>
            )}
          />
        </FormItem>

        <FormItem
          label="ID Number"
          invalid={!!errors.id_number}
          errorMessage={errors.id_number?.message}
          required
        >
          <Controller
            name="id_number"
            control={control}
            rules={{ required: "ID number is required" }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter ID number"
                disabled={isLoading}
                invalid={!!errors.id_number}
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Nationality"
          invalid={!!errors.nationality_id}
          errorMessage={errors.nationality_id?.message}
        >
          <Controller
            name="nationality_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={
                  countriesData?.data?.countries?.map((country) => ({
                    value: country.id,
                    label: country.name,
                  })) || []
                }
                placeholder="Select nationality"
                searchPlaceholder="Search countries..."
                disabled={isLoading}
                invalid={!!errors.nationality_id}
              />
            )}
          />
        </FormItem>
      </div>

      {/* Address */}
      <FormItem
        label="Address"
        invalid={!!errors.address}
        errorMessage={errors.address?.message}
      >
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Enter address"
              disabled={isLoading}
              invalid={!!errors.address}
              rows={3}
            />
          )}
        />
      </FormItem>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Saving..."
            : isEdit
            ? "Update Beneficiary"
            : "Create Beneficiary"}
        </button>
      </div>
    </form>
  );
};

export default BeneficiaryForm;

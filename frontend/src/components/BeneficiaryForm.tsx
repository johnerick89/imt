import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { SearchableSelect } from "./ui/SearchableSelect";
import { useAllCountries } from "../hooks/useCountries";
import { useOccupations } from "../hooks/useOccupations";
import { useIndustries } from "../hooks/useIndustries";
import { useSession } from "../hooks/useSession";
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
  const { data: occupationsData } = useOccupations({ limit: 100 });
  const { data: industriesData } = useIndustries({ limit: 100 });
  const { fetchBeneficiaryDefaultCountryId } = useSession();
  useEffect(() => {
    fetchBeneficiaryDefaultCountryId();
  }, [fetchBeneficiaryDefaultCountryId]);
  const { beneficiaryDefaultCountryId } = useSession();

  const {
    control,
    handleSubmit,
    watch,
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
      nationality_id:
        initialData?.nationality_id || beneficiaryDefaultCountryId || "",
      address: initialData?.address || "",
      customer_id: customerId,
      organisation_id: organisationId,
      type: "INDIVIDUAL" as const,
      tax_number_type: "PIN" as const,
      tax_number: "",
      reg_number: "",
      occupation_id: "",
      industry_id: "",
      residence_country_id: beneficiaryDefaultCountryId || "",
      incorporation_country_id: beneficiaryDefaultCountryId || "",
      bank_name: initialData?.bank_name || "",
      bank_address: initialData?.bank_address || "",
      bank_city: initialData?.bank_city || "",
      bank_state: initialData?.bank_state || "",
      bank_zip: initialData?.bank_zip || "",
      bank_account_number: initialData?.bank_account_number || "",
      bank_account_name: initialData?.bank_account_name || "",
    },
  });

  const watchedType = watch("type");

  const handleFormSubmit = (data: CreateBeneficiaryRequest) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      ) as CreateBeneficiaryRequest;
      console.log("cleanedData", cleanedData);
      onSubmit(cleanedData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Basic Information
        </h3>
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
            label="Beneficiary Type"
            invalid={!!errors.type}
            errorMessage={errors.type?.message}
            required
          >
            <Controller
              name="type"
              control={control}
              rules={{ required: "Beneficiary type is required" }}
              render={({ field }) => (
                <Select {...field} disabled={isLoading} invalid={!!errors.type}>
                  <option value="">Select beneficiary type</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="BUSINESS">Business</option>
                </Select>
              )}
            />
          </FormItem>

          <FormItem
            label="Email"
            invalid={!!errors.email}
            errorMessage={errors.email?.message}
            required
          >
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
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
            required
          >
            <Controller
              name="phone"
              control={control}
              rules={{ required: "Phone number is required" }}
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

          {/* Individual-specific fields */}
          {watchedType === "INDIVIDUAL" && (
            <>
              {/* <FormItem
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
              </FormItem> */}

              <FormItem
                label="Nationality"
                invalid={!!errors.nationality_id}
                errorMessage={errors.nationality_id?.message}
                required
              >
                <Controller
                  name="nationality_id"
                  control={control}
                  rules={{ required: "Nationality is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value || ""}
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

              <FormItem
                label="Residence Country"
                invalid={!!errors.residence_country_id}
                errorMessage={errors.residence_country_id?.message}
                required
              >
                <Controller
                  name="residence_country_id"
                  control={control}
                  rules={{ required: "Residence country is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      options={
                        countriesData?.data?.countries?.map((country) => ({
                          value: country.id,
                          label: country.name,
                        })) || []
                      }
                      placeholder="Select residence country"
                      searchPlaceholder="Search countries..."
                      disabled={isLoading}
                      invalid={!!errors.residence_country_id}
                    />
                  )}
                />
              </FormItem>
            </>
          )}

          {/* Corporate-specific fields */}
          {(watchedType === "CORPORATE" || watchedType === "BUSINESS") && (
            <>
              <FormItem
                label="Incorporation Country"
                invalid={!!errors.incorporation_country_id}
                errorMessage={errors.incorporation_country_id?.message}
                required
              >
                <Controller
                  name="incorporation_country_id"
                  control={control}
                  rules={{ required: "Incorporation country is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      options={
                        countriesData?.data?.countries?.map((country) => ({
                          value: country.id,
                          label: country.name,
                        })) || []
                      }
                      placeholder="Select incorporation country"
                      searchPlaceholder="Search countries..."
                      disabled={isLoading}
                      invalid={!!errors.incorporation_country_id}
                    />
                  )}
                />
              </FormItem>
            </>
          )}
        </div>
      </div>

      {/* Other Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Other Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {watchedType === "INDIVIDUAL" && (
            <FormItem
              label="ID Type"
              invalid={!!errors.id_type}
              errorMessage={errors.id_type?.message}
            >
              <Controller
                name="id_type"
                control={control}
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
          )}

          {watchedType === "INDIVIDUAL" && (
            <FormItem
              label="ID Number"
              invalid={!!errors.id_number}
              errorMessage={errors.id_number?.message}
            >
              <Controller
                name="id_number"
                control={control}
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
          )}
          {watchedType !== "INDIVIDUAL" && (
            <FormItem
              label="Registration Number"
              invalid={!!errors.reg_number}
              errorMessage={errors.reg_number?.message}
            >
              <Controller
                name="reg_number"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter registration number"
                    disabled={isLoading}
                    invalid={!!errors.reg_number}
                  />
                )}
              />
            </FormItem>
          )}
          <FormItem
            label="Tax Number Type"
            invalid={!!errors.tax_number_type}
            errorMessage={errors.tax_number_type?.message}
          >
            <Controller
              name="tax_number_type"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  disabled={isLoading}
                  invalid={!!errors.tax_number_type}
                >
                  <option value="">Select tax number type</option>
                  <option value="PIN">PIN</option>
                  <option value="TIN">TIN</option>
                  <option value="SSN">SSN</option>
                  <option value="KRA_PIN">KRA PIN</option>
                  <option value="OTHER">Other</option>
                </Select>
              )}
            />
          </FormItem>

          <FormItem
            label="Tax Number"
            invalid={!!errors.tax_number}
            errorMessage={errors.tax_number?.message}
          >
            <Controller
              name="tax_number"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter tax number"
                  disabled={isLoading}
                  invalid={!!errors.tax_number}
                />
              )}
            />
          </FormItem>
          {watchedType === "INDIVIDUAL" && (
            <>
              <FormItem
                label="Occupation"
                invalid={!!errors.occupation_id}
                errorMessage={errors.occupation_id?.message}
              >
                <Controller
                  name="occupation_id"
                  control={control}
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value || ""}
                      onChange={field.onChange}
                      options={
                        occupationsData?.data?.occupations?.map(
                          (occupation) => ({
                            value: occupation.id,
                            label: occupation.name,
                          })
                        ) || []
                      }
                      placeholder="Select occupation"
                      searchPlaceholder="Search occupations..."
                      disabled={isLoading}
                      invalid={!!errors.occupation_id}
                    />
                  )}
                />
              </FormItem>
            </>
          )}

          <FormItem
            label="Industry"
            invalid={!!errors.industry_id}
            errorMessage={errors.industry_id?.message}
          >
            <Controller
              name="industry_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value || ""}
                  onChange={field.onChange}
                  options={
                    industriesData?.data?.industries?.map((industry) => ({
                      value: industry.id,
                      label: industry.name,
                    })) || []
                  }
                  placeholder="Select industry"
                  searchPlaceholder="Search industries..."
                  disabled={isLoading}
                  invalid={!!errors.industry_id}
                />
              )}
            />
          </FormItem>
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
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Bank Name"
            invalid={!!errors.bank_name}
            errorMessage={errors.bank_name?.message}
          >
            <Controller
              name="bank_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter bank name"
                  disabled={isLoading}
                  invalid={!!errors.bank_name}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Account Number"
            invalid={!!errors.bank_account_number}
            errorMessage={errors.bank_account_number?.message}
          >
            <Controller
              name="bank_account_number"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter account number"
                  disabled={isLoading}
                  invalid={!!errors.bank_account_number}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Account Holder Name"
            invalid={!!errors.bank_account_name}
            errorMessage={errors.bank_account_name?.message}
          >
            <Controller
              name="bank_account_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter account holder name"
                  disabled={isLoading}
                  invalid={!!errors.bank_account_name}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Bank Address"
            invalid={!!errors.bank_address}
            errorMessage={errors.bank_address?.message}
          >
            <Controller
              name="bank_address"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter bank address"
                  disabled={isLoading}
                  invalid={!!errors.bank_address}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="City"
            invalid={!!errors.bank_city}
            errorMessage={errors.bank_city?.message}
          >
            <Controller
              name="bank_city"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter city"
                  disabled={isLoading}
                  invalid={!!errors.bank_city}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="State/Province"
            invalid={!!errors.bank_state}
            errorMessage={errors.bank_state?.message}
          >
            <Controller
              name="bank_state"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter state/province"
                  disabled={isLoading}
                  invalid={!!errors.bank_state}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="ZIP/Postal Code"
            invalid={!!errors.bank_zip}
            errorMessage={errors.bank_zip?.message}
          >
            <Controller
              name="bank_zip"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter ZIP/postal code"
                  disabled={isLoading}
                  invalid={!!errors.bank_zip}
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
            ? "Update Beneficiary"
            : "Create Beneficiary"}
        </button>
      </div>
    </form>
  );
};

export default BeneficiaryForm;

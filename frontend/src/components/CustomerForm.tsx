import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { SearchableSelect } from "./ui/SearchableSelect";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  Customer,
} from "../types/CustomersTypes";
import { useAllCountries } from "../hooks/useCountries";
import { useAllCurrencies } from "../hooks/useCurrencies";
import { useOccupations } from "../hooks/useOccupations";
import { useIndustries } from "../hooks/useIndustries";
import { useOrganisations } from "../hooks/useOrganisations";
// import { useBranches } from "../hooks/useBranches";
import { useSession } from "../hooks/useSession";
import type { ValidationRule } from "../types/ValidationRulesTypes";

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CreateCustomerRequest | UpdateCustomerRequest) => void;
  isLoading?: boolean;
  isEdit?: boolean;
  validationRules?: ValidationRule | null;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
  validationRules,
}) => {
  const { user } = useSession();
  const organisationId = user?.organisation_id;
  const { data: countriesData } = useAllCountries();
  const { data: currenciesData } = useAllCurrencies();
  const { data: occupationsData } = useOccupations({ page: 1, limit: 100 });
  const { data: industriesData } = useIndustries({ page: 1, limit: 100 });
  const { data: organisationsData } = useOrganisations({ page: 1, limit: 100 });
  // const { data: branchesData } = useBranches({
  //   page: 1,
  //   limit: 100,
  //   organisation_id: organisationId,
  // });

  const userOrganisation = organisationsData?.data?.organisations?.find(
    (org) => org.id === organisationId
  );

  const getIsRequiredField = (field: string) => {
    if (validationRules) {
      return validationRules.config[field];
    }
    return false;
  };

  console.log("userOrganisation", userOrganisation);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CreateCustomerRequest>({
    defaultValues: {
      full_name: initialData?.full_name || "",
      date_of_birth: initialData?.date_of_birth
        ? new Date(initialData.date_of_birth).toISOString().split("T")[0]
        : "",
      nationality_id:
        initialData?.nationality_id || userOrganisation?.country_id || "",
      residence_country_id:
        initialData?.residence_country_id || userOrganisation?.country_id || "",
      id_type: initialData?.id_type || undefined,
      id_number: initialData?.id_number || "",
      address: initialData?.address || "",
      email: initialData?.email || "",
      phone_number: initialData?.phone_number || "",
      occupation_id: initialData?.occupation_id || "",
      risk_rating: initialData?.risk_rating || 0,
      risk_reasons: initialData?.risk_reasons || "",
      organisation_id: initialData?.organisation_id || organisationId || "",
      branch_id: initialData?.branch_id || "",
      tax_number_type: initialData?.tax_number_type || undefined,
      tax_number: initialData?.tax_number || "",
      gender: initialData?.gender || undefined,
      customer_type: initialData?.customer_type || "INDIVIDUAL",
      incorporation_country_id:
        initialData?.incorporation_country_id ||
        userOrganisation?.country_id ||
        "",
      incoporated_date: initialData?.incoporated_date
        ? new Date(initialData.incoporated_date).toISOString().split("T")[0]
        : "",
      estimated_monthly_income:
        initialData?.estimated_monthly_income || undefined,
      org_reg_number: initialData?.org_reg_number || "",
      current_age: initialData?.current_age || undefined,
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      currency_id:
        initialData?.currency_id || userOrganisation?.base_currency_id || "",
      industry_id: initialData?.industry_id || "",
      legacy_customer_id: initialData?.legacy_customer_id || "",
      has_adverse_media: initialData?.has_adverse_media || false,
      adverse_media_reason: initialData?.adverse_media_reason || "",
    },
  });

  // Watch customer type to conditionally show/hide fields
  const customerType = watch("customer_type");
  const isIndividualCustomer = customerType === "INDIVIDUAL";

  useEffect(() => {
    if (userOrganisation) {
      setValue("currency_id", userOrganisation.base_currency_id || "");
      setValue("organisation_id", userOrganisation.id || "");
      setValue("nationality_id", userOrganisation.country_id || "");
      setValue("residence_country_id", userOrganisation.country_id || "");
      setValue("incorporation_country_id", userOrganisation.country_id || "");
    }
  }, [userOrganisation, setValue]);

  const handleFormSubmit = (data: CreateCustomerRequest) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === "" ? undefined : value,
        ])
      ) as CreateCustomerRequest;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem
            label="Full Name"
            invalid={!!errors.full_name}
            errorMessage={errors.full_name?.message}
            required={getIsRequiredField("full_name")}
          >
            <Controller
              name="full_name"
              control={control}
              rules={{
                required: getIsRequiredField("full_name")
                  ? "Full name is required"
                  : false,
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter full name"
                  disabled={isLoading}
                  invalid={!!errors.full_name}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Customer Type"
            invalid={!!errors.customer_type}
            errorMessage={errors.customer_type?.message}
            required={getIsRequiredField("customer_type")}
          >
            <Controller
              name="customer_type"
              control={control}
              rules={{
                required: getIsRequiredField("customer_type")
                  ? "Customer type is required"
                  : false,
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  disabled={isLoading}
                  invalid={!!errors.customer_type}
                >
                  <option value="">Select customer type</option>
                  <option value="INDIVIDUAL">Individual</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="BUSINESS">Business</option>
                </Select>
              )}
            />
          </FormItem>

          {!isIndividualCustomer && (
            <FormItem
              label="Incorporation Date"
              invalid={!!errors.incoporated_date}
              errorMessage={errors.incoporated_date?.message}
              required={getIsRequiredField("incoporated_date")}
            >
              <Controller
                name="incoporated_date"
                control={control}
                rules={{
                  required: getIsRequiredField("incoporated_date")
                    ? "Incorporation date is required"
                    : false,
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    disabled={isLoading}
                    invalid={!!errors.incoporated_date}
                  />
                )}
              />
            </FormItem>
          )}

          {!isIndividualCustomer && (
            <FormItem
              label="Organization Registration Number"
              invalid={!!errors.org_reg_number}
              errorMessage={errors.org_reg_number?.message}
              required={getIsRequiredField("org_reg_number")}
            >
              <Controller
                name="org_reg_number"
                control={control}
                rules={{
                  required: getIsRequiredField("org_reg_number")
                    ? "Organization registration number is required"
                    : false,
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter organization registration number"
                    disabled={isLoading}
                    invalid={!!errors.org_reg_number}
                  />
                )}
              />
            </FormItem>
          )}

          <FormItem
            label="Email"
            invalid={!!errors.email}
            errorMessage={errors.email?.message}
            required={getIsRequiredField("email")}
          >
            <Controller
              name="email"
              control={control}
              rules={{
                required: getIsRequiredField("email")
                  ? "Email is required"
                  : false,
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
            invalid={!!errors.phone_number}
            errorMessage={errors.phone_number?.message}
            required={getIsRequiredField("phone_number")}
          >
            <Controller
              name="phone_number"
              control={control}
              rules={{
                required: getIsRequiredField("phone_number")
                  ? "Phone number is required"
                  : false,
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Enter phone number"
                  disabled={isLoading}
                  invalid={!!errors.phone_number}
                />
              )}
            />
          </FormItem>

          {isIndividualCustomer && (
            <FormItem
              label="Gender"
              invalid={!!errors.gender}
              errorMessage={errors.gender?.message}
              required={getIsRequiredField("gender")}
            >
              <Controller
                name="gender"
                control={control}
                rules={{
                  required: getIsRequiredField("gender")
                    ? "Gender is required"
                    : false,
                }}
                render={({ field }) => (
                  <Select
                    {...field}
                    disabled={isLoading}
                    invalid={!!errors.gender}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                )}
              />
            </FormItem>
          )}
          <FormItem
            label="Currency"
            invalid={!!errors.currency_id}
            errorMessage={errors.currency_id?.message}
            required={getIsRequiredField("currency_id")}
          >
            <Controller
              name="currency_id"
              control={control}
              rules={{
                required: getIsRequiredField("currency_id")
                  ? "Currency is required"
                  : false,
              }}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={
                    currenciesData?.data?.map((currency) => ({
                      value: currency.id,
                      label: `${currency.currency_name} (${currency.currency_code})`,
                    })) || []
                  }
                  placeholder="Select currency"
                  searchPlaceholder="Search currencies..."
                  disabled={isLoading}
                  invalid={!!errors.currency_id}
                />
              )}
            />
          </FormItem>

          {isIndividualCustomer && (
            <FormItem
              label="Nationality"
              invalid={!!errors.nationality_id}
              errorMessage={errors.nationality_id?.message}
              required={getIsRequiredField("nationality_id")}
            >
              <Controller
                name="nationality_id"
                control={control}
                rules={{
                  required: getIsRequiredField("nationality_id")
                    ? "Nationality is required"
                    : false,
                }}
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
          )}

          {isIndividualCustomer && (
            <FormItem
              label="Residence Country"
              invalid={!!errors.residence_country_id}
              errorMessage={errors.residence_country_id?.message}
              required={getIsRequiredField("residence_country_id")}
            >
              <Controller
                name="residence_country_id"
                control={control}
                rules={{
                  required: getIsRequiredField("residence_country_id")
                    ? "Residence country is required"
                    : false,
                }}
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
                    placeholder="Select residence country"
                    searchPlaceholder="Search countries..."
                    disabled={isLoading}
                    invalid={!!errors.residence_country_id}
                  />
                )}
              />
            </FormItem>
          )}

          {!isIndividualCustomer && (
            <FormItem
              label="Incorporation Country"
              invalid={!!errors.incorporation_country_id}
              errorMessage={errors.incorporation_country_id?.message}
              required={getIsRequiredField("incorporation_country_id")}
            >
              <Controller
                name="incorporation_country_id"
                control={control}
                rules={{
                  required: getIsRequiredField("incorporation_country_id")
                    ? "Incorporation country is required"
                    : false,
                }}
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
                    placeholder="Select incorporation country"
                    searchPlaceholder="Search countries..."
                    disabled={isLoading}
                    invalid={!!errors.incorporation_country_id}
                  />
                )}
              />
            </FormItem>
          )}

          {isIndividualCustomer && (
            <FormItem
              label="ID Type"
              invalid={!!errors.id_type}
              errorMessage={errors.id_type?.message}
              required={getIsRequiredField("id_type")}
            >
              <Controller
                name="id_type"
                control={control}
                rules={{
                  required: getIsRequiredField("id_type")
                    ? "ID type is required"
                    : false,
                }}
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

          {isIndividualCustomer && (
            <FormItem
              label="ID Number"
              invalid={!!errors.id_number}
              errorMessage={errors.id_number?.message}
              required={getIsRequiredField("id_number")}
            >
              <Controller
                name="id_number"
                control={control}
                rules={{
                  required: getIsRequiredField("id_number")
                    ? "ID number is required"
                    : false,
                }}
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

          {/* <FormItem
            label="Organisation"
            invalid={!!errors.organisation_id}
            errorMessage={errors.organisation_id?.message}
            required
          >
            <Controller
              name="organisation_id"
              control={control}
              rules={{ required: "Organisation is required" }}
              render={({ field }) =>
                userOrganisation ? (
                  <Input
                    value={userOrganisation.name}
                    disabled={isLoading}
                    invalid={!!errors.organisation_id}
                  />
                ) : (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={
                      organisationsData?.data?.organisations?.map((org) => ({
                        value: org.id,
                        label: org.name,
                      })) || []
                    }
                    placeholder={"Select Organisation "}
                    searchPlaceholder="Search organisations..."
                    disabled={isLoading}
                    invalid={!!errors.organisation_id}
                  />
                )
              }
            />
          </FormItem> */}

          {/* <FormItem
          label="Branch"
          invalid={!!errors.branch_id}
          errorMessage={errors.branch_id?.message}
        >
          <Controller
            name="branch_id"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={
                  branchesData?.data?.branches?.map((branch) => ({
                    value: branch.id,
                    label: branch.name,
                  })) || []
                }
                placeholder="Select branch"
                searchPlaceholder="Search branches..."
                disabled={isLoading}
                invalid={!!errors.branch_id}
              />
            )}
          />
        </FormItem> */}
        </div>
      </div>

      {/* Other Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Other Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isIndividualCustomer && (
            <FormItem
              label="Date of Birth"
              invalid={!!errors.date_of_birth}
              errorMessage={errors.date_of_birth?.message}
              required={getIsRequiredField("date_of_birth")}
            >
              <Controller
                name="date_of_birth"
                control={control}
                rules={{
                  required: getIsRequiredField("date_of_birth")
                    ? "Date of birth is required"
                    : false,
                }}
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
          )}

          {!isIndividualCustomer && (
            <FormItem
              label="Incorporation Date"
              invalid={!!errors.incoporated_date}
              errorMessage={errors.incoporated_date?.message}
              required={getIsRequiredField("incoporated_date")}
            >
              <Controller
                name="incoporated_date"
                control={control}
                rules={{
                  required: getIsRequiredField("incoporated_date")
                    ? "Incorporation date is required"
                    : false,
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    disabled={isLoading}
                    invalid={!!errors.incoporated_date}
                  />
                )}
              />
            </FormItem>
          )}

          {!isIndividualCustomer && (
            <FormItem
              label="Organization Registration Number"
              invalid={!!errors.org_reg_number}
              errorMessage={errors.org_reg_number?.message}
              required={getIsRequiredField("org_reg_number")}
            >
              <Controller
                name="org_reg_number"
                control={control}
                rules={{
                  required: getIsRequiredField("org_reg_number")
                    ? "Organization registration number is required"
                    : false,
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter organization registration number"
                    disabled={isLoading}
                    invalid={!!errors.org_reg_number}
                  />
                )}
              />
            </FormItem>
          )}

          {isIndividualCustomer && (
            <FormItem
              label="Occupation"
              invalid={!!errors.occupation_id}
              errorMessage={errors.occupation_id?.message}
              required={getIsRequiredField("occupation_id")}
            >
              <Controller
                name="occupation_id"
                control={control}
                rules={{
                  required: getIsRequiredField("occupation_id")
                    ? "Occupation is required"
                    : false,
                }}
                render={({ field }) => (
                  <SearchableSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={
                      occupationsData?.data?.occupations?.map((occupation) => ({
                        value: occupation.id,
                        label: occupation.name,
                      })) || []
                    }
                    placeholder="Select occupation"
                    searchPlaceholder="Search occupations..."
                    disabled={isLoading}
                    invalid={!!errors.occupation_id}
                  />
                )}
              />
            </FormItem>
          )}

          <FormItem
            label="Industry"
            invalid={!!errors.industry_id}
            errorMessage={errors.industry_id?.message}
            required={getIsRequiredField("industry_id")}
          >
            <Controller
              name="industry_id"
              control={control}
              rules={{
                required: getIsRequiredField("industry_id")
                  ? "Industry is required"
                  : false,
              }}
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
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
        </div>

        <div className="mt-4">
          <FormItem
            label="Address"
            invalid={!!errors.address}
            errorMessage={errors.address?.message}
            required={getIsRequiredField("address")}
          >
            <Controller
              name="address"
              control={control}
              rules={{
                required: getIsRequiredField("address")
                  ? "Address is required"
                  : false,
              }}
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
            ? "Update Customer"
            : "Create Customer"}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;

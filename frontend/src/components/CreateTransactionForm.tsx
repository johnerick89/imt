import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "./ui/Modal";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { SearchableSelect } from "./ui/SearchableSelect";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useCorridors } from "../hooks/useCorridors";
import { useUserTills } from "../hooks/useTills";
import { useCustomers } from "../hooks/useCustomers";
import { useBeneficiaries } from "../hooks/useBeneficiaries";
import { useOrganisations } from "../hooks/useOrganisations";
import { useTransactionChannels } from "../hooks/useTransactionChannels";
import { useExchangeRates } from "../hooks/useExchangeRates";
import { useCharges } from "../hooks/useCharges";
import type { CreateOutboundTransactionRequest } from "../types/TransactionsTypes";
import type { UserTill } from "../types/TillsTypes";

interface CreateTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOutboundTransactionRequest) => void;
  isLoading?: boolean;
  organisationId: string;
}

interface FormData {
  corridor_id: string;
  till_id: string;
  customer_id: string;
  origin_amount: string;
  origin_channel_id: string;
  origin_currency_id: string;
  beneficiary_id: string;
  dest_amount: string;
  dest_channel_id: string;
  dest_currency_id: string;
  rate: string;
  internal_exchange_rate?: string;
  inflation?: string;
  markup?: string;
  purpose?: string;
  funds_source?: string;
  relationship?: string;
  remarks?: string;
  exchange_rate_id?: string;
  external_exchange_rate_id?: string;
  destination_organisation_id?: string;
  origin_country_id?: string;
  destination_country_id?: string;
}

export const CreateTransactionForm: React.FC<CreateTransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  organisationId,
}) => {
  // Fetch data
  const { data: userTillsData } = useUserTills({
    organisation_id: organisationId,
  });
  const { data: customersData } = useCustomers({
    organisation_id: organisationId,
  });
  const { data: organisationsData } = useOrganisations();
  const { data: channelsData } = useTransactionChannels();
  const { data: exchangeRatesData } = useExchangeRates({
    organisation_id: organisationId,
  });
  const { data: chargesData } = useCharges({
    origin_organisation_id: organisationId,
  });

  const customers = useMemo(
    () => customersData?.data?.customers || [],
    [customersData]
  );
  const organisations = useMemo(
    () => organisationsData?.data?.organisations || [],
    [organisationsData]
  );
  const channels = useMemo(
    () => channelsData?.data?.channels || [],
    [channelsData]
  );
  const exchangeRates = useMemo(
    () => exchangeRatesData?.data?.exchangeRates || [],
    [exchangeRatesData]
  );
  const charges = useMemo(
    () => chargesData?.data?.charges || [],
    [chargesData]
  );
  const currentOrganisation = organisationsData?.data?.organisations.find(
    (org) => org.id === organisationId
  );

  // Get current user's open till
  const currentUserTill = userTillsData?.data?.userTills?.find(
    (userTill: UserTill) => userTill.status === "OPEN"
  );

  console.log(
    "currentUserTill",
    currentUserTill,
    "userTillsData",
    userTillsData
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      corridor_id: "",
      till_id: currentUserTill?.till_id || "",
      customer_id: "",
      origin_amount: "",
      origin_channel_id: "",
      origin_currency_id: currentOrganisation?.base_currency_id || "",
      beneficiary_id: "",
      dest_amount: "",
      dest_channel_id: "",
      dest_currency_id: "",
      rate: "",
      internal_exchange_rate: "",
      inflation: "0",
      markup: "0",
      purpose: "",
      funds_source: "",
      relationship: "",
      remarks: "",
      exchange_rate_id: "",
      external_exchange_rate_id: "",
      destination_organisation_id: "",
      origin_country_id: currentOrganisation?.country_id || "",
      destination_country_id: "",
    },
  });

  // Watch for customer changes to fetch beneficiaries
  const watchedCustomerId = watch("customer_id");
  const { data: beneficiariesData } = useBeneficiaries({
    customer_id: watchedCustomerId,
  });
  const beneficiaries = beneficiariesData?.data?.beneficiaries || [];

  // Watch for currency changes to calculate amounts
  const watchedOriginAmount = watch("origin_amount");
  const watchedRate = watch("rate");
  const watchedCorridorId = watch("corridor_id");
  const watchedOriginCurrencyId = watch("origin_currency_id");
  const watchedDestCurrencyId = watch("dest_currency_id");

  //watch for organisation (partner/agency) changes
  const watchedOrganisationId = watch("destination_organisation_id");
  const { data: corridorsData } = useCorridors({
    organisation_id: watchedOrganisationId,
  });
  const corridors = useMemo(
    () => corridorsData?.data?.corridors || [],
    [corridorsData]
  );

  // Watch for corridor changes to auto-populate exchange rates
  useEffect(() => {
    if (watchedCorridorId && currentOrganisation) {
      const selectedCorridor = corridors.find(
        (c) => c.id === watchedCorridorId
      );
      if (selectedCorridor) {
        // Find active exchange rate
        const activeExchangeRate = exchangeRates.find(
          (rate) =>
            rate.from_currency_id === currentOrganisation.base_currency_id &&
            rate.to_currency_id === selectedCorridor.base_currency_id &&
            rate.origin_country_id === selectedCorridor.base_country_id &&
            rate.destination_country_id ===
              selectedCorridor.destination_country_id &&
            ["ACTIVE", "APPROVED"].includes(rate.status)
        );

        if (activeExchangeRate) {
          setValue("rate", activeExchangeRate.exchange_rate.toString());
          setValue(
            "internal_exchange_rate",
            activeExchangeRate.exchange_rate.toString()
          );
          setValue("exchange_rate_id", activeExchangeRate.id);
        }
      }
    }
  }, [
    watchedCorridorId,
    corridors,
    exchangeRates,
    currentOrganisation,
    setValue,
  ]);

  // Calculate charges and destination amount
  const calculateChargesAndDestinationAmount = () => {
    if (
      !watchedOriginAmount ||
      !watchedOriginCurrencyId ||
      !watchedDestCurrencyId
    ) {
      return { totalCharges: 0, destinationAmount: 0 };
    }

    const originAmount = parseFloat(watchedOriginAmount);
    if (isNaN(originAmount)) return { totalCharges: 0, destinationAmount: 0 };

    // Calculate charges in origin currency
    let totalCharges = 0;
    const applicableCharges = charges.filter(
      (charge) =>
        charge.status === "ACTIVE" &&
        charge.direction === "OUTBOUND" &&
        (charge.origin_organisation_id === organisationId ||
          !charge.origin_organisation_id)
    );

    applicableCharges.forEach((charge) => {
      if (charge.application_method === "PERCENTAGE") {
        const chargeAmount = (originAmount * charge.rate) / 100;
        totalCharges += chargeAmount;
      } else {
        totalCharges += charge.rate;
      }
    });

    // Calculate net amount in origin currency
    const netAmount = originAmount - totalCharges;

    // Convert to destination currency using exchange rate
    const rate = parseFloat(watchedRate) || 1;
    const destinationAmount = netAmount * rate;

    return { totalCharges, destinationAmount };
  };

  const { totalCharges, destinationAmount } =
    calculateChargesAndDestinationAmount();

  // Update destination amount when calculations change
  useEffect(() => {
    if (destinationAmount > 0) {
      setValue("dest_amount", destinationAmount.toFixed(2));
    }
  }, [destinationAmount, setValue]);

  const handleFormSubmit = (data: FormData) => {
    const submitData: CreateOutboundTransactionRequest = {
      corridor_id: data.corridor_id,
      till_id: data.till_id,
      customer_id: data.customer_id,
      origin_amount: parseFloat(data.origin_amount),
      origin_channel_id: data.origin_channel_id,
      origin_currency_id: data.origin_currency_id,
      beneficiary_id: data.beneficiary_id,
      dest_amount: parseFloat(data.dest_amount),
      dest_channel_id: data.dest_channel_id,
      dest_currency_id: data.dest_currency_id,
      rate: parseFloat(data.rate),
      internal_exchange_rate: data.internal_exchange_rate
        ? parseFloat(data.internal_exchange_rate)
        : undefined,
      inflation: 0,
      markup: 0,
      purpose: data.purpose || undefined,
      funds_source: data.funds_source || undefined,
      relationship: data.relationship || undefined,
      remarks: data.remarks || undefined,
      exchange_rate_id: data.exchange_rate_id || undefined,
      external_exchange_rate_id: data.external_exchange_rate_id || undefined,
      destination_organisation_id:
        data.destination_organisation_id || undefined,
      origin_country_id: data.origin_country_id || undefined,
      destination_country_id: data.destination_country_id || undefined,
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Outbound Transaction"
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Customer (Sender)"
            invalid={!!errors.customer_id}
            errorMessage={errors.customer_id?.message}
            required
          >
            <Controller
              name="customer_id"
              control={control}
              rules={{ required: "Customer is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: `${customer.first_name} ${customer.last_name} (${customer.email})`,
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("beneficiary_id", ""); // Reset beneficiary when customer changes
                    setValue("destination_organisation_id", ""); // Reset partner/agency when customer changes
                    setValue("corridor_id", ""); // Reset corridor when customer changes
                  }}
                  placeholder="Select customer..."
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Beneficiary"
            invalid={!!errors.beneficiary_id}
            errorMessage={errors.beneficiary_id?.message}
            required
          >
            <Controller
              name="beneficiary_id"
              control={control}
              rules={{ required: "Beneficiary is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={beneficiaries.map((beneficiary) => ({
                    value: beneficiary.id,
                    label: `${beneficiary.name} (${beneficiary?.bank_name})`,
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("destination_organisation_id", ""); // Reset partner/agency when beneficiary changes
                    setValue("corridor_id", ""); // Reset corridor when beneficiary changes
                  }}
                  placeholder="Select beneficiary..."
                  disabled={!watchedCustomerId}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Partner/Agency"
            invalid={!!errors.destination_organisation_id}
            errorMessage={errors.destination_organisation_id?.message}
            required
          >
            <Controller
              name="destination_organisation_id"
              control={control}
              rules={{ required: "Partner/Agency is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={organisations
                    .filter((org) => org.id !== organisationId)
                    .map((org) => ({
                      value: org.id,
                      label: `${org.name} (${org.type})`,
                    }))}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("corridor_id", ""); // Reset corridor when partner/agency changes
                  }}
                  placeholder="Select partner/agency..."
                  disabled={!watchedCustomerId || !watch("beneficiary_id")}
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Corridor"
            invalid={!!errors.corridor_id}
            errorMessage={errors.corridor_id?.message}
            required
          >
            <Controller
              name="corridor_id"
              control={control}
              rules={{ required: "Corridor is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={corridors.map((corridor) => ({
                    value: corridor.id,
                    label: `${corridor.name} (${corridor?.base_country?.code} → ${corridor?.destination_country?.code})`,
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    // Auto-populate fields based on corridor selection
                    const selectedCorridor = corridors.find(
                      (c) => c.id === value
                    );
                    if (selectedCorridor) {
                      setValue(
                        "origin_country_id",
                        selectedCorridor.base_country_id
                      );
                      setValue(
                        "destination_country_id",
                        selectedCorridor.destination_country_id
                      );
                      setValue(
                        "dest_currency_id",
                        selectedCorridor.base_currency_id
                      );
                      setValue(
                        "origin_currency_id",
                        currentOrganisation?.base_currency_id || ""
                      );

                      // Auto-populate exchange rate
                      const activeExchangeRate = exchangeRates.find(
                        (rate) =>
                          rate.from_currency_id ===
                            currentOrganisation?.base_currency_id &&
                          rate.to_currency_id ===
                            selectedCorridor.base_currency_id &&
                          rate.origin_country_id ===
                            selectedCorridor.base_country_id &&
                          rate.destination_country_id ===
                            selectedCorridor.destination_country_id &&
                          ["ACTIVE", "APPROVED"].includes(rate.status)
                      );

                      if (activeExchangeRate) {
                        setValue(
                          "rate",
                          activeExchangeRate.exchange_rate.toString()
                        );
                        setValue("exchange_rate_id", activeExchangeRate.id);
                        setValue(
                          "internal_exchange_rate",
                          activeExchangeRate.exchange_rate.toString()
                        );
                      }
                    }
                  }}
                  placeholder="Select corridor..."
                  disabled={
                    !watchedCustomerId ||
                    !watch("beneficiary_id") ||
                    !watch("destination_organisation_id")
                  }
                />
              )}
            />
          </FormItem>
        </div>

        {/* Amount Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Origin Amount"
            invalid={!!errors.origin_amount}
            errorMessage={errors.origin_amount?.message}
            required
          >
            <Controller
              name="origin_amount"
              control={control}
              rules={{
                required: "Origin amount is required",
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter a valid amount",
                },
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  placeholder="Enter amount..."
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Exchange Rate"
            invalid={!!errors.rate}
            errorMessage={errors.rate?.message}
            required
          >
            <Controller
              name="rate"
              control={control}
              rules={{
                required: "Exchange rate is required",
                pattern: {
                  value: /^\d+(\.\d{1,6})?$/,
                  message: "Please enter a valid exchange rate",
                },
              }}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  {...field}
                  placeholder="Enter exchange rate..."
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Destination Amount"
            invalid={!!errors.dest_amount}
            errorMessage={errors.dest_amount?.message}
            required
          >
            <Controller
              name="dest_amount"
              control={control}
              rules={{ required: "Destination amount is required" }}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  placeholder="Calculated automatically..."
                  readOnly
                />
              )}
            />
          </FormItem>
        </div>

        {/* Channel Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Origin Channel"
            invalid={!!errors.origin_channel_id}
            errorMessage={errors.origin_channel_id?.message}
            required
          >
            <Controller
              name="origin_channel_id"
              control={control}
              rules={{ required: "Origin channel is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={channels.map((channel) => ({
                    value: channel.id,
                    label: channel.name,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select origin channel..."
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Destination Channel"
            invalid={!!errors.dest_channel_id}
            errorMessage={errors.dest_channel_id?.message}
            required
          >
            <Controller
              name="dest_channel_id"
              control={control}
              rules={{ required: "Destination channel is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={channels.map((channel) => ({
                    value: channel.id,
                    label: channel.name,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select destination channel..."
                />
              )}
            />
          </FormItem>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Internal Exchange Rate"
            invalid={!!errors.internal_exchange_rate}
            errorMessage={errors.internal_exchange_rate?.message}
          >
            <Controller
              name="internal_exchange_rate"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.000001"
                  min="0"
                  {...field}
                  placeholder="Auto-populated..."
                  readOnly
                />
              )}
            />
          </FormItem>

          {/* Charges Display */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Total Charges
            </label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                {totalCharges > 0 ? (
                  <>
                    <span className="font-medium">
                      {totalCharges.toFixed(2)}{" "}
                      {currentOrganisation?.base_currency?.currency_code ||
                        "USD"}
                    </span>
                    <span className="text-gray-500 ml-2">
                      (
                      {(
                        (totalCharges /
                          parseFloat(watchedOriginAmount || "1")) *
                        100
                      ).toFixed(2)}
                      % of origin amount)
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">No charges applicable</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Destination Amount Display */}
        {destinationAmount > 0 && (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Net Destination Amount
              </label>
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-lg font-semibold text-blue-900">
                  {destinationAmount.toFixed(2)}{" "}
                  {watchedDestCurrencyId
                    ? corridors.find((c) => c.id === watchedCorridorId)
                        ?.base_currency?.currency_code || "USD"
                    : "USD"}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  After deducting charges of {totalCharges.toFixed(2)}{" "}
                  {currentOrganisation?.base_currency?.currency_code || "USD"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purpose and Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Purpose"
            invalid={!!errors.purpose}
            errorMessage={errors.purpose?.message}
          >
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter transaction purpose..." />
              )}
            />
          </FormItem>

          <FormItem
            label="Funds Source"
            invalid={!!errors.funds_source}
            errorMessage={errors.funds_source?.message}
          >
            <Controller
              name="funds_source"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter funds source..." />
              )}
            />
          </FormItem>
        </div>

        {/* Relationship and Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Relationship"
            invalid={!!errors.relationship}
            errorMessage={errors.relationship?.message}
          >
            <Controller
              name="relationship"
              control={control}
              defaultValue={"N/A"}
              render={({ field }) => (
                <Input {...field} placeholder="Enter relationship..." />
              )}
            />
          </FormItem>

          <FormItem
            label="Exchange Rate Reference"
            invalid={!!errors.exchange_rate_id}
            errorMessage={errors.exchange_rate_id?.message}
          >
            <Controller
              name="exchange_rate_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={exchangeRates.map((rate) => ({
                    value: rate.id,
                    label: `${rate.from_currency?.currency_code || "N/A"} → ${
                      rate.to_currency?.currency_code || "N/A"
                    } - ${rate.exchange_rate}`,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select exchange rate..."
                />
              )}
            />
          </FormItem>
        </div>

        <FormItem
          label="Remarks"
          invalid={!!errors.remarks}
          errorMessage={errors.remarks?.message}
        >
          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Enter additional remarks..."
                rows={3}
              />
            )}
          />
        </FormItem>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTransactionForm;

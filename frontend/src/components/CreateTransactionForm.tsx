import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "./Modal";
import { FormItem } from "./FormItem";
import { Input } from "./Input";
import { SearchableSelect } from "./SearchableSelect";
import { Textarea } from "./Textarea";
import { Button } from "./Button";
import { useCorridors } from "../hooks/useCorridors";
import { useTills } from "../hooks/useTills";
import { useCustomers } from "../hooks/useCustomers";
import { useBeneficiaries } from "../hooks/useBeneficiaries";
import { useCurrencies } from "../hooks/useCurrencies";
import { useOrganisations } from "../hooks/useOrganisations";
import { useTransactionChannels } from "../hooks/useTransactionChannels";
import { useExchangeRates } from "../hooks/useExchangeRates";
import { formatToCurrency } from "../utils/textUtils";
import type { CreateOutboundTransactionRequest } from "../types/TransactionsTypes";

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
}

export const CreateTransactionForm: React.FC<CreateTransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  organisationId,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedOriginCurrency, setSelectedOriginCurrency] =
    useState<string>("");
  const [selectedDestCurrency, setSelectedDestCurrency] = useState<string>("");
  const [selectedRate, setSelectedRate] = useState<string>("");

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
      till_id: "",
      customer_id: "",
      origin_amount: "",
      origin_channel_id: "",
      origin_currency_id: "",
      beneficiary_id: "",
      dest_amount: "",
      dest_channel_id: "",
      dest_currency_id: "",
      rate: "",
      internal_exchange_rate: "",
      inflation: "",
      markup: "",
      purpose: "",
      funds_source: "",
      relationship: "",
      remarks: "",
      exchange_rate_id: "",
      external_exchange_rate_id: "",
      destination_organisation_id: "",
    },
  });

  // Fetch data
  const { data: corridorsData } = useCorridors({
    organisation_id: organisationId,
  });
  const { data: tillsData } = useTills({ organisation_id: organisationId });
  const { data: customersData } = useCustomers({
    organisation_id: organisationId,
  });
  const { data: currenciesData } = useCurrencies();
  const { data: organisationsData } = useOrganisations();
  const { data: channelsData } = useTransactionChannels();
  const { data: exchangeRatesData } = useExchangeRates({
    organisation_id: organisationId,
  });

  // Watch for customer changes to fetch beneficiaries
  const watchedCustomerId = watch("customer_id");
  const { data: beneficiariesData } = useBeneficiaries({
    customer_id: watchedCustomerId,
  });

  // Watch for currency changes to calculate amounts
  const watchedOriginAmount = watch("origin_amount");
  const watchedRate = watch("rate");

  // Calculate destination amount when origin amount or rate changes
  useEffect(() => {
    if (watchedOriginAmount && watchedRate) {
      const originAmount = parseFloat(watchedOriginAmount);
      const rate = parseFloat(watchedRate);
      if (!isNaN(originAmount) && !isNaN(rate)) {
        const destAmount = originAmount * rate;
        setValue("dest_amount", destAmount.toFixed(2));
      }
    }
  }, [watchedOriginAmount, watchedRate, setValue]);

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
      inflation: data.inflation ? parseFloat(data.inflation) : undefined,
      markup: data.markup ? parseFloat(data.markup) : undefined,
      purpose: data.purpose || undefined,
      funds_source: data.funds_source || undefined,
      relationship: data.relationship || undefined,
      remarks: data.remarks || undefined,
      exchange_rate_id: data.exchange_rate_id || undefined,
      external_exchange_rate_id: data.external_exchange_rate_id || undefined,
      destination_organisation_id:
        data.destination_organisation_id || undefined,
    };

    onSubmit(submitData);
  };

  const handleClose = () => {
    reset();
    setSelectedCustomer("");
    setSelectedOriginCurrency("");
    setSelectedDestCurrency("");
    setSelectedRate("");
    onClose();
  };

  const corridors = corridorsData?.data?.corridors || [];
  const tills = tillsData?.data?.tills || [];
  const customers = customersData?.data?.customers || [];
  const beneficiaries = beneficiariesData?.data?.beneficiaries || [];
  const currencies = currenciesData?.data?.currencies || [];
  const organisations = organisationsData?.data?.organisations || [];
  const channels = channelsData?.data?.channels || [];
  const exchangeRates = exchangeRatesData?.data?.exchangeRates || [];

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
            label="Corridor"
            error={errors.corridor_id?.message}
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
                    label: `${corridor.name} (${corridor.base_country.country_code} → ${corridor.destination_country.country_code})`,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select corridor..."
                />
              )}
            />
          </FormItem>

          <FormItem label="Till" error={errors.till_id?.message} required>
            <Controller
              name="till_id"
              control={control}
              rules={{ required: "Till is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={tills.map((till) => ({
                    value: till.id,
                    label: till.name,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select till..."
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Customer (Sender)"
            error={errors.customer_id?.message}
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
                    setSelectedCustomer(value);
                    setValue("beneficiary_id", ""); // Reset beneficiary when customer changes
                  }}
                  placeholder="Select customer..."
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Beneficiary"
            error={errors.beneficiary_id?.message}
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
                    label: `${beneficiary.name} (${beneficiary.bank_name})`,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select beneficiary..."
                  disabled={!watchedCustomerId}
                />
              )}
            />
          </FormItem>
        </div>

        {/* Amount Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Origin Amount"
            error={errors.origin_amount?.message}
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
            label="Origin Currency"
            error={errors.origin_currency_id?.message}
            required
          >
            <Controller
              name="origin_currency_id"
              control={control}
              rules={{ required: "Origin currency is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={currencies.map((currency) => ({
                    value: currency.id,
                    label: `${currency.currency_code} - ${currency.currency_name}`,
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setSelectedOriginCurrency(value);
                  }}
                  placeholder="Select origin currency..."
                />
              )}
            />
          </FormItem>

          <FormItem label="Exchange Rate" error={errors.rate?.message} required>
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
            error={errors.dest_amount?.message}
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

          <FormItem
            label="Destination Currency"
            error={errors.dest_currency_id?.message}
            required
          >
            <Controller
              name="dest_currency_id"
              control={control}
              rules={{ required: "Destination currency is required" }}
              render={({ field }) => (
                <SearchableSelect
                  options={currencies.map((currency) => ({
                    value: currency.id,
                    label: `${currency.currency_code} - ${currency.currency_name}`,
                  }))}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setSelectedDestCurrency(value);
                  }}
                  placeholder="Select destination currency..."
                />
              )}
            />
          </FormItem>

          <FormItem
            label="Destination Organisation"
            error={errors.destination_organisation_id?.message}
          >
            <Controller
              name="destination_organisation_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={organisations
                    .filter((org) => org.id !== organisationId)
                    .map((org) => ({
                      value: org.id,
                      label: `${org.name} (${org.type})`,
                    }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select destination organisation..."
                />
              )}
            />
          </FormItem>
        </div>

        {/* Channel Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem
            label="Origin Channel"
            error={errors.origin_channel_id?.message}
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
            error={errors.dest_channel_id?.message}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormItem
            label="Internal Exchange Rate"
            error={errors.internal_exchange_rate?.message}
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
                  placeholder="Enter internal rate..."
                />
              )}
            />
          </FormItem>

          <FormItem label="Inflation (%)" error={errors.inflation?.message}>
            <Controller
              name="inflation"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  placeholder="Enter inflation..."
                />
              )}
            />
          </FormItem>

          <FormItem label="Markup (%)" error={errors.markup?.message}>
            <Controller
              name="markup"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...field}
                  placeholder="Enter markup..."
                />
              )}
            />
          </FormItem>
        </div>

        {/* Purpose and Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormItem label="Purpose" error={errors.purpose?.message}>
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter transaction purpose..." />
              )}
            />
          </FormItem>

          <FormItem label="Funds Source" error={errors.funds_source?.message}>
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
          <FormItem label="Relationship" error={errors.relationship?.message}>
            <Controller
              name="relationship"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter relationship..." />
              )}
            />
          </FormItem>

          <FormItem
            label="Exchange Rate Reference"
            error={errors.exchange_rate_id?.message}
          >
            <Controller
              name="exchange_rate_id"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  options={exchangeRates.map((rate) => ({
                    value: rate.id,
                    label: `${rate.currency_pair} - ${rate.rate}`,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select exchange rate..."
                />
              )}
            />
          </FormItem>
        </div>

        <FormItem label="Remarks" error={errors.remarks?.message}>
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

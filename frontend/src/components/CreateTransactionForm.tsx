import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "./ui/Modal";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import { SearchableSelect } from "./ui/SearchableSelect";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useCorridorsForTransaction } from "../hooks/useCorridors";
import { useUserTills } from "../hooks/useTills";
import { useCustomers, useCreateCustomer } from "../hooks/useCustomers";
import {
  useBeneficiaries,
  useCreateBeneficiary,
} from "../hooks/useBeneficiaries";
import { useOrganisations } from "../hooks/useOrganisations";
import { useTransactionChannels } from "../hooks/useTransactionChannels";
import { useExchangeRates } from "../hooks/useExchangeRates";
import { useCharges } from "../hooks/useCharges";
import CustomerForm from "./CustomerForm";
import BeneficiaryForm from "./BeneficiaryForm";
import type {
  CreateOutboundTransactionRequest,
  UpdateTransactionRequest,
  Transaction,
  ChargeType,
} from "../types/TransactionsTypes";
import type { UserTill } from "../types/TillsTypes";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../types/CustomersTypes";
import type { CreateBeneficiaryRequest } from "../types/BeneficiariesTypes";
import { formatToCurrencyWithSymbol } from "../utils/textUtils";
import { siteCommonStrings } from "../config";
import { FiPlus } from "react-icons/fi";
import { Tooltip } from "./ui/Tooltip";
import { useValidationRules } from "../hooks/useValidationRules";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateOutboundTransactionRequest | UpdateTransactionRequest
  ) => void;
  isLoading?: boolean;
  organisationId: string;
  mode?: "create" | "edit";
  transaction?: Transaction | null;
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
  amount_payable?: string;
  transaction_charges?: Array<{
    charge_id: string;
    type: ChargeType;
    original_rate: number;
    negotiated_rate: number;
  }>;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  organisationId,
  mode = "create",
  transaction,
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

  const currentOrganisation = organisationsData?.data?.organisations.find(
    (org) => org.id === organisationId
  );

  // Get current user's open till
  const currentUserTill = userTillsData?.data?.userTills?.find(
    (userTill: UserTill) => userTill.status === "OPEN"
  );

  const { data: validationRules } = useValidationRules();
  const customerValidationRulesData =
    validationRules?.data.validationRules.find(
      (rule) => rule.entity === "customer"
    ) || null;
  const beneficiaryValidationRulesData =
    validationRules?.data.validationRules.find(
      (rule) => rule.entity === "beneficiary"
    ) || null;

  const commonStrings = siteCommonStrings;
  const outboundLabel = commonStrings?.outbound;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      corridor_id:
        mode === "edit" && transaction ? transaction.corridor_id : "",
      till_id:
        mode === "edit" && transaction
          ? transaction.till_id
          : currentUserTill?.till_id || "",
      customer_id:
        mode === "edit" && transaction ? transaction.customer_id : "",
      origin_amount:
        mode === "edit" && transaction
          ? transaction.origin_amount?.toString()
          : "",
      origin_channel_id:
        mode === "edit" && transaction ? transaction.origin_channel_id : "",
      origin_currency_id:
        mode === "edit" && transaction
          ? transaction.origin_currency_id
          : currentOrganisation?.base_currency_id || "",
      beneficiary_id:
        mode === "edit" && transaction ? transaction.beneficiary_id : "",
      dest_amount:
        mode === "edit" && transaction
          ? transaction.dest_amount?.toString()
          : "",
      dest_channel_id:
        mode === "edit" && transaction ? transaction.dest_channel_id : "",
      dest_currency_id:
        mode === "edit" && transaction ? transaction.dest_currency_id : "",
      rate: mode === "edit" && transaction ? transaction.rate?.toString() : "1",
      internal_exchange_rate:
        mode === "edit" && transaction
          ? transaction.internal_exchange_rate?.toString()
          : "1",
      inflation:
        mode === "edit" && transaction
          ? transaction.inflation?.toString()
          : "0",
      markup:
        mode === "edit" && transaction ? transaction.markup?.toString() : "0",
      purpose: mode === "edit" && transaction ? transaction.purpose || "" : "",
      funds_source:
        mode === "edit" && transaction ? transaction.funds_source || "" : "",
      relationship:
        mode === "edit" && transaction ? transaction.relationship || "" : "",
      remarks: mode === "edit" && transaction ? transaction.remarks || "" : "",
      exchange_rate_id:
        mode === "edit" && transaction
          ? transaction.exchange_rate_id || ""
          : "",
      external_exchange_rate_id:
        mode === "edit" && transaction
          ? transaction.external_exchange_rate_id || ""
          : "",
      destination_organisation_id:
        mode === "edit" && transaction
          ? transaction.destination_organisation_id || ""
          : "",
      origin_country_id: currentOrganisation?.country_id || "",
      destination_country_id: "",
      amount_payable: "",
      transaction_charges: [],
    },
  });

  // State for charges with negotiated rates
  const [chargesWithRates, setChargesWithRates] = useState<
    Array<{
      charge_id: string;
      name: string;
      type: string;
      original_rate: number;
      negotiated_rate: number;
      amount: number;
      application_method: string;
      min_amount?: number | null;
      max_amount?: number | null;
    }>
  >([]);

  // State for modals
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);

  // Mutations for creating customers and beneficiaries
  const createCustomerMutation = useCreateCustomer();
  const createBeneficiaryMutation = useCreateBeneficiary();

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
  const { data: corridorsData } = useCorridorsForTransaction(
    organisationId, // origin_organisation_id (current user's org)
    watchedOrganisationId || "" // destination_organisation_id (selected partner/agency)
  );
  const corridors = useMemo(
    () => corridorsData?.data?.corridors || [],
    [corridorsData]
  );

  const { data: chargesData } = useCharges({
    origin_organisation_id: organisationId,
    destination_organisation_id: watchedOrganisationId,
  });

  const charges = useMemo(
    () => chargesData?.data?.charges || [],
    [chargesData]
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
            rate.origin_country_id === selectedCorridor.origin_country_id &&
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

  // Initialize charges with negotiated rates when charges data changes
  useEffect(() => {
    if (charges.length > 0) {
      const applicableCharges = charges
        .filter(
          (charge) =>
            charge.status === "ACTIVE" &&
            charge.direction === "OUTBOUND" &&
            (charge.origin_organisation_id === organisationId ||
              !charge.origin_organisation_id)
        )
        .map((charge) => ({
          charge_id: charge.id,
          name: charge.name,
          type: charge.type,
          original_rate: charge.rate,
          negotiated_rate: charge.rate, // Start with original rate
          amount: 0,
          application_method: charge.application_method,
          min_amount: charge.min_amount,
          max_amount: charge.max_amount,
        }));

      setChargesWithRates(applicableCharges);
    }
  }, [charges, organisationId]);

  useEffect(() => {
    if (channels.length > 0) {
      const cashChannel = channels.find((channel) => channel.name === "Cash");
      if (cashChannel) {
        setValue("origin_channel_id", cashChannel.id);
        setValue("dest_channel_id", cashChannel.id);
      }
    }
  }, [channels, setValue]);

  // Populate form with transaction data when in edit mode
  useEffect(() => {
    if (mode === "edit" && transaction && isOpen) {
      console.log("Populating form with transaction:", transaction);

      // Reset form first
      reset();

      // Populate basic fields

      if (transaction.destination_organisation_id) {
        setValue(
          "destination_organisation_id",
          transaction.destination_organisation_id
        );
      }
      if (transaction.corridor_id)
        setValue("corridor_id", transaction.corridor_id);
      if (transaction.till_id) setValue("till_id", transaction.till_id);
      if (transaction.customer_id)
        setValue("customer_id", transaction.customer_id);
      if (transaction.beneficiary_id)
        setValue("beneficiary_id", transaction.beneficiary_id);
      if (transaction.origin_amount)
        setValue("origin_amount", transaction.origin_amount.toString());
      if (transaction.dest_amount)
        setValue("dest_amount", transaction.dest_amount.toString());
      if (transaction.amount_payable)
        setValue("amount_payable", transaction.amount_payable.toString());
      if (transaction.origin_currency_id)
        setValue("origin_currency_id", transaction.origin_currency_id);
      if (transaction.dest_currency_id)
        setValue("dest_currency_id", transaction.dest_currency_id);
      if (transaction.origin_channel_id)
        setValue("origin_channel_id", transaction.origin_channel_id);
      if (transaction.dest_channel_id)
        setValue("dest_channel_id", transaction.dest_channel_id);
      if (transaction.remarks) setValue("remarks", transaction.remarks);
      if (transaction.till_id) setValue("till_id", transaction.till_id);
      if (transaction.exchange_rate_id)
        setValue("exchange_rate_id", transaction.exchange_rate_id);
      if (transaction.external_exchange_rate_id)
        setValue(
          "external_exchange_rate_id",
          transaction.external_exchange_rate_id
        );
      if (transaction.destination_organisation_id)
        setValue(
          "destination_organisation_id",
          transaction.destination_organisation_id
        );
      if (transaction.origin_amount)
        setValue("origin_amount", transaction.origin_amount.toString());
      if (transaction.dest_amount)
        setValue("dest_amount", transaction.dest_amount.toString());
      if (transaction.amount_payable)
        setValue("amount_payable", transaction.amount_payable.toString());
      if (transaction.rate) setValue("rate", transaction.rate.toString());

      if (transaction.purpose) setValue("purpose", transaction.purpose);
      if (transaction.funds_source)
        setValue("funds_source", transaction.funds_source);
      if (transaction.relationship)
        setValue("relationship", transaction.relationship);
      if (transaction.inflation)
        setValue("inflation", transaction.inflation.toString());
      if (transaction.markup) setValue("markup", transaction.markup.toString());
      if (transaction.internal_exchange_rate)
        setValue(
          "internal_exchange_rate",
          transaction.internal_exchange_rate.toString()
        );

      // Populate transaction charges if they exist
      if (
        transaction.transaction_charges &&
        transaction.transaction_charges.length > 0
      ) {
        const chargesData = transaction.transaction_charges.map((charge) => ({
          charge_id: charge.charge_id,
          type: charge.type,
          original_rate: charge.rate || 0,
          negotiated_rate: charge.rate || 0,
        }));
        setValue("transaction_charges", chargesData);

        // Map to the expected format for setChargesWithRates
        const chargesWithRatesData = transaction.transaction_charges.map(
          (charge) => ({
            charge_id: charge.charge_id,
            name: charge.charge?.name || "Unknown Charge",
            type: charge.type,
            original_rate: charge.rate || 0,
            negotiated_rate: charge.rate || 0,
            amount: charge.amount,
            application_method: charge.charge?.application_method || "FIXED",
            min_amount: charge.charge?.min_amount,
            max_amount: charge.charge?.max_amount,
          })
        );
        setChargesWithRates(chargesWithRatesData);
      }
    }
  }, [mode, transaction, isOpen, setValue, reset]);

  // Calculate charges and amounts using negotiated rates
  const calculateChargesAndAmounts = () => {
    if (
      !watchedOriginAmount ||
      !watchedOriginCurrencyId ||
      !watchedDestCurrencyId
    ) {
      return {
        totalCharges: 0,
        destinationAmount: 0,
        amountPayable: 0,
        chargesWithAmounts: [],
      };
    }

    const originAmount = parseFloat(watchedOriginAmount);
    if (isNaN(originAmount))
      return {
        totalCharges: 0,
        destinationAmount: 0,
        amountPayable: 0,
        chargesWithAmounts: [],
      };

    // Calculate charges using negotiated rates
    const chargesWithAmounts = chargesWithRates.map((charge) => {
      let chargeAmount = 0;

      if (charge.application_method === "PERCENTAGE") {
        chargeAmount = (originAmount * charge.negotiated_rate) / 100;
      } else {
        chargeAmount = charge.negotiated_rate;
      }

      // Apply min/max limits if they exist
      if (charge.min_amount && chargeAmount < charge.min_amount) {
        chargeAmount = charge.min_amount;
      }
      if (charge.max_amount && chargeAmount > charge.max_amount) {
        chargeAmount = charge.max_amount;
      }

      return {
        ...charge,
        amount: chargeAmount,
      };
    });

    // Sort charges: non-TAX first, TAX last
    const sortedCharges = chargesWithAmounts.sort((a, b) => {
      if (a.type === "TAX" && b.type !== "TAX") return 1;
      if (a.type !== "TAX" && b.type === "TAX") return -1;
      return 0;
    });

    // Calculate total charges in two passes
    const nonTaxCharges = sortedCharges.filter(
      (charge) => charge.type !== "TAX"
    );
    const taxCharges = sortedCharges.filter((charge) => charge.type === "TAX");

    let nonTaxChargesTotal = 0;
    let totalCharges = 0;

    // First pass: Calculate non-TAX charges
    nonTaxCharges.forEach((charge) => {
      nonTaxChargesTotal += charge.amount;
    });

    // Second pass: Calculate TAX charges based on non-TAX charges total
    taxCharges.forEach((charge) => {
      let taxAmount = 0;
      if (charge.application_method === "PERCENTAGE") {
        taxAmount = (nonTaxChargesTotal * charge.negotiated_rate) / 100;
      } else {
        taxAmount = charge.negotiated_rate;
      }

      // Apply min/max limits for tax
      if (charge.min_amount && taxAmount < charge.min_amount) {
        taxAmount = charge.min_amount;
      }
      if (charge.max_amount && taxAmount > charge.max_amount) {
        taxAmount = charge.max_amount;
      }

      totalCharges += taxAmount;
    });

    // Add non-TAX charges to total
    totalCharges += nonTaxChargesTotal;

    // Calculate amounts according to new formula
    // amount_payable = origin_amount + total_charges
    const amountPayable = originAmount + totalCharges;

    // dest_amount = origin_amount * exchange_rate (converted to beneficiary's currency)
    const rate = parseFloat(watchedRate) || 1;
    const destinationAmount = originAmount * rate;

    return {
      totalCharges,
      destinationAmount,
      amountPayable,
      chargesWithAmounts: sortedCharges,
    };
  };

  const { totalCharges, destinationAmount, amountPayable, chargesWithAmounts } =
    calculateChargesAndAmounts();

  // Update amounts when calculations change
  useEffect(() => {
    if (destinationAmount > 0) {
      setValue("dest_amount", destinationAmount.toFixed(2));
    }
    if (amountPayable > 0) {
      setValue("amount_payable", amountPayable.toFixed(2));
    }
    // Update transaction charges
    setValue(
      "transaction_charges",
      chargesWithAmounts.map((charge) => ({
        charge_id: charge.charge_id,
        type: charge.type as ChargeType,
        original_rate: charge.original_rate,
        negotiated_rate: charge.negotiated_rate,
      }))
    );
  }, [destinationAmount, amountPayable, chargesWithAmounts, setValue]);

  // Handle negotiated rate changes
  const handleRateChange = (chargeId: string, newRate: number) => {
    setChargesWithRates((prevCharges) =>
      prevCharges.map((charge) =>
        charge.charge_id === chargeId
          ? { ...charge, negotiated_rate: newRate }
          : charge
      )
    );
  };

  const handleFormSubmit = (data: FormData) => {
    if (mode === "edit") {
      const submitData: UpdateTransactionRequest = {
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
        origin_country_id: data.origin_country_id || undefined,
        destination_country_id: data.destination_country_id || undefined,
        transaction_charges: data.transaction_charges || undefined,
      };
      console.log("submitData", submitData);
      onSubmit(submitData);
    } else {
      const submitData: CreateOutboundTransactionRequest = {
        corridor_id: data.corridor_id,
        till_id: data.till_id || currentUserTill?.till_id || "",
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
        transaction_charges: data.transaction_charges || undefined,
      };

      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Handle customer creation
  const handleCreateCustomer = (data: CreateCustomerRequest) => {
    createCustomerMutation.mutate(data, {
      onSuccess: (response) => {
        setShowCustomerModal(false);
        // Auto-select the newly created customer
        if (response?.data?.id) {
          setValue("customer_id", response.data.id);
        }
      },
    });
  };

  // Handle beneficiary creation
  const handleCreateBeneficiary = (data: CreateBeneficiaryRequest) => {
    createBeneficiaryMutation.mutate(data, {
      onSuccess: (response) => {
        setShowBeneficiaryModal(false);
        // Auto-select the newly created beneficiary
        if (response?.data?.id) {
          setValue("beneficiary_id", response.data.id);
        }
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        mode === "edit"
          ? `Edit ${outboundLabel} Transaction`
          : `Create ${outboundLabel} Transaction`
      }
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
            <div className="flex gap-2">
              <div className="flex-1">
                <Controller
                  name="customer_id"
                  control={control}
                  rules={{ required: "Customer is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      options={customers.map((customer) => ({
                        value: customer.id,
                        label: `${customer.full_name} - ${customer.phone_number}`,
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
              </div>
              <Tooltip content="Add Customer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomerModal(true)}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <FiPlus className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </FormItem>

          <FormItem
            label="Beneficiary"
            invalid={!!errors.beneficiary_id}
            errorMessage={errors.beneficiary_id?.message}
            required
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <Controller
                  name="beneficiary_id"
                  control={control}
                  rules={{ required: "Beneficiary is required" }}
                  render={({ field }) => (
                    <SearchableSelect
                      options={beneficiaries.map((beneficiary) => ({
                        value: beneficiary.id,
                        label: `${beneficiary.name} - ${beneficiary.phone}`,
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
              </div>
              <Tooltip content="Add Beneficiary">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBeneficiaryModal(true)}
                  disabled={!watchedCustomerId}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <FiPlus className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
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
                    label: `${corridor.name} (${corridor?.origin_country?.code} → ${corridor?.destination_country?.code})`,
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
                        selectedCorridor.origin_country_id
                      );
                      setValue(
                        "destination_country_id",
                        selectedCorridor.destination_country_id
                      );
                      setValue(
                        "dest_currency_id",
                        selectedCorridor?.destination_currency_id || ""
                      );
                      setValue(
                        "origin_currency_id",
                        selectedCorridor?.origin_currency_id || ""
                      );

                      // Auto-populate exchange rate
                      const activeExchangeRate = exchangeRates.find(
                        (rate) =>
                          rate.from_currency_id ===
                            selectedCorridor?.origin_currency_id &&
                          rate.to_currency_id ===
                            selectedCorridor?.destination_currency_id &&
                          rate.origin_country_id ===
                            selectedCorridor.origin_country_id &&
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
            label="Amount To Send"
            invalid={!!errors.origin_amount}
            errorMessage={errors.origin_amount?.message}
            required
          >
            <Controller
              name="origin_amount"
              control={control}
              rules={{
                required: "Amount to send is required",
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
                  placeholder="Enter amount to send..."
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
                  disabled={true}
                />
              )}
            />
          </FormItem>
          <div className="hidden">
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

          {amountPayable > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount Payable
              </label>
              <div className="p-3 bg-green-50 rounded-md border border-green-200">
                <div className="text-lg font-semibold text-green-900">
                  {formatToCurrencyWithSymbol(
                    amountPayable.toFixed(2),
                    currentOrganisation?.base_currency?.currency_code || "USD"
                  )}{" "}
                </div>
                <div className="text-sm text-green-700">
                  Origin Amount + Total Charges
                </div>
              </div>
            </div>
          )}
          {destinationAmount > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Net Destination Amount
              </label>
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-lg font-semibold text-blue-900">
                  {formatToCurrencyWithSymbol(
                    destinationAmount.toFixed(2),
                    watchedDestCurrencyId
                      ? corridors.find((c) => c.id === watchedCorridorId)
                          ?.base_currency?.currency_code || "USD"
                      : "USD"
                  )}{" "}
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Amount To Send converted
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Channel Details */}

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hidden">
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
          </div>
        </div>

        {/* Destination Amount Display */}

        {/* Charges Table */}
        {chargesWithAmounts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Applicable Charges
            </h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charge Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chargesWithAmounts.map((charge) => (
                    <tr key={charge.charge_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {charge.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            charge.type === "TAX"
                              ? "bg-red-100 text-red-800"
                              : charge.type === "COMMISSION"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {charge.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={charge.negotiated_rate}
                            onChange={(e) =>
                              handleRateChange(
                                charge.charge_id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-xs text-gray-500">
                            {charge.application_method === "PERCENTAGE"
                              ? "%"
                              : "Fixed"}
                          </span>
                        </div>
                        {charge.negotiated_rate !== charge.original_rate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Original: {charge.original_rate}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {charge.amount.toFixed(2)}{" "}
                        {currentOrganisation?.base_currency?.currency_code ||
                          "USD"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                    >
                      Total Charges:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      {totalCharges.toFixed(2)}{" "}
                      {currentOrganisation?.base_currency?.currency_code ||
                        "USD"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
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
          <div className="hidden">
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
            {isLoading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update Transaction"
              : "Create Transaction"}
          </Button>
        </div>
      </form>

      {/* Customer Creation Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Create Customer"
        size="xl"
      >
        <CustomerForm
          onSubmit={(data: CreateCustomerRequest | UpdateCustomerRequest) =>
            handleCreateCustomer(data as CreateCustomerRequest)
          }
          isLoading={createCustomerMutation.isPending}
          validationRules={customerValidationRulesData}
        />
      </Modal>

      {/* Beneficiary Creation Modal */}
      <Modal
        isOpen={showBeneficiaryModal}
        onClose={() => setShowBeneficiaryModal(false)}
        title="Create Beneficiary"
        size="xl"
      >
        <BeneficiaryForm
          onSubmit={(data) =>
            handleCreateBeneficiary(data as CreateBeneficiaryRequest)
          }
          isLoading={createBeneficiaryMutation.isPending}
          customerId={watchedCustomerId}
          organisationId={organisationId}
          validationRules={beneficiaryValidationRulesData}
        />
      </Modal>
    </Modal>
  );
};

export default TransactionForm;

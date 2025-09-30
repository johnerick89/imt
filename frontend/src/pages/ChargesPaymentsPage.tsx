import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  usePendingTransactionCharges,
  usePendingChargesStats,
  useChargePaymentsStats,
  useCreateChargesPayment,
  useChargesPayments,
  useApproveChargesPayment,
  useReverseChargesPayment,
} from "../hooks/useChargesPayments";
import { useSession } from "../hooks";
import { useOrganisations } from "../hooks/useOrganisations";
import { useCurrencies } from "../hooks/useCurrencies";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatToCurrency } from "../utils/textUtils";
import type {
  ChargesPayment,
  PendingTransactionChargesFilters,
  ChargesPaymentFilters,
  CreateChargesPaymentRequest,
  ChargeType,
  ChargesPaymentStatus,
  ApproveChargesPaymentRequest,
  ReverseChargesPaymentRequest,
} from "../types/ChargesPaymentTypes";

const ChargesPaymentsPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useSession();
  const navigate = useNavigate();
  const financialOrganisationId = orgId || user?.organisation_id || "";

  // Tab state
  const [activeTab, setActiveTab] = useState<"pending" | "payments">("pending");

  // Pending charges state
  const [pendingFilters, setPendingFilters] =
    useState<PendingTransactionChargesFilters>({
      page: 1,
      limit: 10,
    });
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notes, setNotes] = useState("");

  // Payments state
  const [paymentFilters, setPaymentFilters] = useState<ChargesPaymentFilters>({
    page: 1,
    limit: 10,
  });
  const [selectedPayment, setSelectedPayment] = useState<ChargesPayment | null>(
    null
  );
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [reverseReason, setReverseReason] = useState("");
  const [reverseNotes, setReverseNotes] = useState("");

  // Data fetching
  const { data: pendingChargesData, refetch: refetchPending } =
    usePendingTransactionCharges(financialOrganisationId, pendingFilters);

  const { data: paymentsData, refetch: refetchPayments } = useChargesPayments(
    financialOrganisationId,
    paymentFilters
  );

  const { data: pendingStatsData } = usePendingChargesStats(
    financialOrganisationId
  );
  const { data: paymentsStatsData } = useChargePaymentsStats(
    financialOrganisationId
  );
  const { data: organisationsData } = useOrganisations();
  const { data: currenciesData } = useCurrencies({ limit: 1000 });

  // Mutations
  const createChargesPaymentMutation = useCreateChargesPayment();
  const approveMutation = useApproveChargesPayment();
  const reverseMutation = useReverseChargesPayment();

  // Computed values
  const pendingCharges = useMemo(
    () => pendingChargesData?.data?.transaction_charges || [],
    [pendingChargesData]
  );
  const pendingPagination = useMemo(
    () => pendingChargesData?.data?.pagination,
    [pendingChargesData]
  );
  const payments = useMemo(
    () => paymentsData?.data?.charges_payments || [],
    [paymentsData]
  );
  const paymentsPagination = useMemo(
    () => paymentsData?.data?.pagination,
    [paymentsData]
  );
  const pendingStats = pendingStatsData?.data;
  const paymentsStats = paymentsStatsData?.data;

  const organisations = useMemo(
    () =>
      organisationsData?.data?.organisations.filter(
        (org) => org.id !== financialOrganisationId
      ) || [],
    [organisationsData, financialOrganisationId]
  );

  const currencies = useMemo(
    () => currenciesData?.data?.currencies || [],
    [currenciesData]
  );

  // Pending charges handlers
  const handleSelectAll = () => {
    if (selectedCharges.length === pendingCharges.length) {
      setSelectedCharges([]);
    } else {
      setSelectedCharges(pendingCharges.map((charge) => charge.id));
    }
  };

  const handleSelectCharge = (chargeId: string) => {
    setSelectedCharges((prev) =>
      prev.includes(chargeId)
        ? prev.filter((id) => id !== chargeId)
        : [...prev, chargeId]
    );
  };

  const handleCreatePayment = async () => {
    if (selectedCharges.length === 0) {
      return;
    }

    try {
      const data: CreateChargesPaymentRequest = {
        transaction_charge_ids: selectedCharges,
        notes: notes || undefined,
      };

      await createChargesPaymentMutation.mutateAsync({
        organisationId: financialOrganisationId,
        data,
      });

      setShowCreateModal(false);
      setSelectedCharges([]);
      setNotes("");
      refetchPending();
      refetchPayments();
    } catch (error) {
      console.error("Error creating charges payment:", error);
    }
  };

  // Payment handlers
  const handleApprove = async () => {
    console.log("selectedPayment", selectedPayment);
    if (!selectedPayment) return;

    try {
      const data: ApproveChargesPaymentRequest = {
        notes: approveNotes || undefined,
      };

      await approveMutation.mutateAsync({
        paymentId: selectedPayment.id,
        data,
      });

      setShowApproveModal(false);
      setSelectedPayment(null);
      setApproveNotes("");
      refetchPayments();
    } catch (error) {
      console.error("Error approving charges payment:", error);
    }
  };

  const handleReverse = async () => {
    if (!selectedPayment) return;

    try {
      const data: ReverseChargesPaymentRequest = {
        reason: reverseReason,
        notes: reverseNotes || undefined,
      };

      await reverseMutation.mutateAsync({
        paymentId: selectedPayment.id,
        data,
      });

      setShowReverseModal(false);
      setSelectedPayment(null);
      setReverseReason("");
      setReverseNotes("");
      refetchPayments();
    } catch (error) {
      console.error("Error reversing charges payment:", error);
    }
  };

  const getChargeTypeColor = (type: ChargeType) => {
    switch (type) {
      case "TAX":
        return "bg-red-100 text-red-800";
      case "COMMISSION":
        return "bg-blue-100 text-blue-800";
      case "INTERNAL_FEE":
        return "bg-green-100 text-green-800";
      case "OTHER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Charges Payments</h1>
        <Button
          onClick={() =>
            activeTab === "pending" ? refetchPending() : refetchPayments()
          }
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Payments
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Charge Payments
            </button>
          </nav>
        </div>
      </div>

      {/* Pending Payments Tab */}
      {activeTab === "pending" && (
        <>
          {/* Pending Charges Stats */}
          {pendingStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Pending Charges
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pendingStats.totalPendingCharges}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Pending Amount
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatToCurrency(pendingStats.totalPendingAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Tax Charges
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pendingStats.byType.find((t) => t.type === "TAX")
                        ?.count || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Other Charges
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pendingStats.byType.find((t) => t.type === "OTHER")
                        ?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search charges..."
                value={pendingFilters.search || ""}
                onChange={(e) =>
                  setPendingFilters({
                    ...pendingFilters,
                    search: e.target.value,
                    page: 1,
                  })
                }
              />
              <SearchableSelect
                placeholder="Select charge type"
                value={pendingFilters.type || ""}
                onChange={(value) =>
                  setPendingFilters({
                    ...pendingFilters,
                    type: value as ChargeType,
                    page: 1,
                  })
                }
                options={[
                  { value: "TAX", label: "Tax" },
                  { value: "COMMISSION", label: "Commission" },
                  { value: "INTERNAL_FEE", label: "Internal Fee" },
                  { value: "OTHER", label: "Other" },
                ]}
              />
              <SearchableSelect
                placeholder="Select destination org"
                value={pendingFilters.destination_org_id || ""}
                onChange={(value) =>
                  setPendingFilters({
                    ...pendingFilters,
                    destination_org_id: value,
                    page: 1,
                  })
                }
                options={organisations.map((org) => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
              <SearchableSelect
                placeholder="Select currency"
                value={pendingFilters.currency_id || ""}
                onChange={(value) =>
                  setPendingFilters({
                    ...pendingFilters,
                    currency_id: value,
                    page: 1,
                  })
                }
                options={currencies.map((currency) => ({
                  value: currency.id,
                  label: currency.currency_code,
                }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                type="date"
                placeholder="From Date"
                value={pendingFilters.date_from || ""}
                onChange={(e) =>
                  setPendingFilters({
                    ...pendingFilters,
                    date_from: e.target.value,
                    page: 1,
                  })
                }
              />
              <Input
                type="date"
                placeholder="To Date"
                value={pendingFilters.date_to || ""}
                onChange={(e) =>
                  setPendingFilters({
                    ...pendingFilters,
                    date_to: e.target.value,
                    page: 1,
                  })
                }
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedCharges.length === pendingCharges.length &&
                      pendingCharges.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Select All</span>
                </label>
                <span className="text-sm text-gray-500">
                  {selectedCharges.length} of {pendingCharges.length} selected
                </span>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                disabled={selectedCharges.length === 0}
              >
                Process Charges Payment
              </Button>
            </div>
          </div>

          {/* Pending Charges Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination Organisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charge Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Internal Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      External Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingCharges.map((charge) => (
                    <tr key={charge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCharges.includes(charge.id)}
                          onChange={() => handleSelectCharge(charge.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {charge.transaction?.transaction_no || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {charge.transaction?.destination_organisation?.name ||
                          "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChargeTypeColor(
                            charge.type
                          )}`}
                        >
                          {charge.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatToCurrency(charge.amount)}{" "}
                        {charge.transaction?.origin_currency?.currency_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {charge.internal_amount
                          ? formatToCurrency(charge.internal_amount)
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {charge.external_amount
                          ? formatToCurrency(charge.external_amount)
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {charge.transaction?.customer
                          ? `${charge.transaction.customer.full_name}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {charge.created_at
                          ? new Date(charge.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pendingPagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    disabled={pendingFilters.page === 1}
                    onClick={() =>
                      setPendingFilters({
                        ...pendingFilters,
                        page: (pendingFilters.page || 1) - 1,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      pendingFilters.page === pendingPagination.totalPages
                    }
                    onClick={() =>
                      setPendingFilters({
                        ...pendingFilters,
                        page: (pendingFilters.page || 1) + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(pendingPagination.page - 1) *
                          pendingPagination.limit +
                          1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          pendingPagination.page * pendingPagination.limit,
                          pendingPagination.total
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {pendingPagination.total}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingFilters.page === 1}
                        onClick={() =>
                          setPendingFilters({
                            ...pendingFilters,
                            page: (pendingFilters.page || 1) - 1,
                          })
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          pendingFilters.page === pendingPagination.totalPages
                        }
                        onClick={() =>
                          setPendingFilters({
                            ...pendingFilters,
                            page: (pendingFilters.page || 1) + 1,
                          })
                        }
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Charge Payments Tab */}
      {activeTab === "payments" && (
        <>
          {/* Charge Payments Stats */}
          {paymentsStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Pending Approval
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {paymentsStats.totalPendingCharges}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Approved
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {paymentsStats.totalCompletedPayments || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Pending Amount
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatToCurrency(paymentsStats.totalPendingAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Approved Amount
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatToCurrency(
                        paymentsStats.totalCompletedAmount || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search payments..."
                value={paymentFilters.search || ""}
                onChange={(e) =>
                  setPaymentFilters({
                    ...paymentFilters,
                    search: e.target.value,
                    page: 1,
                  })
                }
              />
              <SearchableSelect
                placeholder="Select charge type"
                value={paymentFilters.type || ""}
                onChange={(value) =>
                  setPaymentFilters({
                    ...paymentFilters,
                    type: value as ChargeType,
                    page: 1,
                  })
                }
                options={[
                  { value: "TAX", label: "Tax" },
                  { value: "COMMISSION", label: "Commission" },
                  { value: "INTERNAL_FEE", label: "Internal Fee" },
                  { value: "OTHER", label: "Other" },
                ]}
              />
              <SearchableSelect
                placeholder="Select status"
                value={paymentFilters.status || ""}
                onChange={(value) =>
                  setPaymentFilters({
                    ...paymentFilters,
                    status: value as ChargesPaymentStatus,
                    page: 1,
                  })
                }
                options={[
                  { value: "PENDING", label: "Pending" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "FAILED", label: "Failed" },
                ]}
              />
              <SearchableSelect
                placeholder="Select destination org"
                value={paymentFilters.destination_org_id || ""}
                onChange={(value) =>
                  setPaymentFilters({
                    ...paymentFilters,
                    destination_org_id: value,
                    page: 1,
                  })
                }
                options={organisations.map((org) => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <SearchableSelect
                placeholder="Select currency"
                value={paymentFilters.currency_id || ""}
                onChange={(value) =>
                  setPaymentFilters({
                    ...paymentFilters,
                    currency_id: value,
                    page: 1,
                  })
                }
                options={currencies.map((currency) => ({
                  value: currency.id,
                  label: currency.currency_code,
                }))}
              />
              <Input
                type="date"
                placeholder="From Date"
                value={paymentFilters.date_from || ""}
                onChange={(e) =>
                  setPaymentFilters({
                    ...paymentFilters,
                    date_from: e.target.value,
                    page: 1,
                  })
                }
              />
              <Input
                type="date"
                placeholder="To Date"
                value={paymentFilters.date_to || ""}
                onChange={(e) =>
                  setPaymentFilters({
                    ...paymentFilters,
                    date_to: e.target.value,
                    page: 1,
                  })
                }
              />
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination Org
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Internal Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      External Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.reference_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.destination_org?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChargeTypeColor(
                            payment.type
                          )}`}
                        >
                          {payment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatToCurrency(payment.internal_total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatToCurrency(payment.external_total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.currency?.currency_code || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/charges-payments/${payment.id}`)
                          }
                        >
                          View
                        </Button>
                        {payment.status === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowApproveModal(true);
                            }}
                          >
                            Approve
                          </Button>
                        )}
                        {payment.status === "COMPLETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowReverseModal(true);
                            }}
                          >
                            Reverse
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paymentsPagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    disabled={paymentFilters.page === 1}
                    onClick={() =>
                      setPaymentFilters({
                        ...paymentFilters,
                        page: (paymentFilters.page || 1) - 1,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={
                      paymentFilters.page === paymentsPagination.totalPages
                    }
                    onClick={() =>
                      setPaymentFilters({
                        ...paymentFilters,
                        page: (paymentFilters.page || 1) + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(paymentsPagination.page - 1) *
                          paymentsPagination.limit +
                          1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          paymentsPagination.page * paymentsPagination.limit,
                          paymentsPagination.total
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {paymentsPagination.total}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paymentFilters.page === 1}
                        onClick={() =>
                          setPaymentFilters({
                            ...paymentFilters,
                            page: (paymentFilters.page || 1) - 1,
                          })
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          paymentFilters.page === paymentsPagination.totalPages
                        }
                        onClick={() =>
                          setPaymentFilters({
                            ...paymentFilters,
                            page: (paymentFilters.page || 1) + 1,
                          })
                        }
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Payment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Charges Payment"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Enter notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Selected Charges:</strong> {selectedCharges.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Charges will be automatically grouped by charge type and
              destination organization.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePayment}
              disabled={selectedCharges.length === 0}
            >
              Create Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Charges Payment"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to approve this charges payment? This action
            will mark the payment as completed and update the transaction
            charges status.
          </p>
          {selectedPayment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <strong>Reference:</strong> {selectedPayment.reference_number}
              </p>
              <p>
                <strong>Type:</strong> {selectedPayment.type}
              </p>
              <p>
                <strong>Internal Amount:</strong>{" "}
                {formatToCurrency(selectedPayment.internal_total_amount)}{" "}
                {selectedPayment.currency?.currency_code}
              </p>
              <p>
                <strong>External Amount:</strong>{" "}
                {formatToCurrency(selectedPayment.external_total_amount)}{" "}
                {selectedPayment.currency?.currency_code}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Enter approval notes..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowApproveModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve Payment</Button>
          </div>
        </div>
      </Modal>

      {/* Reverse Modal */}
      <Modal
        isOpen={showReverseModal}
        onClose={() => setShowReverseModal(false)}
        title="Reverse Charges Payment"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to reverse this charges payment? This action
            cannot be undone and will mark the payment as failed.
          </p>
          {selectedPayment && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <strong>Reference:</strong> {selectedPayment.reference_number}
              </p>
              <p>
                <strong>Type:</strong> {selectedPayment.type}
              </p>
              <p>
                <strong>Internal Amount:</strong>{" "}
                {formatToCurrency(selectedPayment.internal_total_amount)}{" "}
                {selectedPayment.currency?.currency_code}
              </p>
              <p>
                <strong>External Amount:</strong>{" "}
                {formatToCurrency(selectedPayment.external_total_amount)}{" "}
                {selectedPayment.currency?.currency_code}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <Input
              placeholder="Enter reason for reversal..."
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Enter additional notes..."
              value={reverseNotes}
              onChange={(e) => setReverseNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowReverseModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReverse} disabled={!reverseReason.trim()}>
              Reverse Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChargesPaymentsPage;

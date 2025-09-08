import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiPlus, FiFilter, FiRefreshCw } from "react-icons/fi";
import { Modal } from "../components/ui/Modal";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { FormItem } from "../components/ui/FormItem";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import {
  useSession,
  useCurrencies,
  useOrganisations,
  useBankAccounts,
} from "../hooks";
import {
  useOrgBalances,
  useOrgBalanceStats,
  usePrefundOrganisation,
} from "../hooks/useBalanceOperations";
import { formatToCurrency } from "../utils/textUtils";
import type {
  OrgBalance,
  OrgBalanceFilters,
  PrefundRequest,
} from "../types/BalanceOperationsTypes";
import type { ColumnDef } from "@tanstack/react-table";
import type { BankAccount } from "../types/BankAccountsTypes";

const OrganisationBalancesPage: React.FC = () => {
  const { user } = useSession();

  // Filter state
  const [filters, setFilters] = useState<OrgBalanceFilters>({
    page: 1,
    limit: 10,
    search: "",
    base_org_id: user?.organisation_id || "",
  });

  // Modal states
  const [showPrefundModal, setShowPrefundModal] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<
    string | null
  >(null);

  // Data fetching
  const { data: balancesData, isLoading: balancesLoading } =
    useOrgBalances(filters);
  const { data: statsData } = useOrgBalanceStats(user?.organisation_id);
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: organisationsData } = useOrganisations({ limit: 1000 });
  const { data: bankAccountsData } = useBankAccounts({ limit: 1000 });

  const balances = balancesData?.data?.balances || [];
  const stats = statsData?.data;
  const currencies = currenciesData?.data?.currencies || [];
  const organisations = organisationsData?.data?.organisations || [];
  const bankAccounts = bankAccountsData?.data?.bankAccounts || [];

  // Mutations
  const prefundOrganisationMutation = usePrefundOrganisation();

  // Handlers
  const handleFilterChange = (
    field: keyof OrgBalanceFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? (value as number) : 1,
    }));
  };

  const handlePrefundOrganisation = async (data: PrefundRequest) => {
    if (!selectedOrganisation) return;

    try {
      await prefundOrganisationMutation.mutateAsync({
        orgId: selectedOrganisation,
        data,
      });
      setShowPrefundModal(false);
      setSelectedOrganisation(null);
    } catch (error) {
      console.error("Error prefunding organisation:", error);
    }
  };

  const openPrefundModal = (orgId: string) => {
    setSelectedOrganisation(orgId);
    setShowPrefundModal(true);
  };

  // Table columns
  const columns: ColumnDef<OrgBalance>[] = [
    {
      accessorKey: "base_org",
      header: "Base Organisation",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.base_org.name}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.base_org.type}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dest_org",
      header: "Destination Organisation",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.dest_org.name}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.dest_org.type}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {row.original.currency.currency_code}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          <div className="font-medium">
            {formatToCurrency(row.original.balance) +
              " " +
              row.original.currency.currency_code}
          </div>
          {row.original.locked_balance && row.original.locked_balance > 0 && (
            <div className="text-xs text-gray-500">
              Locked:{" "}
              {formatToCurrency(row.original.locked_balance) +
                " " +
                row.original.currency.currency_code}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {new Date(row.original.created_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => openPrefundModal(row.original.base_org_id)}
            size="sm"
            variant="outline"
            className="text-green-600 hover:text-green-700"
          >
            <FiPlus className="h-4 w-4 mr-1" />
            Prefund
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Organisation Balances
          </h1>
          <p className="text-gray-600">
            Manage organisation balances and prefunding
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiRefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Balances
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBalances}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiRefreshCw className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatToCurrency(stats.totalBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiRefreshCw className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Locked Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatToCurrency(stats.totalLockedBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiRefreshCw className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Available Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatToCurrency(
                    stats.totalBalance - stats.totalLockedBalance
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by organisation name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Organisation
            </label>
            <SearchableSelect
              value={filters.base_org_id || ""}
              onChange={(value) => handleFilterChange("base_org_id", value)}
              options={organisations.map((org) => ({
                value: org.id,
                label: `${org.name} (${org.type})`,
              }))}
              placeholder="Filter by base organisation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <SearchableSelect
              value={filters.currency_id || ""}
              onChange={(value) => handleFilterChange("currency_id", value)}
              options={currencies.map((currency) => ({
                value: currency.id,
                label: `${currency.currency_code} - ${currency.currency_name}`,
              }))}
              placeholder="Filter by currency"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 10,
                  search: "",
                  base_org_id: user?.organisation_id || "",
                  currency_id: "",
                })
              }
              variant="outline"
              className="w-full"
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={balances}
          loading={balancesLoading}
          emptyMessage="No organisation balances found"
        />
      </div>

      {/* Pagination */}
      {balancesData?.data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{" "}
            {Math.min(
              (filters.page || 1) * (filters.limit || 10),
              balancesData.data.pagination.total
            )}{" "}
            of {balancesData.data.pagination.total} results
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                handleFilterChange("page", (filters.page || 1) - 1)
              }
              disabled={filters.page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                handleFilterChange("page", (filters.page || 1) + 1)
              }
              disabled={
                (filters.page || 1) >= balancesData.data.pagination.totalPages
              }
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Prefund Modal */}
      <PrefundModal
        isOpen={showPrefundModal}
        onClose={() => {
          setShowPrefundModal(false);
          setSelectedOrganisation(null);
        }}
        onSubmit={handlePrefundOrganisation}
        isLoading={prefundOrganisationMutation.isPending}
        bankAccounts={bankAccounts}
      />
    </div>
  );
};

// Prefund Modal Component
interface PrefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrefundRequest) => void;
  isLoading?: boolean;
  bankAccounts: BankAccount[];
}

const PrefundModal: React.FC<PrefundModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  bankAccounts,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrefundRequest>({
    defaultValues: {
      amount: 0,
      source_type: "BANK_ACCOUNT",
      source_id: "",
      description: "",
    },
  });

  const handleFormSubmit = (data: PrefundRequest) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Prefund Organisation"
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormItem
          label="Amount"
          required
          invalid={!!errors.amount}
          errorMessage={errors.amount?.message}
        >
          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Amount is required",
              min: { value: 0.01, message: "Amount must be greater than 0" },
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="Enter amount"
                disabled={isLoading}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
              />
            )}
          />
        </FormItem>

        <FormItem
          label="Source Bank Account"
          required
          invalid={!!errors.source_id}
          errorMessage={errors.source_id?.message}
        >
          <Controller
            name="source_id"
            control={control}
            rules={{ required: "Source bank account is required" }}
            render={({ field }) => (
              <SearchableSelect
                {...field}
                options={bankAccounts.map((account) => ({
                  value: account.id,
                  label: `${account.name} - ${account.bank_name} (${account.currency.currency_code})`,
                }))}
                placeholder="Select source bank account"
                disabled={isLoading}
                invalid={!!errors.source_id}
              />
            )}
          />
        </FormItem>

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
                placeholder="Enter description (optional)"
                rows={3}
                disabled={isLoading}
              />
            )}
          />
        </FormItem>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Prefund"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OrganisationBalancesPage;

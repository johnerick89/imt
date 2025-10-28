import React, { useState } from "react";
import { FiFilter, FiRefreshCw, FiPlus, FiX } from "react-icons/fi";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import OrgBalancesTable from "./dataTables/OrgBalancesTable";
import {
  useSession,
  useCurrencies,
  useOrganisations,
  useBankAccounts,
  useOrganisation,
} from "../hooks";
import {
  useOrgBalances,
  useOrgBalanceStats,
  usePrefundOrganisation,
  useCreateAgencyFloat,
  useUpdateFloatLimit,
  useReduceOrganisationFloat,
  useTriggerClosePeriodicBalancesJob,
} from "../hooks/useBalanceOperations";
import { formatToCurrency } from "../utils/textUtils";
import type {
  OrgBalanceFilters,
  PrefundRequest,
  AgencyFloatRequest,
  OrgBalance,
} from "../types/BalanceOperationsTypes";
import type { Organisation } from "../types/OrganisationsTypes";
import PrefundModal from "./modals/PrefundModal";
import AgencyFloatModal from "./modals/AgencyFloatModal";
import { usePermissions } from "../hooks/usePermissions";

const OrgBalances: React.FC = () => {
  const { user } = useSession();
  const { canCreateOrgFloatBalances } = usePermissions();
  const { data: currentOrganisationData } = useOrganisation(
    user?.organisation_id || ""
  );
  const currentOrganisation = currentOrganisationData?.data;
  const isAgencyOrganisation = currentOrganisation?.type !== "CUSTOMER";

  // Filter state
  const [filters, setFilters] = useState<OrgBalanceFilters>({
    page: 1,
    limit: 10,
    search: "",
    ...(isAgencyOrganisation
      ? { dest_org_id: user?.organisation_id || "" }
      : {}),
  });

  // Modal states
  const [showPrefundModal, setShowPrefundModal] = useState(false);
  const [showAgencyFloatModal, setShowAgencyFloatModal] = useState(false);
  const [showReduceFloatModal, setShowReduceFloatModal] = useState(false);
  const [showClosePeriodicModal, setShowClosePeriodicModal] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<
    string | null
  >(null);

  // Data fetching
  const { data: balancesData, isLoading: balancesLoading } =
    useOrgBalances(filters);
  const { data: statsData } = useOrgBalanceStats(user?.organisation_id);
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: organisationsData } = useOrganisations({ limit: 100 });
  const { data: bankAccountsData } = useBankAccounts({
    limit: 1000,
    organisation_id: user?.organisation_id,
  });

  const allBalances = balancesData?.data?.balances || [];
  const stats = statsData?.data;
  const currencies = currenciesData?.data?.currencies || [];
  const organisations = organisationsData?.data?.organisations || [];
  const bankAccounts = bankAccountsData?.data?.bankAccounts || [];

  // Separate main float balances (self-balances) from agency float balances
  const mainFloatBalances = allBalances.filter(
    (balance) => balance.base_org_id === balance.dest_org_id
  );
  const agencyFloatBalances = allBalances.filter(
    (balance) => balance.base_org_id !== balance.dest_org_id
  );

  // Mutations
  const prefundOrganisationMutation = usePrefundOrganisation();
  const createAgencyFloatMutation = useCreateAgencyFloat();
  const updateFloatLimitMutation = useUpdateFloatLimit();
  const reduceOrganisationFloatMutation = useReduceOrganisationFloat();
  const triggerClosePeriodicJobMutation = useTriggerClosePeriodicBalancesJob();

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

  const handleCreateAgencyFloat = async (data: AgencyFloatRequest) => {
    try {
      console.log("data", data);
      await createAgencyFloatMutation.mutateAsync(data);
      setShowAgencyFloatModal(false);
    } catch (error) {
      console.error("Failed to create agency float:", error);
    }
  };

  const handleEditLimit = async (balance: OrgBalance) => {
    try {
      await updateFloatLimitMutation.mutateAsync({
        balanceId: balance.id,
        limit: balance.limit || 0,
      });
    } catch (error) {
      console.error("Failed to update float limit:", error);
    }
  };

  const openPrefundModal = (orgId: string) => {
    setSelectedOrganisation(orgId);
    setShowPrefundModal(true);
  };

  const openAgencyFloatTopupModal = (orgId: string) => {
    setSelectedOrganisation(orgId);
    setShowAgencyFloatModal(true);
  };

  // Get the selected balance for edit mode
  const selectedBalance = allBalances.find(
    (balance) => balance.dest_org_id === selectedOrganisation
  );

  const openReduceFloatModal = (orgId: string) => {
    setSelectedOrganisation(orgId);
    setShowReduceFloatModal(true);
  };

  const handleTriggerClosePeriodicJob = async () => {
    try {
      await triggerClosePeriodicJobMutation.mutateAsync();
      setShowClosePeriodicModal(false);
    } catch (error) {
      console.error("Failed to trigger close periodic job:", error);
    }
  };

  const handleReduceOrganisationFloat = async (data: AgencyFloatRequest) => {
    try {
      await reduceOrganisationFloatMutation.mutateAsync(data);
      setShowReduceFloatModal(false);
      setSelectedOrganisation(null);
    } catch (error) {
      console.error("Failed to reduce organisation float:", error);
    }
  };

  // const agencyOrganisations = organisations.filter(
  //   (org) => org.type === "AGENCY" || org.type === "PARTNER"
  // );

  const agencyOrganisations = organisations;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Float Balances</h1>
          <p className="text-gray-600">
            Manage organisation float balances and prefunding
          </p>
        </div>
        <div className="flex gap-3">
          {canCreateOrgFloatBalances() && (
            <button
              onClick={() => setShowAgencyFloatModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Agency Float
            </button>
          )}
          {canCreateOrgFloatBalances() && (
            <button
              onClick={() => setShowClosePeriodicModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              Close Periodic Balances
            </button>
          )}
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

      {/* Main Float Balance Section */}
      {mainFloatBalances.length > 0 && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Main Float Balance
                </h2>
                <p className="text-sm text-gray-600">
                  Your organisation's internal float balance
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {mainFloatBalances.length} balance
                {mainFloatBalances.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <OrgBalancesTable
            data={mainFloatBalances}
            loading={balancesLoading}
            onPrefund={openPrefundModal}
            onEditLimit={handleEditLimit}
            mainFloat={true}
          />
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

          {!isAgencyOrganisation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destiantion Organisation
              </label>
              <SearchableSelect
                value={filters.dest_org_id || ""}
                onChange={(value) => handleFilterChange("dest_org_id", value)}
                options={organisations?.map((org) => ({
                  value: org.id,
                  label: `${org.name} (${org.type})`,
                }))}
                placeholder="Filter by destination organisation"
              />
            </div>
          )}

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

      {/* Agency Float Balances Section */}
      {agencyFloatBalances.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Agency Float Balances
                </h2>
                <p className="text-sm text-gray-600">
                  Float balances with partner agencies and organisations
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {agencyFloatBalances.length} balance
                {agencyFloatBalances.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <OrgBalancesTable
            data={agencyFloatBalances}
            loading={balancesLoading}
            onPrefund={openAgencyFloatTopupModal}
            onEditLimit={handleEditLimit}
            mainFloat={false}
            onReduceFloat={openReduceFloatModal}
          />
        </div>
      )}

      {/* No balances message */}
      {allBalances.length === 0 && !balancesLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-500">
            <FiRefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Float Balances Found
            </h3>
            <p className="text-gray-600">
              No float balances have been created yet. Create an agency float to
              get started.
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {balancesData?.data?.pagination && allBalances.length > 0 && (
        <div className="flex items-center justify-between mt-6">
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
        currencies={currencies}
        defaultCurrencyId={currentOrganisation?.base_currency_id || undefined}
        balanceExists={true}
      />

      {/* Agency Float Modal */}
      <AgencyFloatModal
        isOpen={showAgencyFloatModal}
        onClose={() => {
          setShowAgencyFloatModal(false);
          setSelectedOrganisation(null);
        }}
        onSubmit={(data) => handleCreateAgencyFloat(data as AgencyFloatRequest)}
        isLoading={createAgencyFloatMutation.isPending}
        bankAccounts={bankAccounts}
        agencies={agencyOrganisations || []}
        selectedOrganisationId={selectedOrganisation || ""}
        defaultCurrencyId={currentOrganisation?.base_currency_id || ""}
        mode={selectedBalance ? "edit" : "create"}
        existingBalance={
          selectedBalance
            ? {
                agency: selectedBalance.dest_org as Organisation,
                currency: selectedBalance.currency,
              }
            : undefined
        }
      />

      {/* Reduce Float Modal */}
      <AgencyFloatModal
        isOpen={showReduceFloatModal}
        onClose={() => {
          setShowReduceFloatModal(false);
          setSelectedOrganisation(null);
        }}
        onSubmit={(data) =>
          handleReduceOrganisationFloat(data as AgencyFloatRequest)
        }
        isLoading={reduceOrganisationFloatMutation.isPending}
        bankAccounts={bankAccounts}
        agencies={[]}
        selectedOrganisationId={selectedOrganisation || ""}
        defaultCurrencyId={currentOrganisation?.base_currency_id || ""}
        mode="reduce"
        title="Reduce Agency Float"
        existingBalance={
          selectedBalance
            ? {
                agency: selectedBalance.dest_org as Organisation,
                currency: selectedBalance.currency,
              }
            : undefined
        }
      />

      {/* Close Periodic Balances Confirm Modal */}
      {showClosePeriodicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Close Periodic Balances
              </h2>
              <button
                onClick={() => setShowClosePeriodicModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-700">
                  This action will close all current periodic org balances and
                  create new ones for the next period. This is typically done at
                  the end of each month to finalize the current period's
                  transactions.
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-900">
                  Are you sure you want to proceed?
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowClosePeriodicModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerClosePeriodicJob}
                  disabled={triggerClosePeriodicJobMutation.isPending}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {triggerClosePeriodicJobMutation.isPending
                    ? "Processing..."
                    : "Close Periodic Balances"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrgBalances;

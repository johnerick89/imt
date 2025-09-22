import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useOrganisation,
  useIntegrations,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useCorridors,
  useCreateCorridor,
  useUpdateCorridor,
  useDeleteCorridor,
  useCharges,
  useCreateCharge,
  useUpdateCharge,
  useDeleteCharge,
  useSession,
  useCurrencies,
  useBankAccounts,
} from "../hooks";
import {
  useOrgBalanceHistory,
  useSetOpeningBalance,
  usePrefundOrganisation,
} from "../hooks/useBalanceOperations";
import { StatusBadge } from "../components/ui/StatusBadge";
// import { ActionCell } from "../components/ActionCell";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import IntegrationForm from "../components/IntegrationForm";
import IntegrationsTable from "../components/IntegrationsTable";
import CorridorForm from "../components/CorridorForm";
import CorridorsTable from "../components/CorridorsTable";
import ChargeForm from "../components/ChargeForm";
import ChargesTable from "../components/ChargesTable";
import type {
  Integration,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  IntegrationStatus,
} from "../types/IntegrationsTypes";
import type {
  Corridor,
  CreateCorridorRequest,
  UpdateCorridorRequest,
} from "../types/CorridorsTypes";
import type {
  Charge,
  CreateChargeRequest,
  UpdateChargeRequest,
} from "../types/ChargesTypes";
import type {
  OpeningBalanceRequest,
  PrefundRequest,
  BalanceHistoryFilters,
} from "../types/BalanceOperationsTypes";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { FormItem } from "../components/ui/FormItem";
import { formatToCurrency } from "../utils/textUtils";

const OrganisationProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("corridors");
  const { user } = useSession();

  // Balance-related state
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false);
  const [showPrefundModal, setShowPrefundModal] = useState(false);
  const [openingBalanceForm, setOpeningBalanceForm] = useState({
    amount: "",
    currency_id: "",
    description: "",
  });
  const [prefundForm, setPrefundForm] = useState({
    amount: "",
    source_id: "",
    description: "",
  });
  const [balanceHistoryFilters] = useState<BalanceHistoryFilters>({
    page: 1,
    limit: 10,
  });
  // Integration state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [integrationToDelete, setIntegrationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Corridor state
  const [showCreateCorridorModal, setShowCreateCorridorModal] = useState(false);
  const [showEditCorridorModal, setShowEditCorridorModal] = useState(false);
  const [showDeleteCorridorModal, setShowDeleteCorridorModal] = useState(false);
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(
    null
  );
  const [corridorToDelete, setCorridorToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Charge state
  const [showCreateChargeModal, setShowCreateChargeModal] = useState(false);
  const [showEditChargeModal, setShowEditChargeModal] = useState(false);
  const [showDeleteChargeModal, setShowDeleteChargeModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [chargeToDelete, setChargeToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: organisationData,
    isLoading,
    error,
  } = useOrganisation(id || "");

  // Integration hooks - show integrations where current user's org is origin and target org is the viewed org
  const { data: integrationsData, isLoading: integrationsLoading } =
    useIntegrations({
      origin_organisation_id: user?.organisation_id || "",
      organisation_id: id || "",
    });

  const createIntegrationMutation = useCreateIntegration();
  const updateIntegrationMutation = useUpdateIntegration();
  const deleteIntegrationMutation = useDeleteIntegration();

  // Corridor hooks
  const { data: corridorsData, isLoading: corridorsLoading } = useCorridors({
    organisation_id: id,
    limit: 100,
    origin_organisation_id: user?.organisation_id,
  });

  const createCorridorMutation = useCreateCorridor();
  const updateCorridorMutation = useUpdateCorridor();
  const deleteCorridorMutation = useDeleteCorridor();

  // Charge hooks
  const { data: chargesData, isLoading: chargesLoading } = useCharges({
    origin_organisation_id: user?.organisation_id || "",
    limit: 100,
    destination_organisation_id: id || "",
  });

  const createChargeMutation = useCreateCharge();
  const updateChargeMutation = useUpdateCharge();
  const deleteChargeMutation = useDeleteCharge();

  // Balance hooks
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: bankAccountsData } = useBankAccounts({
    organisation_id: user?.organisation_id || "",
    limit: 100,
  });
  const { data: balanceHistoryData, isLoading: balanceHistoryLoading } =
    useOrgBalanceHistory(id || "", balanceHistoryFilters);
  const setOpeningBalanceMutation = useSetOpeningBalance();
  const prefundMutation = usePrefundOrganisation();

  const organisation = organisationData?.data || null;
  const integrations = integrationsData?.data?.integrations || [];
  const corridors = corridorsData?.data?.corridors || [];
  const charges = chargesData?.data?.charges || [];
  const currencies = currenciesData?.data?.currencies || [];
  const bankAccounts = bankAccountsData?.data?.bankAccounts || [];
  const balanceHistory = balanceHistoryData?.data?.histories || [];

  // Integration handlers
  const handleCreateIntegration = async (
    data: CreateIntegrationRequest | UpdateIntegrationRequest
  ) => {
    try {
      await createIntegrationMutation.mutateAsync({
        ...(data as CreateIntegrationRequest),
        organisation_id: id || "",
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating integration:", error);
    }
  };

  const handleEditIntegration = async (
    data: CreateIntegrationRequest | UpdateIntegrationRequest
  ) => {
    if (!selectedIntegration) return;

    try {
      await updateIntegrationMutation.mutateAsync({
        id: selectedIntegration.id,
        integrationData: data as UpdateIntegrationRequest,
      });
      setShowEditModal(false);
      setSelectedIntegration(null);
    } catch (error) {
      console.error("Error updating integration:", error);
    }
  };

  const handleDeleteIntegration = async () => {
    if (!integrationToDelete) return;

    try {
      await deleteIntegrationMutation.mutateAsync(integrationToDelete.id);
      setShowDeleteModal(false);
      setIntegrationToDelete(null);
    } catch (error) {
      console.error("Error deleting integration:", error);
    }
  };

  const openEditModal = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowEditModal(true);
  };

  const openDeleteModal = (id: string, name: string) => {
    setIntegrationToDelete({ id, name });
    setShowDeleteModal(true);
  };

  // Corridor handlers
  const handleCreateCorridor = async (
    data: CreateCorridorRequest | UpdateCorridorRequest
  ) => {
    try {
      await createCorridorMutation.mutateAsync({
        ...(data as CreateCorridorRequest),
        organisation_id: id || "",
        origin_organisation_id: user?.organisation_id || "",
      });
      setShowCreateCorridorModal(false);
    } catch (error) {
      console.error("Error creating corridor:", error);
    }
  };

  const handleEditCorridor = async (
    data: CreateCorridorRequest | UpdateCorridorRequest
  ) => {
    if (!selectedCorridor) return;

    try {
      await updateCorridorMutation.mutateAsync({
        id: selectedCorridor.id,
        corridorData: data as UpdateCorridorRequest,
      });
      setShowEditCorridorModal(false);
      setSelectedCorridor(null);
    } catch (error) {
      console.error("Error updating corridor:", error);
    }
  };

  const handleDeleteCorridor = async () => {
    if (!corridorToDelete) return;

    try {
      await deleteCorridorMutation.mutateAsync(corridorToDelete.id);
      setShowDeleteCorridorModal(false);
      setCorridorToDelete(null);
    } catch (error) {
      console.error("Error deleting corridor:", error);
    }
  };

  const openEditCorridorModal = (corridor: Corridor) => {
    setSelectedCorridor(corridor);
    setShowEditCorridorModal(true);
  };

  const openDeleteCorridorModal = (corridor: Corridor) => {
    setCorridorToDelete(corridor);
    setShowDeleteCorridorModal(true);
  };

  // Charge handlers
  const handleCreateCharge = async (
    data: CreateChargeRequest | UpdateChargeRequest
  ) => {
    try {
      await createChargeMutation.mutateAsync({
        ...(data as CreateChargeRequest),
        destination_organisation_id: id || "",
        origin_organisation_id: user?.organisation_id || "",
      });
      setShowCreateChargeModal(false);
    } catch (error) {
      console.error("Error creating charge:", error);
    }
  };

  const handleEditCharge = async (
    data: CreateChargeRequest | UpdateChargeRequest
  ) => {
    if (!selectedCharge) return;
    try {
      await updateChargeMutation.mutateAsync({
        id: selectedCharge.id,
        data: data as UpdateChargeRequest,
      });
      setShowEditChargeModal(false);
      setSelectedCharge(null);
    } catch (error) {
      console.error("Error updating charge:", error);
    }
  };

  const handleDeleteCharge = async () => {
    if (!chargeToDelete) return;
    try {
      await deleteChargeMutation.mutateAsync(chargeToDelete.id);
      setShowDeleteChargeModal(false);
      setChargeToDelete(null);
    } catch (error) {
      console.error("Error deleting charge:", error);
    }
  };

  // Balance handlers
  const handleSetOpeningBalance = async (data: OpeningBalanceRequest) => {
    try {
      await setOpeningBalanceMutation.mutateAsync({ orgId: id || "", data });
      setShowOpeningBalanceModal(false);
      // Reset form
      setOpeningBalanceForm({
        amount: "",
        currency_id: "",
        description: "",
      });
    } catch (error) {
      console.error("Error setting opening balance:", error);
    }
  };

  const handlePrefund = async (data: PrefundRequest) => {
    try {
      await prefundMutation.mutateAsync({ orgId: id || "", data });
      setShowPrefundModal(false);
      // Reset form
      setPrefundForm({
        amount: "",
        source_id: "",
        description: "",
      });
    } catch (error) {
      console.error("Error prefunding organisation:", error);
    }
  };

  const openEditChargeModal = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowEditChargeModal(true);
  };

  const openDeleteChargeModal = (charge: Charge) => {
    setChargeToDelete(charge);
    setShowDeleteChargeModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (
    isLoading ||
    integrationsLoading ||
    corridorsLoading ||
    chargesLoading ||
    balanceHistoryLoading
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !organisation) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">
              {error instanceof Error
                ? error.message
                : "Organisation not found"}
            </p>
            <button
              onClick={() => navigate("/organisations")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Organisations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    ...(organisation?.integration_mode === "EXTERNAL"
      ? [{ id: "integrations", label: "Integrations", icon: "🔌" }]
      : []),
    { id: "corridors", label: "Corridors", icon: "🌐" },
    { id: "charges", label: "Charges", icon: "💰" },
    { id: "balance", label: "Balance", icon: "💳" },
    // { id: "branches", label: "Branches", icon: "🏢" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "integrations":
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Integrations
              </h3>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!user?.organisation_id || user.organisation_id === id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !user?.organisation_id
                    ? "You must be assigned to an organisation to create integrations"
                    : user.organisation_id === id
                    ? "You cannot create integrations with your own organisation"
                    : "Add Integration"
                }
              >
                Add Integration
              </button>
            </div>
            <IntegrationsTable
              data={integrations}
              onEdit={openEditModal}
              onToggleStatus={(_id, currentStatus) => {
                const newStatus =
                  currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                handleEditIntegration({
                  status: newStatus as IntegrationStatus,
                });
              }}
              onDelete={openDeleteModal}
              isLoading={integrationsLoading}
            />
          </div>
        );

      case "corridors":
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Corridors</h3>
              <button
                onClick={() => setShowCreateCorridorModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Corridor
              </button>
            </div>
            <CorridorsTable
              data={corridors}
              onEdit={openEditCorridorModal}
              onToggleStatus={(_corridor, currentStatus) => {
                const newStatus =
                  currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                handleEditCorridor({
                  status: newStatus as
                    | "ACTIVE"
                    | "INACTIVE"
                    | "PENDING"
                    | "BLOCKED",
                });
              }}
              onDelete={openDeleteCorridorModal}
              isLoading={corridorsLoading}
            />
          </div>
        );

      case "charges":
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Charges</h3>
              <button
                onClick={() => setShowCreateChargeModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Charge
              </button>
            </div>
            <ChargesTable
              data={charges}
              onEdit={openEditChargeModal}
              onToggleStatus={(charge) => {
                const newStatus =
                  charge.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                handleEditCharge({
                  status: newStatus as
                    | "ACTIVE"
                    | "INACTIVE"
                    | "PENDING"
                    | "BLOCKED",
                });
              }}
              onDelete={openDeleteChargeModal}
              isLoading={chargesLoading}
            />
          </div>
        );

      case "branches":
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Branches</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Branch
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Branches Coming Soon
              </h4>
              <p className="text-gray-600">
                This section will display all branches for this organisation.
              </p>
            </div>
          </div>
        );

      case "balance":
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Balance Management
              </h3>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowOpeningBalanceModal(true)}
                  variant="outline"
                >
                  Set Opening Balance
                </Button>
                <Button onClick={() => setShowPrefundModal(true)}>
                  Prefund Organisation
                </Button>
              </div>
            </div>

            {/* Balance History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">
                  Balance History
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Locked Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {balanceHistory.map((balance) => (
                      <tr key={balance.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balance.currency?.currency_code || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatToCurrency(balance.balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {balance.locked_balance
                            ? formatToCurrency(balance.locked_balance)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(balance.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/organisations")}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Organisation Profile
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage organisation details
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/organisations/${organisation.id}/edit`)}
              className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center"
            >
              <span className="mr-2">✏️</span>
              Edit Organisation
            </button>
          </div>
        </div>
      </div>

      {/* Organisation Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {getInitials(organisation.name)}
                </span>
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-bold text-white">
                {organisation.name}
              </h2>
              <div className="flex items-center mt-2">
                <StatusBadge status={organisation.status} />
                <span className="ml-3 text-blue-100 text-sm">
                  {organisation.type} • {organisation.integration_mode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Type:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {organisation.type}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Integration Mode:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {organisation.integration_mode}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Status:
                  </span>
                  <span className="ml-2">
                    <StatusBadge status={organisation.status} />
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Created:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {formatDate(organisation.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact & Location
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Contact Email:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {organisation.contact_email || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Contact Phone:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {organisation.contact_phone || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Contact Address:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {organisation.contact_city && organisation.contact_state
                      ? `${organisation.contact_city}, ${organisation.contact_state}`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Country:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {organisation.country?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {organisation.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {organisation.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Create Integration Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Integration"
        size="lg"
      >
        <IntegrationForm
          onSubmit={handleCreateIntegration}
          isLoading={createIntegrationMutation.isPending}
          currentOrganisationId={id}
        />
      </Modal>

      {/* Edit Integration Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedIntegration(null);
        }}
        title="Edit Integration"
        size="lg"
      >
        <IntegrationForm
          initialData={selectedIntegration || undefined}
          onSubmit={handleEditIntegration}
          isLoading={updateIntegrationMutation.isPending}
          isEdit={true}
          currentOrganisationId={id}
        />
      </Modal>

      {/* Delete Integration Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setIntegrationToDelete(null);
        }}
        onConfirm={handleDeleteIntegration}
        title="Delete Integration"
        message={`Are you sure you want to delete "${integrationToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteIntegrationMutation.isPending}
      />

      {/* Create Corridor Modal */}
      <Modal
        isOpen={showCreateCorridorModal}
        onClose={() => setShowCreateCorridorModal(false)}
        title="Create Corridor"
        size="lg"
      >
        <CorridorForm
          onSubmit={handleCreateCorridor}
          isLoading={createCorridorMutation.isPending}
        />
      </Modal>

      {/* Edit Corridor Modal */}
      <Modal
        isOpen={showEditCorridorModal}
        onClose={() => {
          setShowEditCorridorModal(false);
          setSelectedCorridor(null);
        }}
        title="Edit Corridor"
        size="lg"
      >
        <CorridorForm
          initialData={selectedCorridor || undefined}
          onSubmit={handleEditCorridor}
          isLoading={updateCorridorMutation.isPending}
          isEdit={true}
        />
      </Modal>

      {/* Delete Corridor Modal */}
      <ConfirmModal
        isOpen={showDeleteCorridorModal}
        onClose={() => {
          setShowDeleteCorridorModal(false);
          setCorridorToDelete(null);
        }}
        onConfirm={handleDeleteCorridor}
        title="Delete Corridor"
        message={`Are you sure you want to delete "${corridorToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteCorridorMutation.isPending}
      />

      {/* Create Charge Modal */}
      <Modal
        isOpen={showCreateChargeModal}
        onClose={() => setShowCreateChargeModal(false)}
        title="Create Charge"
        size="lg"
      >
        <ChargeForm
          onSubmit={handleCreateCharge}
          isLoading={createChargeMutation.isPending}
          currentOrganisationId={organisation.id}
        />
      </Modal>

      {/* Edit Charge Modal */}
      <Modal
        isOpen={showEditChargeModal}
        onClose={() => {
          setShowEditChargeModal(false);
          setSelectedCharge(null);
        }}
        title="Edit Charge"
        size="lg"
      >
        <ChargeForm
          initialData={selectedCharge || undefined}
          onSubmit={handleEditCharge}
          isLoading={updateChargeMutation.isPending}
          isEdit={true}
          currentOrganisationId={organisation.id}
        />
      </Modal>

      {/* Delete Charge Modal */}
      <ConfirmModal
        isOpen={showDeleteChargeModal}
        onClose={() => {
          setShowDeleteChargeModal(false);
          setChargeToDelete(null);
        }}
        onConfirm={handleDeleteCharge}
        title="Delete Charge"
        message={`Are you sure you want to delete "${chargeToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteChargeMutation.isPending}
      />

      {/* Opening Balance Modal */}
      <Modal
        isOpen={showOpeningBalanceModal}
        onClose={() => {
          setShowOpeningBalanceModal(false);
          // Reset form
          setOpeningBalanceForm({
            amount: "",
            currency_id: "",
            description: "",
          });
        }}
        title="Set Opening Balance"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data: OpeningBalanceRequest = {
              amount: parseFloat(openingBalanceForm.amount),
              currency_id: openingBalanceForm.currency_id,
              description: openingBalanceForm.description,
            };
            handleSetOpeningBalance(data);
          }}
          className="space-y-4"
        >
          <FormItem label="Amount" required>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter opening balance amount"
              value={openingBalanceForm.amount}
              onChange={(e) =>
                setOpeningBalanceForm((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              required
            />
          </FormItem>

          <FormItem label="Currency" required>
            <SearchableSelect
              value={openingBalanceForm.currency_id}
              onChange={(value) =>
                setOpeningBalanceForm((prev) => ({
                  ...prev,
                  currency_id: value,
                }))
              }
              placeholder="Select currency"
              options={currencies.map((currency) => ({
                value: currency.id,
                label: `${currency.currency_code} - ${currency.currency_name}`,
              }))}
            />
          </FormItem>

          <FormItem label="Description">
            <Textarea
              placeholder="Enter description (optional)"
              rows={3}
              value={openingBalanceForm.description}
              onChange={(e) =>
                setOpeningBalanceForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </FormItem>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowOpeningBalanceModal(false);
                // Reset form
                setOpeningBalanceForm({
                  amount: "",
                  currency_id: "",
                  description: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={setOpeningBalanceMutation.isPending}
            >
              Set Opening Balance
            </Button>
          </div>
        </form>
      </Modal>

      {/* Prefund Modal */}
      <Modal
        isOpen={showPrefundModal}
        onClose={() => {
          setShowPrefundModal(false);
          // Reset form
          setPrefundForm({
            amount: "",
            source_id: "",
            description: "",
          });
        }}
        title="Prefund Organisation"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data: PrefundRequest = {
              amount: parseFloat(prefundForm.amount),
              source_type: "BANK_ACCOUNT",
              source_id: prefundForm.source_id,
              description: prefundForm.description,
            };
            handlePrefund(data);
          }}
          className="space-y-4"
        >
          <FormItem label="Amount" required>
            <Input
              type="number"
              step="0.01"
              placeholder="Enter prefund amount"
              value={prefundForm.amount}
              onChange={(e) =>
                setPrefundForm((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              required
            />
          </FormItem>

          <FormItem label="Source Bank Account" required>
            <SearchableSelect
              value={prefundForm.source_id}
              onChange={(value) =>
                setPrefundForm((prev) => ({
                  ...prev,
                  source_id: value,
                }))
              }
              placeholder="Select bank account"
              options={bankAccounts.map((account) => ({
                value: account.id,
                label: `${account.name} - ${account.account_number}`,
              }))}
            />
          </FormItem>

          <FormItem label="Description">
            <Textarea
              placeholder="Enter description (optional)"
              rows={3}
              value={prefundForm.description}
              onChange={(e) =>
                setPrefundForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </FormItem>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowPrefundModal(false);
                // Reset form
                setPrefundForm({
                  amount: "",
                  source_id: "",
                  description: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={prefundMutation.isPending}>
              Prefund Organisation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrganisationProfilePage;

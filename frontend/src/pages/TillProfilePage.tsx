import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiPlay,
  FiSquare,
  FiShield,
  FiXCircle,
  FiPlus,
  FiMinus,
  FiUnlock,
} from "react-icons/fi";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import TillForm from "../components/TillForm";
import UserTillsTable from "../components/UserTillsTable";
import UserTillForm from "../components/UserTillForm";
import TillTopupForm from "../components/TillTopupForm";
import {
  useTill,
  useUpdateTill,
  useOpenTill,
  useCloseTill,
  useBlockTill,
  useDeactivateTill,
  useUserTills,
  useCreateUserTill,
  useUpdateUserTill,
  useDeleteUserTill,
  useCloseUserTill,
  useBlockUserTill,
  useTopupTill,
  useWithdrawTill,
} from "../hooks";
import { TillStatus } from "../types/TillsTypes";
import type {
  UpdateTillRequest,
  UserTill,
  CreateUserTillRequest,
  UpdateUserTillRequest,
} from "../types/TillsTypes";
import type { TillTopupRequest } from "../types/BalanceOperationsTypes";
import { usePermissions } from "../hooks/usePermissions";

const TillProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEditTills } = usePermissions();
  // State
  const [activeTab, setActiveTab] = useState("details");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateUserTillModal, setShowCreateUserTillModal] = useState(false);
  const [showEditUserTillModal, setShowEditUserTillModal] = useState(false);
  const [showDeleteUserTillModal, setShowDeleteUserTillModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedUserTill, setSelectedUserTill] = useState<UserTill | null>(
    null
  );

  // Data fetching
  const { data: tillData, isLoading: tillLoading } = useTill(id!);
  const { data: userTillsData, isLoading: userTillsLoading } = useUserTills({
    till_id: id,
    limit: 50,
  });

  // Mutations
  const updateTillMutation = useUpdateTill();
  const openTillMutation = useOpenTill();
  const closeTillMutation = useCloseTill();
  const blockTillMutation = useBlockTill();
  const deactivateTillMutation = useDeactivateTill();
  const createUserTillMutation = useCreateUserTill();
  const updateUserTillMutation = useUpdateUserTill();
  const deleteUserTillMutation = useDeleteUserTill();
  const closeUserTillMutation = useCloseUserTill();
  const blockUserTillMutation = useBlockUserTill();
  const topupTillMutation = useTopupTill();
  const withdrawTillMutation = useWithdrawTill();

  const till = tillData?.data;
  const userTills = userTillsData?.data?.userTills || [];

  if (tillLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!till) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Till not found
          </h2>
          <p className="text-gray-600 mt-2">
            The till you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/tills")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Tills
          </button>
        </div>
      </div>
    );
  }

  // Till operation availability checks
  const canOpen =
    till.status !== TillStatus.BLOCKED &&
    till.status !== TillStatus.PENDING &&
    !till.current_teller_user_id &&
    !till.opened_at;

  const canClose = till.current_teller_user_id && till.opened_at;
  const canBlock = till.status !== TillStatus.BLOCKED;
  const canUnblock = till.status === TillStatus.BLOCKED;
  const canDeactivate = till.status !== TillStatus.INACTIVE;

  // Handlers
  const handleEditTill = async (data: UpdateTillRequest) => {
    try {
      const result = await updateTillMutation.mutateAsync({
        id: till.id,
        data,
      });
      if (result.success) {
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Failed to update till:", error);
    }
  };

  const handleTillOperation = async (
    operation: "open" | "close" | "block" | "unblock" | "deactivate"
  ) => {
    try {
      let result;
      switch (operation) {
        case "open":
          result = await openTillMutation.mutateAsync(till.id);
          break;
        case "close":
          result = await closeTillMutation.mutateAsync(till.id);
          break;
        case "block":
          result = await blockTillMutation.mutateAsync(till.id);
          break;
        case "unblock":
          result = await updateTillMutation.mutateAsync({
            id: till.id,
            data: { status: TillStatus.ACTIVE },
          });
          break;
        case "deactivate":
          result = await deactivateTillMutation.mutateAsync(till.id);
          break;
      }
      if (result?.success) {
        console.log(`Till ${operation}ed successfully`);
      }
    } catch (error) {
      console.error(`Failed to ${operation} till:`, error);
    }
  };

  // User Till handlers
  const handleCreateUserTill = async (data: CreateUserTillRequest) => {
    try {
      const result = await createUserTillMutation.mutateAsync({
        ...data,
        till_id: till.id,
      });
      if (result.success) {
        setShowCreateUserTillModal(false);
      }
    } catch (error) {
      console.error("Failed to create user till:", error);
    }
  };

  const handleEditUserTill = async (data: UpdateUserTillRequest) => {
    if (!selectedUserTill) return;

    try {
      const result = await updateUserTillMutation.mutateAsync({
        id: selectedUserTill.id,
        data,
      });
      if (result.success) {
        setShowEditUserTillModal(false);
        setSelectedUserTill(null);
      }
    } catch (error) {
      console.error("Failed to update user till:", error);
    }
  };

  const handleDeleteUserTill = async () => {
    if (!selectedUserTill) return;

    try {
      const result = await deleteUserTillMutation.mutateAsync(
        selectedUserTill.id
      );
      if (result.success) {
        setShowDeleteUserTillModal(false);
        setSelectedUserTill(null);
      }
    } catch (error) {
      console.error("Failed to delete user till:", error);
    }
  };

  const handleCloseUserTill = async (userTill: UserTill) => {
    try {
      const result = await closeUserTillMutation.mutateAsync(userTill.id);
      if (result.success) {
        console.log("User till closed successfully");
      }
    } catch (error) {
      console.error("Failed to close user till:", error);
    }
  };

  const handleBlockUserTill = async (userTill: UserTill) => {
    try {
      const result = await blockUserTillMutation.mutateAsync(userTill.id);
      if (result.success) {
        console.log("User till blocked successfully");
      }
    } catch (error) {
      console.error("Failed to block user till:", error);
    }
  };

  // Balance operation handlers
  const handleTopupTill = async (data: TillTopupRequest) => {
    try {
      await topupTillMutation.mutateAsync({
        tillId: till.id,
        data,
      });
      // If we reach here, the mutation was successful
      setShowTopupModal(false);
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      // Don't close modal on error so user can retry
      console.error("Failed to topup till:", error);
    }
  };

  const handleWithdrawTill = async (data: TillTopupRequest) => {
    try {
      await withdrawTillMutation.mutateAsync({
        tillId: till.id,
        data,
      });
      // If we reach here, the mutation was successful
      setShowWithdrawModal(false);
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      // Don't close modal on error so user can retry
      console.error("Failed to withdraw from till:", error);
    }
  };

  const isAnyMutationLoading =
    updateTillMutation.isPending ||
    openTillMutation.isPending ||
    closeTillMutation.isPending ||
    blockTillMutation.isPending ||
    deactivateTillMutation.isPending ||
    createUserTillMutation.isPending ||
    updateUserTillMutation.isPending ||
    deleteUserTillMutation.isPending ||
    closeUserTillMutation.isPending ||
    blockUserTillMutation.isPending ||
    topupTillMutation.isPending ||
    withdrawTillMutation.isPending;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/tills")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{till.name}</h1>
            <p className="text-gray-600">{till.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canOpen && canEditTills() && (
            <button
              onClick={() => handleTillOperation("open")}
              disabled={isAnyMutationLoading}
              className="flex items-center gap-2 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <FiPlay className="h-4 w-4" />
              Open Till
            </button>
          )}
          {canClose && canEditTills() && (
            <button
              onClick={() => handleTillOperation("close")}
              disabled={isAnyMutationLoading}
              className="flex items-center gap-2 px-3 py-2 text-yellow-600 border border-yellow-600 rounded-lg hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <FiSquare className="h-4 w-4" />
              Close Till
            </button>
          )}
          {canBlock && canEditTills() && (
            <button
              onClick={() => handleTillOperation("block")}
              disabled={isAnyMutationLoading}
              className="flex items-center gap-2 px-3 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <FiShield className="h-4 w-4" />
              Block Till
            </button>
          )}
          {canUnblock && canEditTills() && (
            <button
              onClick={() => handleTillOperation("unblock")}
              disabled={isAnyMutationLoading}
              className="flex items-center gap-2 px-3 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <FiUnlock className="h-4 w-4" />
              Unblock Till
            </button>
          )}
          {canDeactivate && canEditTills() && (
            <button
              onClick={() => handleTillOperation("deactivate")}
              disabled={isAnyMutationLoading}
              className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <FiXCircle className="h-4 w-4" />
              Deactivate
            </button>
          )}
          {canEditTills() && (
            <button
              onClick={() => setShowTopupModal(true)}
              disabled={isAnyMutationLoading}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <FiPlus className="h-4 w-4" />
              Topup Till
            </button>
          )}
          {canEditTills() && (
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={isAnyMutationLoading}
              className="flex items-center gap-2 px-3 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <FiMinus className="h-4 w-4" />
              Withdraw
            </button>
          )}
          {canEditTills() && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit Till
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Till Details
          </button>
          <button
            onClick={() => setActiveTab("usertills")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "usertills"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            User Tills ({userTills.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Status
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={till.status} type="status" />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Location
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {till.location || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Current Teller
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {till.current_teller_user
                      ? `${till.current_teller_user.first_name} ${till.current_teller_user.last_name}`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Financial Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Balance
                  </span>
                  <p className="mt-1 text-sm text-gray-900 font-semibold">
                    {till.balance !== null && till.balance !== undefined
                      ? `${till.currency?.currency_symbol || ""} ${parseFloat(
                          till.balance.toString()
                        ).toFixed(2)}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Locked Balance
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {till.locked_balance !== null &&
                    till.locked_balance !== undefined
                      ? `${till.currency?.currency_symbol || ""} ${parseFloat(
                          till.locked_balance.toString()
                        ).toFixed(2)}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Vault
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {till.vault?.name || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Currency
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {till.currency
                      ? `${till.currency.currency_code} - ${till.currency.currency_name}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Organisation
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {till.organisation?.name || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Opened At
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {till.opened_at
                      ? new Date(till.opened_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Closed At
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {till.closed_at
                      ? new Date(till.closed_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Created
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(till.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Updated
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(till.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "usertills" && (
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">User Tills</h2>
            <button
              onClick={() => setShowCreateUserTillModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
            >
              <FiPlay className="h-4 w-4" />
              Create User Till
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <UserTillsTable
              data={userTills}
              isLoading={userTillsLoading}
              onClose={handleCloseUserTill}
              onBlock={handleBlockUserTill}
            />
          </div>
        </div>
      )}

      {/* Edit Till Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Till"
        size="lg"
      >
        <TillForm
          initialData={till}
          onSubmit={handleEditTill}
          isLoading={isAnyMutationLoading}
        />
      </Modal>

      {/* Create User Till Modal */}
      <Modal
        isOpen={showCreateUserTillModal}
        onClose={() => setShowCreateUserTillModal(false)}
        title="Create User Till"
        size="lg"
      >
        <UserTillForm
          tillId={till.id}
          onSubmit={
            handleCreateUserTill as (
              data: CreateUserTillRequest | UpdateUserTillRequest
            ) => void
          }
          isLoading={isAnyMutationLoading}
        />
      </Modal>

      {/* Edit User Till Modal */}
      <Modal
        isOpen={showEditUserTillModal}
        onClose={() => {
          setShowEditUserTillModal(false);
          setSelectedUserTill(null);
        }}
        title="Edit User Till"
        size="lg"
      >
        {selectedUserTill && (
          <UserTillForm
            initialData={selectedUserTill}
            onSubmit={handleEditUserTill}
            isLoading={isAnyMutationLoading}
          />
        )}
      </Modal>

      {/* Delete User Till Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteUserTillModal}
        onClose={() => {
          setShowDeleteUserTillModal(false);
          setSelectedUserTill(null);
        }}
        onConfirm={handleDeleteUserTill}
        title="Delete User Till"
        message={`Are you sure you want to delete this user till? This action cannot be undone.`}
        isLoading={isAnyMutationLoading}
      />

      {/* Topup Till Modal */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="Topup Till"
        size="md"
      >
        <TillTopupForm
          onSubmit={handleTopupTill}
          isLoading={topupTillMutation.isPending}
          operation="topup"
          tillCurrencyId={till.currency_id || undefined}
        />
      </Modal>

      {/* Withdraw Till Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw from Till"
        size="md"
      >
        <TillTopupForm
          onSubmit={handleWithdrawTill}
          isLoading={withdrawTillMutation.isPending}
          operation="withdraw"
          tillCurrencyId={till.currency_id || undefined}
        />
      </Modal>
    </div>
  );
};

export default TillProfilePage;

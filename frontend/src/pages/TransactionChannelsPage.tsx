import React, { useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";
import type {
  ITransactionChannel,
  TransactionChannel,
  CreateTransactionChannelRequest,
} from "../types/TransactionChannelsTypes";
import { formatDateTime } from "../utils/textUtils";
import { usePermissions } from "../hooks/usePermissions";
import {
  useTransactionChannels,
  useCreateTransactionChannel,
  useUpdateTransactionChannel,
  useDeleteTransactionChannel,
} from "../hooks/useTransactionChannels";
import TransactionChannelForm from "../components/TransactionChannelForm";
import { ConfirmModal } from "../components/ConfirmModal";

const TransactionChannelsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChannel, setSelectedChannel] =
    useState<TransactionChannel | null>(null);
  const limit = 10;

  const {
    canCreateTransactionChannels,
    canEditTransactionChannels,
    canDeleteTransactionChannels,
  } = usePermissions();

  const { data, isLoading, error } = useTransactionChannels({
    search: searchTerm,
    page,
    limit,
  });

  const createMutation = useCreateTransactionChannel();
  const updateMutation = useUpdateTransactionChannel();
  const deleteMutation = useDeleteTransactionChannel();

  const channels = data?.data?.channels || [];
  const pagination = data?.data?.pagination;

  const handleEdit = (channel: ITransactionChannel) => {
    setSelectedChannel(channel);
    setShowFormModal(true);
  };

  const handleCreate = () => {
    setSelectedChannel(null);
    setShowFormModal(true);
  };

  const handleDelete = (channel: ITransactionChannel) => {
    setSelectedChannel(channel);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedChannel) {
      deleteMutation.mutate(selectedChannel.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading transaction channels</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Tabs */}
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between py-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Transaction Channels
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage transaction channels and their configurations
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          {canCreateTransactionChannels() && (
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <FiPlus className="-ml-0.5 mr-1.5 h-5 w-5" />
              Add Channel
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transaction channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Channels Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md py-4">
        {channels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transaction channels found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {channels.map((channel: ITransactionChannel) => (
                  <tr key={channel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {channel.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {channel.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {channel.direction.map((dir, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {dir}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {channel.created_by_user
                          ? `${channel.created_by_user.first_name} ${channel.created_by_user.last_name}`
                          : "System"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(channel.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {canEditTransactionChannels() && (
                          <button
                            onClick={() => handleEdit(channel)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                        )}
                        {canDeleteTransactionChannels() && (
                          <button
                            onClick={() => handleDelete(channel)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{(page - 1) * limit + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionChannelForm
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setSelectedChannel(null);
        }}
        channel={selectedChannel}
        onSubmit={(data) => {
          if (selectedChannel) {
            updateMutation.mutate({ id: selectedChannel.id, data });
          } else {
            createMutation.mutate(data as CreateTransactionChannelRequest);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
        title="Transaction Channel"
      />

      {showDeleteModal && selectedChannel && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedChannel(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Transaction Channel"
          message={`Are you sure you want to delete "${selectedChannel.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteMutation.isPending}
          variant="danger"
        />
      )}
    </div>
  );
};

export default TransactionChannelsPage;

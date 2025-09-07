import React, { useState } from "react";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCustomerStats,
  useSession,
} from "../hooks";
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../types/CustomersTypes";
import CustomersTable from "../components/CustomersTable";
import CustomerForm from "../components/CustomerForm";
import { Modal } from "../components/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import { FiPlus } from "react-icons/fi";

const CustomersPage: React.FC = () => {
  const { user: currentUser } = useSession();
  const organisationId = currentUser?.organisation_id;
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    organisation_id: organisationId,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  const { data: customersData, isLoading: customersLoading } =
    useCustomers(filters);
  const { data: statsData, isLoading: statsLoading } = useCustomerStats();
  const stats = statsData?.data || null;
  const loading = customersLoading || statsLoading;
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const handleCreateCustomer = (
    data: CreateCustomerRequest | UpdateCustomerRequest
  ) => {
    createCustomerMutation.mutate(data as CreateCustomerRequest, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
    });
  };

  const handleEditCustomer = (
    data: CreateCustomerRequest | UpdateCustomerRequest
  ) => {
    if (!selectedCustomer) return;

    updateCustomerMutation.mutate(
      { id: selectedCustomer.id, data: data as UpdateCustomerRequest },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedCustomer(null);
        },
      }
    );
  };

  const handleDeleteCustomer = () => {
    if (!customerToDelete) return;

    deleteCustomerMutation.mutate(customerToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setCustomerToDelete(null);
      },
    });
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const openDeleteModal = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    // Navigate to customer detail page
    window.location.href = `/customers/${customer.id}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                ) : (
                  stats?.totalCustomers?.toLocaleString() || 0
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Individual</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                ) : (
                  stats?.individualCustomers?.toLocaleString() || 0
                )}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Corporate</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                ) : (
                  stats?.corporateCustomers?.toLocaleString() || 0
                )}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Business</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? (
                  <span className="animate-pulse bg-gray-200 h-8 w-16 rounded"></span>
                ) : (
                  stats?.businessCustomers?.toLocaleString() || 0
                )}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H10a2 2 0 00-2-2V4m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-8-8V6a2 2 0 012-2h4a2 2 0 012 2v2m-8 0h8m-8 0v10a2 2 0 002 2h4a2 2 0 002-2V8"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search customers..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.limit}
            onChange={(e) =>
              setFilters({ ...filters, limit: Number(e.target.value) })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <CustomersTable
          customers={customersData?.data?.customers || []}
          isLoading={loading}
          onView={handleViewCustomer}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      </div>

      {/* Pagination */}
      {customersData?.data?.pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(filters.page - 1) * filters.limit + 1} to{" "}
            {Math.min(
              filters.page * filters.limit,
              customersData.data.pagination.total
            )}{" "}
            of {customersData.data.pagination.total} customers
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={
                filters.page >= (customersData.data.pagination.totalPages || 1)
              }
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Customer"
        size="xl"
      >
        <CustomerForm
          onSubmit={handleCreateCustomer}
          isLoading={createCustomerMutation.isPending}
        />
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCustomer(null);
        }}
        title="Edit Customer"
        size="xl"
      >
        <CustomerForm
          initialData={selectedCustomer || undefined}
          onSubmit={handleEditCustomer}
          isLoading={updateCustomerMutation.isPending}
          isEdit={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customerToDelete?.full_name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
};

export default CustomersPage;

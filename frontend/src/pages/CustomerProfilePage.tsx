import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCustomer,
  useBeneficiaries,
  useCreateBeneficiary,
  useUpdateBeneficiary,
  useDeleteBeneficiary,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../hooks";

import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import BeneficiaryForm from "../components/BeneficiaryForm";
import BeneficiariesTable from "../components/BeneficiariesTable";
import CustomerForm from "../components/CustomerForm";
import type {
  Beneficiary,
  CreateBeneficiaryRequest,
  UpdateBeneficiaryRequest,
} from "../types/BeneficiariesTypes";
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../types/CustomersTypes";
import { FiArrowLeft, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { StatusBadge } from "../components/ui/StatusBadge";

const CustomerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("beneficiaries");

  // Customer state
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showDeleteCustomerModal, setShowDeleteCustomerModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  // Beneficiary state
  const [showCreateBeneficiaryModal, setShowCreateBeneficiaryModal] =
    useState(false);
  const [showEditBeneficiaryModal, setShowEditBeneficiaryModal] =
    useState(false);
  const [showDeleteBeneficiaryModal, setShowDeleteBeneficiaryModal] =
    useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] =
    useState<Beneficiary | null>(null);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { data: customerData, isLoading, error } = useCustomer(id || "");

  // Beneficiary hooks
  const { data: beneficiariesData, isLoading: beneficiariesLoading } =
    useBeneficiaries({ customer_id: id || "" });

  // Customer hooks
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  // Beneficiary hooks
  const createBeneficiaryMutation = useCreateBeneficiary();
  const updateBeneficiaryMutation = useUpdateBeneficiary();
  const deleteBeneficiaryMutation = useDeleteBeneficiary();

  const customer = customerData?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Customer not found
          </div>
          <button
            onClick={() => navigate("/customers")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to customers
          </button>
        </div>
      </div>
    );
  }

  // Beneficiary handlers
  const handleCreateBeneficiary = (data: CreateBeneficiaryRequest) => {
    createBeneficiaryMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateBeneficiaryModal(false);
      },
    });
  };

  const handleEditBeneficiary = (
    data: CreateBeneficiaryRequest | UpdateBeneficiaryRequest
  ) => {
    if (!selectedBeneficiary) return;
    updateBeneficiaryMutation.mutate(
      { id: selectedBeneficiary.id, data: data as UpdateBeneficiaryRequest },
      {
        onSuccess: () => {
          setShowEditBeneficiaryModal(false);
          setSelectedBeneficiary(null);
        },
      }
    );
  };

  const handleDeleteBeneficiary = () => {
    if (!beneficiaryToDelete) return;
    deleteBeneficiaryMutation.mutate(beneficiaryToDelete.id, {
      onSuccess: () => {
        setShowDeleteBeneficiaryModal(false);
        setBeneficiaryToDelete(null);
      },
    });
  };

  const handleToggleBeneficiaryStatus = (beneficiary: Beneficiary) => {
    updateBeneficiaryMutation.mutate({
      id: beneficiary.id,
      data: {
        status: beneficiary.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      } as UpdateBeneficiaryRequest,
    });
  };

  // Customer handlers
  const handleEditCustomer = (
    data: CreateCustomerRequest | UpdateCustomerRequest
  ) => {
    if (!customer) return;

    updateCustomerMutation.mutate(
      { id: customer.id, data: data as UpdateCustomerRequest },
      {
        onSuccess: () => {
          setShowEditCustomerModal(false);
        },
      }
    );
  };

  const handleDeleteCustomer = () => {
    if (!customerToDelete) return;

    deleteCustomerMutation.mutate(customerToDelete.id, {
      onSuccess: () => {
        setShowDeleteCustomerModal(false);
        setCustomerToDelete(null);
        navigate("/customers");
      },
    });
  };

  const openEditCustomerModal = () => {
    setShowEditCustomerModal(true);
  };

  const openDeleteCustomerModal = () => {
    if (customer) {
      setCustomerToDelete(customer);
      setShowDeleteCustomerModal(true);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const tabs = [
    {
      id: "beneficiaries",
      label: "Beneficiaries",
      count: beneficiariesData?.data?.beneficiaries?.length || 0,
    },
    // Future tabs can be added here
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "beneficiaries":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Beneficiaries
                </h3>
                <p className="text-sm text-gray-500">
                  Manage beneficiaries for this customer
                </p>
              </div>
              <button
                onClick={() => setShowCreateBeneficiaryModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add Beneficiary
              </button>
            </div>

            <BeneficiariesTable
              data={beneficiariesData?.data?.beneficiaries || []}
              loading={beneficiariesLoading}
              onEdit={(beneficiary) => {
                setSelectedBeneficiary(beneficiary);
                setShowEditBeneficiaryModal(true);
              }}
              onDelete={(id, name) => {
                setBeneficiaryToDelete({ id, name });
                setShowDeleteBeneficiaryModal(true);
              }}
              onToggleStatus={handleToggleBeneficiaryStatus}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/customers")}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Customer Profile
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage customer details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={openEditCustomerModal}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Edit Customer
          </button>
          <button
            onClick={openDeleteCustomerModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FiTrash2 className="w-4 h-4 mr-2" />
            Delete Customer
          </button>
        </div>
      </div>

      {/* Customer Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {getInitials(customer.full_name)}
                </span>
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-bold text-white">
                {customer.full_name}
              </h2>
              <div className="flex items-center mt-2">
                <StatusBadge status={customer.status} />
                <span className="ml-3 text-blue-100 text-sm">
                  {customer.customer_type}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Basic Information */}
            <div className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  {customer.customer_type === "INDIVIDUAL" && (
                    <>
                      {customer.date_of_birth && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Date of Birth
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {formatDate(customer.date_of_birth)}
                          </dd>
                        </div>
                      )}

                      {customer.gender && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Gender
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {customer.gender}
                          </dd>
                        </div>
                      )}

                      {customer.nationality && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Nationality
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {customer?.nationality?.name}
                          </dd>
                        </div>
                      )}

                      {customer.residence_country && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Residence Country
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {customer?.residence_country?.name}
                          </dd>
                        </div>
                      )}
                    </>
                  )}

                  {customer.customer_type !== "INDIVIDUAL" && (
                    <>
                      {customer.incoporated_date && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Incorporation Date
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {formatDate(customer.incoporated_date)}
                          </dd>
                        </div>
                      )}

                      {customer.incorporation_country && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Incorporation Country
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {customer?.incorporation_country?.name}
                          </dd>
                        </div>
                      )}

                      {customer.org_reg_number && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">
                            Registration Number
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {customer.org_reg_number}
                          </dd>
                        </div>
                      )}
                    </>
                  )}

                  {customer.industry && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Industry
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer?.industry?.name}
                      </dd>
                    </div>
                  )}

                  {customer.occupation && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Occupation
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer?.occupation?.name}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact & Identification */}
            <div className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Contact & Identification
                </h3>
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.email || "N/A"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.phone_number || "N/A"}
                    </dd>
                  </div>

                  {customer.id_type && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        ID Type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.id_type}
                      </dd>
                    </div>
                  )}

                  {customer.id_number && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        ID Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.id_number}
                      </dd>
                    </div>
                  )}

                  {customer.tax_number_type && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Tax Number Type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.tax_number_type}
                      </dd>
                    </div>
                  )}

                  {customer.tax_number && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Tax Number
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.tax_number}
                      </dd>
                    </div>
                  )}

                  {customer.address && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.address}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System & Risk Information */}
            <div className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  System & Risk Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Organisation
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer?.organisation?.name}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Branch
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer?.branch?.name}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Registration Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(customer.registration_date)}
                    </dd>
                  </div>

                  <div className="hidden">
                    <dt className="text-sm font-medium text-gray-500">
                      Risk Rating
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.risk_rating >= 70
                            ? "bg-red-100 text-red-800"
                            : customer.risk_rating >= 40
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {customer.risk_rating}% Risk
                      </span>
                    </dd>
                  </div>

                  {customer.risk_reasons && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Risk Reasons
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.risk_reasons}
                      </dd>
                    </div>
                  )}

                  {customer.has_adverse_media && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Adverse Media
                      </dt>
                      <dd className="mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Yes
                        </span>
                      </dd>
                    </div>
                  )}

                  {customer.adverse_media_reason && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Adverse Media Reason
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.adverse_media_reason}
                      </dd>
                    </div>
                  )}

                  {customer.estimated_monthly_income && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Estimated Monthly Income
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.currency?.currency_symbol || "$"}
                        {customer.estimated_monthly_income.toLocaleString()}
                      </dd>
                    </div>
                  )}

                  {customer.current_age && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Current Age
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customer.current_age} years
                      </dd>
                    </div>
                  )}

                  {customer.legacy_customer_id && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Legacy Customer ID
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">
                        {customer.legacy_customer_id}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Created By
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {customer.created_by_user
                        ? `${customer.created_by_user.first_name} ${customer.created_by_user.last_name}`
                        : "System"}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">{renderTabContent()}</div>
      </div>

      {/* Beneficiary Modals */}
      <Modal
        isOpen={showCreateBeneficiaryModal}
        onClose={() => setShowCreateBeneficiaryModal(false)}
        title="Create Beneficiary"
      >
        <BeneficiaryForm
          onSubmit={(data) =>
            handleCreateBeneficiary(data as CreateBeneficiaryRequest)
          }
          isLoading={createBeneficiaryMutation.isPending}
          customerId={customer.id}
          organisationId={customer.organisation_id}
        />
      </Modal>

      <Modal
        isOpen={showEditBeneficiaryModal}
        onClose={() => {
          setShowEditBeneficiaryModal(false);
          setSelectedBeneficiary(null);
        }}
        title="Edit Beneficiary"
      >
        <BeneficiaryForm
          initialData={selectedBeneficiary || undefined}
          onSubmit={handleEditBeneficiary}
          isLoading={updateBeneficiaryMutation.isPending}
          customerId={customer.id}
          organisationId={customer.organisation_id}
        />
      </Modal>

      <ConfirmModal
        isOpen={showDeleteBeneficiaryModal}
        onClose={() => {
          setShowDeleteBeneficiaryModal(false);
          setBeneficiaryToDelete(null);
        }}
        onConfirm={handleDeleteBeneficiary}
        title="Delete Beneficiary"
        message={`Are you sure you want to delete "${beneficiaryToDelete?.name}"? This action cannot be undone.`}
        isLoading={deleteBeneficiaryMutation.isPending}
      />

      {/* Customer Edit Modal */}
      <Modal
        isOpen={showEditCustomerModal}
        onClose={() => setShowEditCustomerModal(false)}
        title="Edit Customer"
      >
        <CustomerForm
          initialData={customer}
          onSubmit={handleEditCustomer}
          isLoading={updateCustomerMutation.isPending}
          isEdit={true}
        />
      </Modal>

      {/* Customer Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteCustomerModal}
        onClose={() => {
          setShowDeleteCustomerModal(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customerToDelete?.full_name}"? This action cannot be undone and will also delete all associated beneficiaries.`}
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
};

export default CustomerProfilePage;

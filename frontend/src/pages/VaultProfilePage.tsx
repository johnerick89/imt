import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArchive, FiDollarSign } from "react-icons/fi";
import { useVault } from "../hooks/useVaults";

const VaultProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vaultData, isLoading, error } = useVault(id || "");

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vaultData?.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading vault
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {vaultData?.message || "Failed to load vault information"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vault = vaultData.data;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/vaults")}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vault Profile</h1>
            <p className="text-gray-600 mt-1">View and manage vault details</p>
          </div>
        </div>
      </div>

      {/* Vault Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {getInitials(vault.name)}
                </span>
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-bold text-white">{vault.name}</h2>
              <div className="flex items-center mt-2">
                <FiArchive className="h-4 w-4 text-purple-100 mr-2" />
                <span className="text-purple-100 text-sm">
                  {vault.organisation?.name || "No organisation"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Vault Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">
                      {vault.name}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Organisation
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {vault.organisation?.name || "No organisation"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Currency
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {vault.currency
                        ? `${vault.currency.currency_code} - ${vault.currency.currency_name}`
                        : "No currency specified"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Created Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(vault.created_at)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Statistics
                </h3>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiArchive className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-600">
                          Storage Type
                        </p>
                        <p className="text-lg font-bold text-purple-900">
                          Secure Vault
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiDollarSign className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">
                          Associated Tills
                        </p>
                        <p className="text-lg font-bold text-green-900">0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultProfilePage;

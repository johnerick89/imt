import React, { useState } from "react";
import ParametersTab from "../components/ParametersTab";
import CurrenciesTab from "../components/CurrenciesTab";
import CountriesTab from "../components/CountriesTab";
import { usePermissions } from "../hooks/usePermissions";
const CoreConfigurationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "parameters" | "currencies" | "countries"
  >("parameters");
  const { canViewParameters } = usePermissions();

  return (
    <div className="p-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Core Configurations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage system parameters, currencies, and countries
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {canViewParameters() && (
              <button
                onClick={() => setActiveTab("parameters")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "parameters"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Parameters
              </button>
            )}
            <button
              onClick={() => setActiveTab("currencies")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "currencies"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Currencies
            </button>
            <button
              onClick={() => setActiveTab("countries")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "countries"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Countries
            </button>
          </nav>
        </div>
      </div>
      {activeTab === "parameters" && <ParametersTab />}
      {activeTab === "currencies" && <CurrenciesTab />}
      {activeTab === "countries" && <CountriesTab />}
    </div>
  );
};

export default CoreConfigurationsPage;

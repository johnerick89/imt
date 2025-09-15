import React, { useState } from "react";
import Charges from "../components/Charges";
import ExchangeRates from "../components/ExchangeRates";
import OrgBalances from "../components/OrgBalances";

const FinancialSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "charges" | "exchange-rates" | "org-balances"
  >("charges");

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("charges")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "charges"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Charges
            </button>
            <button
              onClick={() => setActiveTab("exchange-rates")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "exchange-rates"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Exchange Rates
            </button>
            <button
              onClick={() => setActiveTab("org-balances")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "org-balances"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Org Balances
            </button>
          </nav>
        </div>
      </div>
      {activeTab === "charges" && <Charges />}
      {activeTab === "exchange-rates" && <ExchangeRates />}
      {activeTab === "org-balances" && <OrgBalances />}
    </div>
  );
};

export default FinancialSettingsPage;

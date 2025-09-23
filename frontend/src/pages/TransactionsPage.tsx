import React, { useState } from "react";
import OutboundTransactions from "../components/OutboundTransactions";
import InboundTransactions from "../components/InboundTransactions";
import { siteCommonStrings } from "../config";

const TransactionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"outbound" | "inbound">(
    "outbound"
  );
  const commonStrings = siteCommonStrings;
  const outboundLabel = commonStrings?.outbound;
  const inboundLabel = commonStrings?.inbound;
  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("outbound")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "outbound"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {outboundLabel} Transactions
            </button>
            <button
              onClick={() => setActiveTab("inbound")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "inbound"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {inboundLabel} Transactions
            </button>
          </nav>
        </div>
      </div>
      {activeTab === "outbound" && <OutboundTransactions />}
      {activeTab === "inbound" && <InboundTransactions />}
    </div>
  );
};

export default TransactionsPage;

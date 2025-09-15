import React, { useState } from "react";
import Corridors from "../components/Corridors";
import Integrations from "../components/Integrations";

const ConnectionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"corridors" | "integrations">(
    "corridors"
  );

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("corridors")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "corridors"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Corridors
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "integrations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Integrations
            </button>
          </nav>
        </div>
      </div>
      {activeTab === "corridors" && <Corridors />}
      {activeTab === "integrations" && <Integrations />}
    </div>
  );
};

export default ConnectionsPage;

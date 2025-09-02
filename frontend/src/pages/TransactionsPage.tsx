import React from "react";

const TransactionsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">
          Manage inbound and outbound transactions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Transaction Management
        </h2>
        <p className="text-gray-600">
          This page will contain transaction management features including
          inbound and outbound transactions.
        </p>
      </div>
    </div>
  );
};

export default TransactionsPage;

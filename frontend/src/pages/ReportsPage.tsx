import React from "react";

const ReportsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">
          Generate and view comprehensive reports
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Center</h2>
        <p className="text-gray-600">
          This page will contain comprehensive reporting features including:
        </p>
        <ul className="text-gray-600 mt-4 space-y-2">
          <li>• Transaction reports</li>
          <li>• Financial analytics</li>
          <li>• Customer reports</li>
          <li>• Performance metrics</li>
          <li>• Export functionality</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportsPage;

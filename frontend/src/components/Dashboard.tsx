import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Dashboard • General System Wide Summary
          </p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Transactions Widget */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Transactions
              </h3>
              <span className="text-gray-500 text-sm">Traffic</span>
            </div>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">→</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-blue-600 text-sm">Total</span>
                <div className="text-gray-900 text-2xl font-bold">11</div>
                <span className="text-gray-600 text-sm">USD</span>
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                0.0%
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600 text-sm">Present</span>
                <div className="text-gray-900 text-2xl font-bold">0</div>
                <span className="text-gray-600 text-sm">Week</span>
              </div>
              <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                -100.0%
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Widget */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Traffic</h3>
              <span className="text-gray-500 text-sm">Weekly</span>
            </div>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">→</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900">O</span>
                  <span className="text-gray-900 text-sm">Outbound</span>
                </div>
                <span className="text-gray-900 text-sm">0%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900">O</span>
                  <span className="text-gray-900 text-sm">Inbound</span>
                </div>
                <span className="text-gray-900 text-sm">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Outbound/Inbound Widget */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Outbound / Inbound
              </h3>
              <span className="text-gray-500 text-sm">Traffic</span>
            </div>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">→</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-blue-600 text-sm">Outbound</span>
                <div className="text-gray-900 text-2xl font-bold">0</div>
                <span className="text-gray-600 text-sm">USD</span>
              </div>
              <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                -100.0%
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600 text-sm">Inbound</span>
                <div className="text-gray-900 text-2xl font-bold">0</div>
                <span className="text-gray-600 text-sm">Week</span>
              </div>
              <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                -100.0%
              </div>
            </div>
          </div>
        </div>

        {/* Corridors Widget */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Corridors</h3>
              <span className="text-gray-500 text-sm">Balances</span>
            </div>
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">→</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-blue-600 text-sm">US to KE Total</span>
                <div className="text-gray-900 text-2xl font-bold">1K</div>
                <span className="text-gray-600 text-sm">USD Balance</span>
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                OK
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600 text-sm">US to GB Total</span>
                <div className="text-gray-900 text-2xl font-bold">0K</div>
                <span className="text-gray-600 text-sm">USD Balance</span>
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                OK
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Graph */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Outbound / Inbound Transactions
            </h3>
            <span className="text-gray-500 text-sm">Graph Comparison</span>
          </div>
          <div className="flex h-48">
            <div className="flex flex-col justify-between text-gray-500 text-xs mr-4">
              <span>5k</span>
              <span>4k</span>
              <span>3k</span>
              <span>2k</span>
              <span>1k</span>
            </div>
            <div className="flex-1 bg-gray-100 rounded">
              {/* Graph would be rendered here */}
            </div>
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Metrics
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <div className="text-gray-900 text-2xl font-bold">14</div>
                <div className="text-blue-600 text-sm">New Customers</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <div className="text-gray-900 text-2xl font-bold">0</div>
                <div className="text-blue-600 text-sm">Frequent Customers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Graph */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
            <span className="text-gray-500 text-sm">7 Days Traffic</span>
          </div>
          <div className="h-48 bg-gray-100 rounded relative">
            <div className="absolute bottom-4 left-0 right-0 h-px bg-primary-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

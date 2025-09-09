import React from "react";
import { useSession } from "../hooks";
import { useDashboardData } from "../hooks/useDashboard";
import StatCard from "../components/dashboard/StatCard";
import AlertCard from "../components/dashboard/AlertCard";
import SimpleChart from "../components/dashboard/SimpleChart";
import { formatToCurrency } from "../utils/textUtils";
import {
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiUsers,
  FiShield,
  FiGlobe,
  FiAlertTriangle,
  FiActivity,
  FiCreditCard,
  FiBriefcase,
} from "react-icons/fi";

const DashboardPage: React.FC = () => {
  const { user } = useSession();
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useDashboardData(user?.organisation_id || "");

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error loading dashboard data: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const data = dashboardData?.data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your organization's performance
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Transaction Summary */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transaction Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Transactions"
            value={data?.transactionSummary.totalTransactions.today || 0}
            subtitle={`${
              data?.transactionSummary.totalTransactions.week || 0
            } this week`}
            icon={<FiActivity className="h-6 w-6" />}
            color="blue"
            loading={isLoading}
          />
          <StatCard
            title="Transaction Value"
            value={
              formatToCurrency(
                data?.transactionSummary.transactionValue.today || 0
              ) +
                "" +
                data?.transactionSummary.transactionValue.currency || "USD"
            }
            subtitle={`${
              formatToCurrency(
                data?.transactionSummary.transactionValue.week || 0
              ) +
                " " +
                data?.transactionSummary.transactionValue.currency || "USD"
            } this week`}
            icon={<FiDollarSign className="h-6 w-6" />}
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Pending Transactions"
            value={data?.transactionSummary.pendingTransactions || 0}
            subtitle="Awaiting processing"
            icon={<FiClock className="h-6 w-6" />}
            color="yellow"
            loading={isLoading}
          />
          <StatCard
            title="Monthly Volume"
            value={
              formatToCurrency(
                data?.transactionSummary.transactionValue.month || 0
              ) +
                " " +
                data?.transactionSummary.transactionValue.currency || "USD"
            }
            subtitle={`${
              data?.transactionSummary.totalTransactions.month || 0
            } transactions`}
            icon={<FiTrendingUp className="h-6 w-6" />}
            color="purple"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="Transaction Trend (30 Days)"
          type="line"
          data={
            data?.transactionSummary.transactionTrend.map((item) => ({
              label: new Date(item.date).toLocaleDateString(),
              value: item.count,
            })) || []
          }
          height={300}
        />
        <SimpleChart
          title="Charge Breakdown"
          type="pie"
          data={
            data?.chargesAndPayments.chargeBreakdown.map((item) => ({
              label: item.type,
              value: item.amount,
            })) || []
          }
          height={300}
        />
      </div>

      {/* Financial Balances */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Financial Balances
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Till Balances"
            value={
              formatToCurrency(
                data?.financialBalances.tillBalances.total || 0
              ) +
                " " +
                data?.financialBalances.tillBalances.currency || "USD"
            }
            subtitle={`${
              data?.financialBalances.tillBalances.lowBalanceTills.length || 0
            } low balance`}
            icon={<FiCreditCard className="h-6 w-6" />}
            color="blue"
            loading={isLoading}
          />
          <StatCard
            title="Vault Balances"
            value={
              formatToCurrency(
                data?.financialBalances.vaultBalances.total || 0
              ) +
                " " +
                data?.financialBalances.vaultBalances.currency || "USD"
            }
            icon={<FiShield className="h-6 w-6" />}
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Bank Accounts"
            value={
              formatToCurrency(
                data?.financialBalances.bankAccountBalances.total || 0
              ) +
                " " +
                data?.financialBalances.bankAccountBalances.currency || "USD"
            }
            icon={<FiBriefcase className="h-6 w-6" />}
            color="indigo"
            loading={isLoading}
          />
          <StatCard
            title="Partner Receivables"
            value={
              formatToCurrency(
                data?.financialBalances.partnerReceivables.total || 0
              ) +
                " " +
                data?.financialBalances.partnerReceivables.currency || "USD"
            }
            subtitle={`${
              data?.financialBalances.partnerReceivables.partners.length || 0
            } partners`}
            icon={<FiGlobe className="h-6 w-6" />}
            color="purple"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Customer & Beneficiary Insights */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer & Beneficiary Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Customers"
            value={data?.customerBeneficiaryInsights.totalCustomers || 0}
            subtitle={`${
              data?.customerBeneficiaryInsights.newRegistrations.today || 0
            } new today`}
            icon={<FiUsers className="h-6 w-6" />}
            color="blue"
            loading={isLoading}
          />
          <StatCard
            title="Total Beneficiaries"
            value={data?.customerBeneficiaryInsights.totalBeneficiaries || 0}
            icon={<FiUsers className="h-6 w-6" />}
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="New Registrations"
            value={data?.customerBeneficiaryInsights.newRegistrations.week || 0}
            subtitle="This week"
            icon={<FiTrendingUp className="h-6 w-6" />}
            color="yellow"
            loading={isLoading}
          />
          <StatCard
            title="High-Risk Customers"
            value={data?.customerBeneficiaryInsights.highRiskCustomers || 0}
            subtitle="Requires attention"
            icon={<FiAlertTriangle className="h-6 w-6" />}
            color="red"
            loading={isLoading}
          />
        </div>
      </div>

      {/* System Health & Alerts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Health & Alerts
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <StatCard
              title="Failed Transactions"
              value={data?.systemHealth.failedTransactions.today || 0}
              subtitle={`${
                data?.systemHealth.failedTransactions.week || 0
              } this week`}
              icon={<FiAlertTriangle className="h-6 w-6" />}
              color="red"
              loading={isLoading}
            />
            <StatCard
              title="Integration Status"
              value={`${
                data?.organisationCorridorActivity.integrationStatus
                  .internalPartners || 0
              } Active`}
              subtitle={`${
                data?.organisationCorridorActivity.integrationStatus
                  .externalPartners || 0
              } External, ${
                data?.organisationCorridorActivity.integrationStatus
                  .pendingIntegrations || 0
              } Pending`}
              icon={<FiGlobe className="h-6 w-6" />}
              color="blue"
              loading={isLoading}
            />
          </div>
          <div className="space-y-4">
            {data?.systemHealth.systemAlerts.map((alert, index) => (
              <AlertCard
                key={index}
                type={alert.type}
                message={alert.message}
                count={alert.count}
              />
            ))}
            {data?.financialBalances.lowBalanceAlerts.map((alert, index) => (
              <AlertCard
                key={`low-balance-${index}`}
                type="WARNING"
                message={`${alert.name} (${
                  formatToCurrency(alert.balance) + " " + alert.currency
                }) below minimum (${
                  formatToCurrency(alert.minBalance) + " " + alert.currency
                })`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      {data?.transactionSummary.recentTransactions &&
        data.transactionSummary.recentTransactions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Transactions
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.transactionSummary.recentTransactions.map(
                      (transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatToCurrency(transaction.amount) +
                              " " +
                              transaction.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                transaction.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : transaction.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              transaction.created_at
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DashboardPage;

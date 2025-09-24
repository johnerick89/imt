import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useSession } from "../hooks";

// Page Components
import LoginPage from "../components/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import CustomersPage from "../pages/CustomersPage";
import CustomerProfilePage from "../pages/CustomerProfilePage";
import OrganisationsPage from "../pages/OrganisationsPage";
import OrganisationProfilePage from "../pages/OrganisationProfilePage";
import ReportsPage from "../pages/ReportsPage";
import MyAccountPage from "../pages/MyAccountPage";
import UsersPage from "../pages/UsersPage";
import UserProfilePage from "../pages/UserProfilePage";
import RolesPage from "../pages/RolesPage";
import RoleProfilePage from "../pages/RoleProfilePage";
import VaultsPage from "../pages/VaultsPage";
import VaultProfilePage from "../pages/VaultProfilePage";
import TillsPage from "../pages/TillsPage";
import TillProfilePage from "../pages/TillProfilePage";
import ExchangeRatesPage from "../pages/ExchangeRatesPage";
import ExchangeRateProfilePage from "../pages/ExchangeRateProfilePage";
import CorridorsPage from "../pages/CorridorsPage";
import ChargesPage from "../pages/ChargesPage";
import IntegrationsPage from "../pages/IntegrationsPage";
import BankAccountsPage from "../pages/BankAccountsPage";
import OrganisationBalancesPage from "../pages/OrganisationBalancesPage";
import GlAccountsPage from "../pages/GlAccountsPage";
import GlTransactionsPage from "../pages/GlTransactionsPage";
import ChargesPaymentsPage from "../pages/ChargesPaymentsPage";
import ChargesPaymentDetailsPage from "../pages/ChargesPaymentDetailsPage";
import TransactionsPage from "../pages/TransactionsPage";
import ConnectionsPage from "../pages/ConnectionsPage";
import FinancialSettingsPage from "../pages/FinancialSettingsPage";
import CoreConfigurationsPage from "../pages/CoreConfigurationsPage";
import TransactionChannelsPage from "../pages/TransactionChannelsPage";

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useSession();

  // Don't render anything until session is initialized
  if (!isInitialized) {
    return null;
  }

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Placeholder components for routes that don't have pages yet
const PlaceholderPage: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div className="p-6">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
      <p className="text-gray-600">
        This feature is currently under development and will be available soon.
      </p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Transactions */}
        <Route path="transactions" element={<TransactionsPage />} />

        {/* Charges Payments */}
        <Route path="charges-payments" element={<ChargesPaymentsPage />} />
        <Route
          path="charges-payments/:paymentId"
          element={<ChargesPaymentDetailsPage />}
        />

        {/* Customers */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerProfilePage />} />

        {/* Organisations */}
        <Route path="organisations" element={<OrganisationsPage />} />
        <Route path="organisations/:id" element={<OrganisationProfilePage />} />
        <Route
          path="accounts"
          element={
            <PlaceholderPage
              title="Ledger Accounts"
              description="Manage financial ledgers"
            />
          }
        />
        <Route path="connections" element={<ConnectionsPage />} />
        <Route
          path="balances"
          element={
            <PlaceholderPage
              title="Balances"
              description="View account balances"
            />
          }
        />
        <Route path="vault" element={<Navigate to="/vaults" replace />} />
        <Route
          path="commission-rates"
          element={
            <PlaceholderPage
              title="Commission Rates"
              description="Manage commission rates"
            />
          }
        />

        {/* Vaults & Tills */}
        <Route path="vaults" element={<VaultsPage />} />
        <Route path="vaults/:id" element={<VaultProfilePage />} />
        <Route path="tills" element={<TillsPage />} />
        <Route path="tills/:id" element={<TillProfilePage />} />
        <Route path="bank-accounts" element={<BankAccountsPage />} />
        <Route
          path="organisation-balances"
          element={<OrganisationBalancesPage />}
        />
        <Route path="gl-accounts" element={<GlAccountsPage />} />
        <Route path="gl-transactions" element={<GlTransactionsPage />} />

        {/* Other Features */}
        <Route
          path="fees"
          element={
            <PlaceholderPage
              title="Fees"
              description="Manage transaction fees"
            />
          }
        />
        <Route path="exchange-rates" element={<ExchangeRatesPage />} />
        <Route
          path="exchange-rates/:id"
          element={<ExchangeRateProfilePage />}
        />
        <Route path="corridors" element={<CorridorsPage />} />
        <Route path="charges" element={<ChargesPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="financial-settings" element={<FinancialSettingsPage />} />
        <Route
          path="taxes"
          element={
            <PlaceholderPage
              title="Taxes"
              description="Manage tax configurations"
            />
          }
        />
        <Route path="reports" element={<ReportsPage />} />

        {/* User Management */}
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserProfilePage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="roles/:id" element={<RoleProfilePage />} />

        {/* Core Configurations */}
        <Route
          path="core-configurations"
          element={<CoreConfigurationsPage />}
        />
        <Route
          path="transaction-channels"
          element={<TransactionChannelsPage />}
        />

        {/* Account */}
        <Route path="my-account" element={<MyAccountPage />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

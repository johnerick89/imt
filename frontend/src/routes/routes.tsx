import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { useSession } from "../hooks";

// Page Components
import LoginPage from "../components/LoginPage";
import DashboardPage from "../components/Dashboard";
import TransactionsPage from "../pages/TransactionsPage";
import CustomersPage from "../pages/CustomersPage";
import CustomerProfilePage from "../pages/CustomerProfilePage";
import OrganisationsPage from "../pages/OrganisationsPage";
import OrganisationProfilePage from "../pages/OrganisationProfilePage";
import ReportsPage from "../pages/ReportsPage";
import MyAccountPage from "../pages/MyAccountPage";
import UsersPage from "../pages/UsersPage";
import UserProfilePage from "../pages/UserProfilePage";

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
        <Route
          path="transactions/inbound"
          element={
            <PlaceholderPage
              title="Inbound Transactions"
              description="Manage incoming transactions"
            />
          }
        />
        <Route
          path="transactions/outbound"
          element={
            <PlaceholderPage
              title="Outbound Transactions"
              description="Manage outgoing transactions"
            />
          }
        />

        {/* Customers */}
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerProfilePage />} />

        {/* Organisations */}
        <Route path="organisations" element={<OrganisationsPage />} />
        <Route path="organisations/:id" element={<OrganisationProfilePage />} />
        <Route
          path="organisations/ledgers"
          element={
            <PlaceholderPage
              title="Ledgers"
              description="Manage financial ledgers"
            />
          }
        />
        <Route
          path="organisations/balances"
          element={
            <PlaceholderPage
              title="Balances"
              description="View account balances"
            />
          }
        />
        <Route
          path="organisations/vault"
          element={
            <PlaceholderPage
              title="Vault"
              description="Manage vault operations"
            />
          }
        />
        <Route
          path="organisations/commission-rates"
          element={
            <PlaceholderPage
              title="Commission Rates"
              description="Manage commission rates"
            />
          }
        />

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
        <Route
          path="exchange-rates"
          element={
            <PlaceholderPage
              title="Exchange Rates"
              description="Manage currency exchange rates"
            />
          }
        />
        <Route
          path="tills"
          element={
            <PlaceholderPage
              title="Tills"
              description="Manage till operations"
            />
          }
        />
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
        <Route
          path="roles"
          element={
            <PlaceholderPage
              title="Roles"
              description="Manage user roles and permissions"
            />
          }
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

import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Layout from "./Layout";
import { useSession } from "../hooks";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitialized } = useSession();

  // Don't render anything until session is initialized
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;

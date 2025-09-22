import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "./contexts/SessionContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AppRoutes } from "./routes";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Retry up to 3 times for network/CORS errors
        if (
          failureCount < 3 &&
          (error.message.includes("Network error") ||
            error.message.includes("CORS"))
        ) {
          return true;
        }
        return false;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true, // Refetch when window is focused
      refetchOnReconnect: true, // Refetch on network reconnect
    },
    mutations: {
      retry: (failureCount, error) => {
        // Retry mutations for network/CORS errors
        if (
          failureCount < 3 &&
          (error.message.includes("Network error") ||
            error.message.includes("CORS"))
        ) {
          return true;
        }
        return false;
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SessionProvider>
          <ToastProvider>
            <div className="App">
              <AppRoutes />
            </div>
          </ToastProvider>
        </SessionProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;

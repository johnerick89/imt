import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "./contexts/SessionContext";
import { AppRoutes } from "./routes";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SessionProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </SessionProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;

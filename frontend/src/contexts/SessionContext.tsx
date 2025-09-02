import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { User } from "../types/AuthTypes";

type SessionContextType = {
  sessionJwt: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  logout: () => void;
  updateUserDetails: (newDetails: Partial<User>) => void;
  refreshAuthState: () => void; // Add method to refresh auth state
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionJwt, setSessionJwt] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const storedJwt = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");

    if (storedJwt && storedUser) {
      try {
        jwtDecode(storedJwt); // throws if invalid
        setSessionJwt(storedJwt);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        sessionStorage.clear();
        setSessionJwt(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setSessionJwt(null);
      setUser(null);
      setIsAuthenticated(false);
    }

    setIsInitialized(true);
  }, []);

  const logout = () => {
    sessionStorage.clear();
    setSessionJwt(null);
    setUser(null);
    setIsAuthenticated(false);
    // Let the route protection handle the redirect
  };

  // Add method to update userDetails
  const updateUserDetails = (newDetails: Partial<User>) => {
    if (user) {
      const updatedDetails = { ...user, ...newDetails };
      setUser(updatedDetails);
      sessionStorage.setItem("user", JSON.stringify(updatedDetails));
    }
  };

  // Add method to refresh authentication state from sessionStorage
  const refreshAuthState = () => {
    const storedJwt = sessionStorage.getItem("token");
    const storedUserDetails = sessionStorage.getItem("user");

    if (storedJwt && storedUserDetails) {
      try {
        jwtDecode(storedJwt); // throws if invalid
        setSessionJwt(storedJwt);
        setUser(JSON.parse(storedUserDetails));
        setIsAuthenticated(true);
      } catch {
        sessionStorage.clear();
        setSessionJwt(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setSessionJwt(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Don't render children until session is initialized to prevent navigation issues
  if (!isInitialized) {
    return (
      <SessionContext.Provider
        value={{
          sessionJwt,
          user,
          isAuthenticated,
          isInitialized,
          logout,
          updateUserDetails,
          refreshAuthState,
        }}
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </SessionContext.Provider>
    );
  }

  return (
    <SessionContext.Provider
      value={{
        sessionJwt,
        user,
        isAuthenticated,
        isInitialized,
        logout,
        updateUserDetails,
        refreshAuthState,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export { SessionContext };

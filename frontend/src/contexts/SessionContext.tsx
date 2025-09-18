import React, {
  createContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { User } from "../types/AuthTypes";
import { InactivityWarningModal } from "../components/InactivityWarningModal";
import { useRole } from "../hooks/useRoles";

type SessionContextType = {
  sessionJwt: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  logout: () => void;
  updateUserDetails: (newDetails: Partial<User>) => void;
  refreshAuthState: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Inactivity timeout: 20 minutes (1,200,000 ms) as requested
const INACTIVITY_LIMIT = 20 * 60 * 1000;
// Warning time: 15 seconds before logout
const WARNING_TIME = 15 * 1000;

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionJwt, setSessionJwt] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  const inactivityTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // Fetch user role data if user is authenticated and role_id exists but user_role is missing
  const shouldFetchRole = isAuthenticated && user?.role_id && !user?.user_role;
  console.log(
    "shouldFetchRole",
    shouldFetchRole,
    "user",
    user,
    "isAuthenticated",
    isAuthenticated
  );
  const { data: roleData, isLoading: roleLoading } = useRole(
    shouldFetchRole ? user.role_id || "" : ""
  );

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current);
      inactivityTimeout.current = null;
    }
    if (warningTimeout.current) {
      clearTimeout(warningTimeout.current);
      warningTimeout.current = null;
    }
  }, []);

  // Logout function with cleanup
  const logout = useCallback(async () => {
    // Clear timers
    clearTimers();

    // Hide warning modal
    setShowWarningModal(false);

    // Clear session storage and state
    sessionStorage.clear();
    setSessionJwt(null);
    setUser(null);
    setIsAuthenticated(false);

    // Remove activity tracking
    sessionStorage.removeItem("lastActivity");

    // Redirect to login page
    navigate("/login");
  }, [navigate, clearTimers]);

  // Show warning modal
  const showWarning = useCallback(() => {
    setShowWarningModal(true);
  }, []);

  // Reset inactivity timer
  const resetTimer = useCallback(() => {
    // Only reset if authenticated
    if (!isAuthenticated) return;

    // Don't reset timers if warning modal is already showing
    // User must explicitly choose to extend session or logout
    if (showWarningModal) return;

    // Clear existing timers
    clearTimers();

    // Store last activity timestamp
    sessionStorage.setItem("lastActivity", Date.now().toString());

    // Set warning timer (19 minutes from now)
    warningTimeout.current = setTimeout(
      showWarning,
      INACTIVITY_LIMIT - WARNING_TIME
    );

    // Set logout timer (20 minutes from now)
    inactivityTimeout.current = setTimeout(logout, INACTIVITY_LIMIT);
  }, [isAuthenticated, showWarningModal, clearTimers, showWarning, logout]);

  // Handle extending session from warning modal
  const handleExtendSession = useCallback(() => {
    // Only allow extending session if user is authenticated
    if (!isAuthenticated) {
      setShowWarningModal(false);
      return;
    }

    // Hide the warning modal first
    setShowWarningModal(false);

    // Clear existing timers
    clearTimers();

    // Store last activity timestamp
    sessionStorage.setItem("lastActivity", Date.now().toString());

    // Set new warning timer (full duration from now)
    warningTimeout.current = setTimeout(
      showWarning,
      INACTIVITY_LIMIT - WARNING_TIME
    );

    // Set new logout timer (full duration from now)
    inactivityTimeout.current = setTimeout(logout, INACTIVITY_LIMIT);
  }, [isAuthenticated, clearTimers, showWarning, logout]);

  // Handle logout from warning modal
  const handleLogoutFromModal = useCallback(() => {
    logout();
  }, [logout]);

  // Check stored activity on mount
  const checkStoredActivity = useCallback(() => {
    if (!isAuthenticated) return;

    const lastActivity = sessionStorage.getItem("lastActivity");
    if (lastActivity) {
      const timeElapsed = Date.now() - parseInt(lastActivity);

      if (timeElapsed >= INACTIVITY_LIMIT) {
        // Already past inactivity limit, logout immediately
        logout();
        return;
      }

      const remainingTime = INACTIVITY_LIMIT - timeElapsed;
      const remainingWarningTime = remainingTime - WARNING_TIME;

      if (remainingWarningTime <= 0) {
        // Should show warning immediately
        showWarning();
        // Set logout for remaining time
        inactivityTimeout.current = setTimeout(logout, remainingTime);
      } else {
        // Set warning timer for remaining warning time
        warningTimeout.current = setTimeout(showWarning, remainingWarningTime);
        // Set logout timer for remaining total time
        inactivityTimeout.current = setTimeout(logout, remainingTime);
      }
    } else {
      // No stored activity, start fresh timer
      resetTimer();
    }
  }, [isAuthenticated, logout, showWarning, resetTimer]);

  // Set up activity listeners
  const setupActivityListeners = useCallback(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Use passive listeners for better performance
    const options = { passive: true };

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, options);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  // Initialize session and set up inactivity tracking
  useEffect(() => {
    const storedJwt = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");

    if (storedJwt && storedUser) {
      try {
        jwtDecode(storedJwt); // Validate JWT
        setSessionJwt(storedJwt);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        // Clear any lingering warning modal on successful auth
        setShowWarningModal(false);
      } catch {
        sessionStorage.clear();
        setSessionJwt(null);
        setUser(null);
        setIsAuthenticated(false);
        setShowWarningModal(false);
      }
    } else {
      setSessionJwt(null);
      setUser(null);
      setIsAuthenticated(false);
      setShowWarningModal(false);
    }

    setIsInitialized(true);
  }, []);

  // Set up activity tracking when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timers and hide modal when not authenticated
      clearTimers();
      setShowWarningModal(false);
      return;
    }

    // Check for stored activity and set up timers
    checkStoredActivity();

    // Set up activity listeners
    const cleanup = setupActivityListeners();

    return () => {
      cleanup();
      clearTimers();
    };
  }, [
    isAuthenticated,
    checkStoredActivity,
    setupActivityListeners,
    clearTimers,
  ]);

  // Update user details
  const updateUserDetails = useCallback(
    (newDetails: Partial<User>) => {
      if (user) {
        const updatedDetails = { ...user, ...newDetails };
        setUser(updatedDetails);
        sessionStorage.setItem("user", JSON.stringify(updatedDetails));
      }
    },
    [user]
  );

  // Update user with role data when role fetch completes
  useEffect(() => {
    if (roleData?.data && user && !user.user_role && !roleLoading) {
      console.log("Updating user with role data:", roleData.data);
      updateUserDetails({ user_role: roleData.data });
    }
  }, [roleData, user, roleLoading, updateUserDetails]);

  // Refresh authentication state
  const refreshAuthState = () => {
    const storedJwt = sessionStorage.getItem("token");
    const storedUserDetails = sessionStorage.getItem("user");

    if (storedJwt && storedUserDetails) {
      try {
        jwtDecode(storedJwt);
        setSessionJwt(storedJwt);
        setUser(JSON.parse(storedUserDetails));
        setIsAuthenticated(true);
        // Clear any lingering warning modal when successfully authenticated
        setShowWarningModal(false);
      } catch {
        sessionStorage.clear();
        setSessionJwt(null);
        setUser(null);
        setIsAuthenticated(false);
        setShowWarningModal(false);
      }
    } else {
      setSessionJwt(null);
      setUser(null);
      setIsAuthenticated(false);
      setShowWarningModal(false);
    }
  };

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

      {/* Inactivity Warning Modal */}
      <InactivityWarningModal
        isOpen={showWarningModal}
        onExtendSession={handleExtendSession}
        onLogout={handleLogoutFromModal}
        warningDuration={WARNING_TIME / 1000} // Convert to seconds
      />
    </SessionContext.Provider>
  );
};

export { SessionContext };

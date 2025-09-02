import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Log the 401 error but don't automatically clear session
      // Let the application handle it gracefully
      console.warn(
        "401 Unauthorized error detected. Application should handle this."
      );

      // Only clear session for specific endpoints that should trigger logout
      const url = error.config?.url || "";
      if (url.includes("/auth/login") || url.includes("/auth/register")) {
        // For auth endpoints, clear session
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
      // For other endpoints, let the application handle the 401
    }
    return Promise.reject(error);
  }
);

export default apiClient;

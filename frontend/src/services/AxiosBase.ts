import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
console.log("API_BASE_URL", API_BASE_URL);

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  // withCredentials: true,
  // timeout: 30000, // 30 seconds timeout
  // Ensure proper handling of CORS
  validateStatus: (status) => status < 500, // Don't throw for 4xx errors
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

// Response interceptor to handle auth errors and CORS issues
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("error", error);
    // Handle CORS errors specifically
    if (error.code === "ERR_NETWORK" || error.message?.includes("CORS")) {
      console.error("CORS Error:", error.message);
      console.error(
        "This might be a temporary network issue. Please try again."
      );
      // Don't throw the error immediately, let the user retry
      return Promise.reject(
        new Error("Network error. Please check your connection and try again.")
      );
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

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

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  validateStatus: (status) => status < 500, // Allow 4xx statuses to reach interceptor
});

// Request interceptor: attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Network or CORS errors
    if (error.code === "ERR_NETWORK" || error.message?.includes("CORS")) {
      console.error("CORS/Network Error:", error.message);
      return Promise.reject(
        new Error("Network error. Please check your connection and try again.")
      );
    }

    // Timeout errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    // Handle 4xx errors
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || "An error occurred";

      if (status === 401) {
        console.warn("401 Unauthorized detected.");
        const url = error.config?.url || "";
        if (!url.includes("/auth/login") && !url.includes("/auth/register")) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(
          new Error("Session expired. Please log in again.")
        );
      }

      if (status === 400) {
        return Promise.reject(new Error(message || "Invalid request data"));
      }

      if (status === 403) {
        return Promise.reject(
          new Error(message || "Forbidden: Insufficient permissions")
        );
      }

      if (status === 404) {
        return Promise.reject(new Error(message || "Resource not found"));
      }

      if (status === 409) {
        return Promise.reject(
          new Error(message || "Conflict: Resource already exists")
        );
      }

      // Fallback for other 4xx errors
      return Promise.reject(new Error(message || `Client error: ${status}`));
    }

    // Fallback for unexpected errors
    return Promise.reject(new Error("An unexpected error occurred"));
  }
);

export default apiClient;

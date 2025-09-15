import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // ✅ aligned with server
  validateStatus: (status) => status < 500,
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
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message?.includes("CORS")) {
      console.error("CORS/Network Error:", error.message);
      return Promise.reject(
        new Error("Network error. Please check your connection and try again.")
      );
    }

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
      return Promise.reject(new Error("Request timed out. Please try again."));
    }

    if (error.response?.status === 401) {
      console.warn("401 Unauthorized detected.");
      const url = error.config?.url || "";
      if (url.includes("/auth/login") || url.includes("/auth/register")) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

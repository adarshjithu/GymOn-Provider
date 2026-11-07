import axios from "axios";

export const API_CLIENT_URL =
  import.meta.env.DEV
    ? import.meta.env.VITE_DEV_BASE_URL || "http://localhost:5000/api/v1"
    : import.meta.env.VITE_PROD_BASE_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_CLIENT_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token if stored
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("provider_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

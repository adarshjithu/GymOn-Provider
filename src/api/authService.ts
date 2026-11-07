import { apiClient } from "./baseUrl";
import { errorHandler } from "./errorHandler";
import type { LoginCredentials, AuthResponse, ProviderUser } from "../types";

const USER_STORAGE_KEY = "provider_user";
const TOKEN_STORAGE_KEY = "provider_access_token";

export const authService = {
  /**
   * Log in provider with email and password
   */
  login: async (credentials: LoginCredentials): Promise<{ user: ProviderUser; token?: string }> => {
    try {
      const response = await apiClient.post<AuthResponse>("/provider/login", credentials);
      const resData = response.data?.data;

      // Robustly extract user and token
      const rawUser = resData?.provider || resData;
      const token = resData?.accessToken || (resData as unknown as { token?: string })?.token;

      const user: ProviderUser = {
        _id: rawUser?._id,
        id: rawUser?._id || rawUser?.id,
        name: rawUser?.name || "Provider",
        email: rawUser?.email || credentials.email,
        phone: rawUser?.phone,
        role: rawUser?.role || "provider",
        gymName: rawUser?.gymName || "Iron Fitness",
        isActive: rawUser?.isActive ?? true,
      };

      // Persist auth data in localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      }

      return { user, token };
    } catch (error: unknown) {
      const message = errorHandler(error);
      throw new Error(message || "Failed to sign in. Please check your credentials.");
    }
  },

  /**
   * Log out provider: call backend API and clear local session
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/provider/logout");
    } catch (error) {
      // Backend logout might fail if offline/network error, still clear local credentials
      console.warn("Backend logout endpoint error, proceeding with client logout:", error);
    } finally {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },

  /**
   * Read stored provider user from localStorage
   */
  getStoredUser: (): ProviderUser | null => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Read stored access token from localStorage
   */
  getStoredToken: (): string | null => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  /**
   * Update stored user in localStorage
   */
  updateStoredUser: (user: ProviderUser): void => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  /**
   * Clear all stored authentication data
   */
  clearAuth: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};


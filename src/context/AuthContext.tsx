import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { ProviderUser, LoginCredentials } from "../types";
import { authService } from "../api/authService";

interface AuthContextType {
  user: ProviderUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: ProviderUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ProviderUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from local storage on mount
  useEffect(() => {
    try {
      const storedUser = authService.getStoredUser();
      const storedToken = authService.getStoredToken();

      if (storedUser) {
        setUser(storedUser);
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Error loading stored auth:", err);
      authService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const result = await authService.login(credentials);
    setUser(result.user);
    setToken(result.token || null);
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: ProviderUser): void => {
    setUser(updatedUser);
    authService.updateStoredUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


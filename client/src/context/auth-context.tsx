"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";

type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "user";
};

type AuthContextValue = {
  token: string;
  user: AuthUser | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  register: (payload: { email: string; password: string }) => Promise<string>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_STORAGE_KEY = "task_manager_access_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const hydrateUser = useCallback(
    async (accessToken: string) => {
      const response = await apiRequest<{ data: AuthUser }>({
        path: "/api/v1/auth/me",
        method: "GET",
        token: accessToken,
      });
      setUser(response.data);
    },
    [setUser]
  );

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
      if (!storedToken) {
        setIsBootstrapping(false);
        return;
      }

      setToken(storedToken);
      try {
        await hydrateUser(storedToken);
      } catch {
        logout();
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, [hydrateUser, logout]);

  const register = useCallback(async (payload: { email: string; password: string }) => {
    const response = await apiRequest<{ message?: string }>({
      path: "/api/v1/auth/register",
      method: "POST",
      body: payload,
    });

    return (
      response.message ??
      "Account created successfully. Please verify your email before logging in."
    );
  }, []);

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const response = await apiRequest<{ accessToken: string }>({
        path: "/api/v1/auth/login",
        method: "POST",
        body: payload,
      });

      localStorage.setItem(TOKEN_STORAGE_KEY, response.accessToken);
      setToken(response.accessToken);
      await hydrateUser(response.accessToken);
    },
    [hydrateUser]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isBootstrapping,
      isAuthenticated: token.length > 0 && user !== null,
      register,
      login,
      logout,
    }),
    [isBootstrapping, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}

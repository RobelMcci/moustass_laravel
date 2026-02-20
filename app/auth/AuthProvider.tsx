import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type MeResponse } from "../api/auth.api";

export type Role = "ADMIN" | "CLIENT";

type AuthContextValue = {
  token: string | null;
  user: MeResponse | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<MeResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "moustass.jwt";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.me(token, logout);
      setUser(profile);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("🔐 Attempting login with:", email);
      const { token: jwt } = await authApi.login({ email, password });
      console.log("✅ Login successful, token received");
      setToken(jwt);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(TOKEN_KEY, jwt);
      }
      const profile = await authApi.me(jwt, logout);
      console.log("✅ Profile loaded:", profile);
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isLoading,
      login,
      logout,
      refreshProfile,
    }),
    [token, user, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

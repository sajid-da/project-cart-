import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: Omit<User, "password"> | null;
  token: string | null;
  login: (token: string, user: Omit<User, "password">) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

let globalLogout: (() => void) | null = null;

export function triggerGlobalLogout() {
  if (globalLogout) globalLogout();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  useEffect(() => {
    globalLogout = logout;
    return () => { globalLogout = null; };
  }, [logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      if (isTokenExpired(savedToken)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } else {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: Omit<User, "password">) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function authFetch(token: string | null) {
  return async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (options.body && typeof options.body === "string") {
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      triggerGlobalLogout();
    }
    return res;
  };
}

import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "./queryClient";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, businessName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check session on mount
    fetch("/api/auth/check", { credentials: "include" })
      .then((res) => {
        setIsAuthenticated(res.ok);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const login = async (username: string, password: string) => {
    await apiRequest("POST", "/api/auth/login", { username, password });
    setIsAuthenticated(true);
    setLocation("/");
  };

  const register = async (username: string, password: string, businessName: string) => {
    await apiRequest("POST", "/api/auth/register", { username, password, businessName });
    setIsAuthenticated(true);
    setLocation("/");
  };

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout", {});
    setIsAuthenticated(false);
    setLocation("/login");
  };

  const value = {
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { createAxiosClient } from "../api/axiosClient";
import type { AxiosInstance } from "axios";

interface AuthUser {
  username: string;
  password: string;
}

interface AuthContextType {
  user: AuthUser | null;
  axiosInstance: AxiosInstance | null;
  login: (username: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [axiosInstance, setAxiosInstance] = useState<AxiosInstance | null>(null);

  const login = (username: string, password: string) => {
    setUser({ username, password });
    setAxiosInstance(createAxiosClient(username, password));
  };

  const logout = () => {
    setUser(null);
    setAxiosInstance(null);
  };

  return (
    <AuthContext.Provider value={{ user, axiosInstance, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
} 
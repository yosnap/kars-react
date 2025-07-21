import React, { createContext, useContext, useState, useEffect } from "react";
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

  // Cargar sesión del localStorage al inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Solo crear instancia si tenemos credenciales válidas
        if (parsedUser.username && parsedUser.password) {
          setUser(parsedUser);
          setAxiosInstance(createAxiosClient(parsedUser.username, parsedUser.password));
        }
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const login = (username: string, password: string) => {
    const userData = { username, password };
    setUser(userData);
    setAxiosInstance(createAxiosClient(username, password));
    // Guardar en localStorage
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setAxiosInstance(null);
    // Limpiar localStorage
    localStorage.removeItem('authUser');
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
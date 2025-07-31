import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { createAxiosClient, detectUserRole, type UserRole } from "../api/axiosClient";
import type { AxiosInstance } from "axios";

interface AuthUser {
  username: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  axiosInstance: AxiosInstance | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
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
        // Solo crear instancia si tenemos credenciales válidas y un rol detectado
        if (parsedUser.username && parsedUser.password) {
          const role = detectUserRole(parsedUser.username, parsedUser.password);
          if (role) {
            const userWithRole = { ...parsedUser, role };
            setUser(userWithRole);
            setAxiosInstance(createAxiosClient(parsedUser.username, parsedUser.password));
          } else {
            // Credenciales inválidas, limpiar localStorage
            localStorage.removeItem('authUser');
          }
        }
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const role = detectUserRole(username, password);
    if (!role) {
      return false; // Credenciales inválidas
    }
    
    const userData = { username, password, role };
    setUser(userData);
    setAxiosInstance(createAxiosClient(username, password));
    // Guardar en localStorage
    localStorage.setItem('authUser', JSON.stringify(userData));
    return true; // Login exitoso
  };

  const logout = () => {
    setUser(null);
    setAxiosInstance(null);
    // Limpiar localStorage
    localStorage.removeItem('authUser');
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === 'super_admin';
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin' || user?.role === 'super_admin';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      axiosInstance, 
      login, 
      logout, 
      isSuperAdmin, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
} 
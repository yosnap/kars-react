import axios from "axios";

// Función para construir el header Authorization
function getBasicAuthHeader(username: string, password: string) {
  // Basic <base64(username:password)>
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
}

// Usuarios y contraseñas configurables por rol
const SUPER_ADMIN_USER = import.meta.env.VITE_API_SUPER_ADMIN_USER;
const SUPER_ADMIN_PASS = import.meta.env.VITE_API_SUPER_ADMIN_PASS;
const ADMIN_USER = import.meta.env.VITE_API_ADMIN_USER;
const ADMIN_PASS = import.meta.env.VITE_API_ADMIN_PASS;

// Tipos de usuario
export type UserRole = 'super_admin' | 'admin';

// Función para obtener credenciales por rol
export function getCredentialsByRole(role: UserRole): { username: string; password: string } | null {
  switch (role) {
    case 'super_admin':
      return SUPER_ADMIN_USER && SUPER_ADMIN_PASS 
        ? { username: SUPER_ADMIN_USER, password: SUPER_ADMIN_PASS }
        : null;
    case 'admin':
      return ADMIN_USER && ADMIN_PASS 
        ? { username: ADMIN_USER, password: ADMIN_PASS }
        : null;
    default:
      return null;
  }
}

// Función para detectar rol por credenciales
export function detectUserRole(username: string, password: string): UserRole | null {
  if (username === SUPER_ADMIN_USER && password === SUPER_ADMIN_PASS) {
    return 'super_admin';
  }
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return 'admin';
  }
  return null;
}

// Cliente Axios configurable
export function createAxiosClient(username: string, password: string) {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      Authorization: getBasicAuthHeader(username, password),
    },
  });
}

// Cliente por defecto (super admin, para compatibilidad) usando datos hardcodeados
export const axiosAdmin = SUPER_ADMIN_USER && SUPER_ADMIN_PASS 
  ? createAxiosClient(SUPER_ADMIN_USER, SUPER_ADMIN_PASS) 
  : ADMIN_USER && ADMIN_PASS 
    ? createAxiosClient(ADMIN_USER, ADMIN_PASS)
    : axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
      }); 
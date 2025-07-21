import axios from "axios";

// Función para construir el header Authorization
function getBasicAuthHeader(username: string, password: string) {
  // Basic <base64(username:password)>
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
}

// Usuario y contraseña hardcodeados para pruebas
const USER = import.meta.env.VITE_API_ADMIN_USER;
const PASS = import.meta.env.VITE_API_ADMIN_PASS;

// Configuración completada correctamente

// Cliente Axios configurable
export function createAxiosClient(username: string, password: string) {
  return axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      Authorization: getBasicAuthHeader(username, password),
    },
  });
}

// Cliente por defecto (admin, para Home) usando datos hardcodeados
export const axiosAdmin = USER && PASS ? createAxiosClient(USER, PASS) : axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
}); 
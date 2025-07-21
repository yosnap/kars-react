import axios from 'axios';

export const getApiClient = (username: string, password: string) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const basicAuth = btoa(`${username}:${password}`);

  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
  });
};

// Interceptor para manejo global de errores
const apiClient = getApiClient(import.meta.env.VITE_API_ADMIN_USER, import.meta.env.VITE_API_ADMIN_PASS);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Puedes personalizar el manejo de errores aquí
    return Promise.reject(error);
  }
);

export default apiClient; 
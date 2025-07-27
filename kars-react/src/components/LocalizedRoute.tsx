import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getLanguageFromPath, getPathWithoutLanguage, type Language } from '../context/LanguageContext';

interface LocalizedRouteProps {
  children: React.ReactNode;
}

export const LocalizedRoutes: React.FC<LocalizedRouteProps> = ({ children }) => {
  const location = useLocation();
  const currentLanguage = getLanguageFromPath(location.pathname);
  const pathWithoutLanguage = getPathWithoutLanguage(location.pathname);

  // Si no hay prefijo de idioma y no estamos en la raíz, redirigir a la versión con idioma por defecto
  const shouldRedirect = !['ca', 'es', 'en', 'fr'].includes(location.pathname.split('/')[1]) && 
                         location.pathname !== '/';

  if (shouldRedirect) {
    // Redirigir a la versión catalana (idioma por defecto) si no hay prefijo de idioma
    return <Navigate to={`${location.pathname}${location.search}`} replace />;
  }

  return <>{children}</>;
};

interface LocalizedRouteWrapperProps {
  path: string;
  element: React.ReactElement;
}

export const LocalizedRoute: React.FC<LocalizedRouteWrapperProps> = ({ path, element }) => {
  return (
    <Routes>
      {/* Rutas para cada idioma */}
      <Route path={`/ca${path}`} element={element} />
      <Route path={`/es${path}`} element={element} />
      <Route path={`/en${path}`} element={element} />
      <Route path={`/fr${path}`} element={element} />
      {/* Ruta sin prefijo para catalán (idioma por defecto) */}
      <Route path={path} element={element} />
    </Routes>
  );
};
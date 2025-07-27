import React from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { getLanguageFromPath, getPathWithoutLanguage, useLanguage } from '../context/LanguageContext';
import VehicleListLayout from '../layouts/VehicleListLayout';

// Import de todas las páginas
import Home from '../pages/Home';
import VehicleDetail from '../pages/VehicleDetail';
import NewVehicle from '../pages/NewVehicle';
import Login from '../pages/Login';
import CotxesAndorra from '../pages/CotxesAndorra';
import UltimesVendes from '../pages/UltimesVendes';
import QuiSom from '../pages/QuiSom';
import Taller from '../pages/Taller';
import Serveis from '../pages/Serveis';
import Contacta from '../pages/Contacta';
import CotxesNousAAndorra from '../pages/cotxes-nous-a-andorra';
import CotxesSeminousAAndorra from '../pages/cotxes-seminous-a-andorra';
import CotxesDeSegonaMAAndorra from '../pages/cotxes-de-segona-ma-a-andorra';
import CotxesKm0AAndorra from '../pages/cotxes-km0-a-andorra';
import CotxesLloguerAAndorra from '../pages/cotxes-lloguer-a-andorra';
import CotxesClassicsAAndorra from '../pages/cotxes-classics-a-andorra';
import CotxesRentingAAndorra from '../pages/cotxes-renting-a-andorra';

interface LocalizedRouterProps {
  onSearch: (params: { vehicleType?: string; searchTerm?: string }) => void;
}

// Página dinámica para estado de vehículo
function EstatVehiclePage() {
  const { slug } = useParams();
  const { t } = useLanguage();
  return (
    <VehicleListLayout
      initialFilters={{ "estat-vehicle": slug ?? "", "anunci-actiu": true }}
      breadcrumbs={[
        { label: { es: `Estado: ${slug}`, ca: `Estat: ${slug}` }, href: `/estat-vehicle/${slug}` }
      ]}
      pageTitle={`${t('pages.vehicles_by_state')}: ${slug}`}
    />
  );
}

// Componente para crear rutas localizadas automáticamente
const LocalizedRoute: React.FC<{ 
  path: string; 
  element: React.ReactElement;
  includeLanguagePrefix?: boolean;
}> = ({ path, element, includeLanguagePrefix = true }) => {
  const routes = [];
  
  if (includeLanguagePrefix) {
    // Rutas con prefijo de idioma
    routes.push(
      <Route key={`ca${path}`} path={path} element={element} />,
      <Route key={`es${path}`} path={`/es${path}`} element={element} />,
      <Route key={`en${path}`} path={`/en${path}`} element={element} />,
      <Route key={`fr${path}`} path={`/fr${path}`} element={element} />
    );
  } else {
    // Ruta sin localización (ej: admin, login)
    routes.push(<Route key={path} path={path} element={element} />);
  }
  
  return <>{routes}</>;
};

export const LocalizedRouter: React.FC<LocalizedRouterProps> = ({ onSearch }) => {
  const location = useLocation();
  
  // Redireccionar URLs sin idioma al idioma por defecto
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  const hasLanguagePrefix = ['ca', 'es', 'en', 'fr'].includes(firstSegment);
  
  // Si estamos en una ruta que debería tener idioma pero no lo tiene, redirigir
  const publicPaths = [
    '/',
    '/vehicles',
    '/vehicle/:slug',
    '/ultimes-vendes',
    '/qui-som',
    '/taller',
    '/serveis',
    '/contacta',
    '/cotxes-nous-a-andorra',
    '/cotxes-seminous-a-andorra',
    '/cotxes-de-segona-ma-a-andorra',
    '/cotxes-km0-a-andorra',
    '/cotxes-lloguer-a-andorra',
    '/cotxes-classics-a-andorra',
    '/cotxes-renting-a-andorra',
    '/estat-vehicle/:slug'
  ];
  
  const currentPathWithoutParams = location.pathname.split('/').slice(0, -location.pathname.split('/').filter(seg => seg.includes(':')).length).join('/');
  const isPublicPath = publicPaths.some(path => {
    const pathPattern = path.replace(/:[\w]+/g, '[^/]+');
    return new RegExp(`^${pathPattern}/?$`).test(currentPathWithoutParams);
  });
  
  if (isPublicPath && !hasLanguagePrefix && location.pathname !== '/') {
    return <Navigate to={location.pathname + location.search} replace />;
  }

  return (
    <Routes>
      {/* Página principal */}
      <LocalizedRoute 
        path="/" 
        element={<Home onSearch={onSearch} />} 
      />
      
      {/* Páginas de vehículos */}
      <LocalizedRoute 
        path="/vehicles" 
        element={<CotxesAndorra />} 
      />
      
      <LocalizedRoute 
        path="/vehicle/:slug" 
        element={<VehicleDetail />} 
      />
      
      <LocalizedRoute 
        path="/ultimes-vendes" 
        element={<UltimesVendes />} 
      />
      
      {/* Páginas de tipos de vehículos */}
      <LocalizedRoute 
        path="/cotxes-nous-a-andorra" 
        element={<CotxesNousAAndorra />} 
      />
      
      <LocalizedRoute 
        path="/cotxes-seminous-a-andorra" 
        element={<CotxesSeminousAAndorra />} 
      />
      
      <LocalizedRoute 
        path="/cotxes-de-segona-ma-a-andorra" 
        element={<CotxesDeSegonaMAAndorra />} 
      />
      
      <LocalizedRoute 
        path="/cotxes-km0-a-andorra" 
        element={<CotxesKm0AAndorra />} 
      />
      
      <LocalizedRoute 
        path="/cotxes-lloguer-a-andorra" 
        element={<CotxesLloguerAAndorra />} 
      />
      
      <LocalizedRoute 
        path="/cotxes-classics-a-andorra" 
        element={<CotxesClassicsAAndorra />} 
      />
      
      <LocalizedRoute 
        path="/cotxes-renting-a-andorra" 
        element={<CotxesRentingAAndorra />} 
      />
      
      <LocalizedRoute 
        path="/estat-vehicle/:slug" 
        element={<EstatVehiclePage />} 
      />
      
      {/* Páginas institucionales */}
      <LocalizedRoute 
        path="/qui-som" 
        element={<QuiSom />} 
      />
      
      <LocalizedRoute 
        path="/taller" 
        element={<Taller />} 
      />
      
      <LocalizedRoute 
        path="/serveis" 
        element={<Serveis />} 
      />
      
      <LocalizedRoute 
        path="/contacta" 
        element={<Contacta />} 
      />
      
      {/* Rutas que NO necesitan localización */}
      <LocalizedRoute 
        path="/new" 
        element={<NewVehicle />} 
        includeLanguagePrefix={false}
      />
      
      <LocalizedRoute 
        path="/login" 
        element={<Login />} 
        includeLanguagePrefix={false}
      />
      
      {/* Rutas admin se mantendrán sin localización por ahora */}
    </Routes>
  );
};
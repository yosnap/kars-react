import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import VehicleDetail from "./pages/VehicleDetail";
import NewVehicle from "./pages/NewVehicle";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import BlogManagement from "./pages/Admin/BlogManagement";
import SystemInfo from "./pages/Admin/SystemInfo";
import AdminSettings from "./pages/Admin/AdminSettings";
import KarsVehicles from "./pages/Admin/KarsVehicles";
import CreateVehicle from "./pages/Admin/CreateVehicle";
import EditVehicle from "./pages/Admin/EditVehicle";
import SystemSetup from "./pages/Admin/SystemSetup";
import SystemInstaller from "./components/Admin/SystemInstaller";
import { useAuth } from "./context/AuthContext";
import { VehicleProvider } from "./context/VehicleContext";
import { useLanguage } from "./context/LanguageContext";
import { LanguageProvider } from "./context/LanguageContext";
import Header from "./components/Header";
import CotxesAndorra from "./pages/CotxesAndorra";
// Import subpages for vehicle states
import CotxesNousPage from "./pages/cotxes-nous-a-andorra";
import CotxesSeminousPage from "./pages/cotxes-seminous-a-andorra";
import CotxesOcasioPage from "./pages/cotxes-de-segona-ma-a-andorra";
import CotxesKm0AAndorra from "./pages/cotxes-km0-a-andorra";
import CotxesLloguerPage from "./pages/cotxes-lloguer-a-andorra";
import CotxesClassicsPage from "./pages/cotxes-classics-a-andorra";
import CotxesRentingPage from "./pages/cotxes-renting-a-andorra";
import FavoritosPage from "./pages/favorits";
import BrandPage from "./pages/BrandPage";
import SoldBrandPage from "./pages/SoldBrandPage";
import UltimesVendes from "./pages/UltimesVendes";
import QuiSom from "./pages/QuiSom";
import Taller from "./pages/Taller";
import Serveis from "./pages/Serveis";
import Contacta from "./pages/Contacta";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import VehicleListLayout from "./layouts/VehicleListLayout";
import SearchModal from "./components/SearchModal";
import { axiosAdmin } from "./api/axiosClient";
import AdvancedSearchModal from "./components/AdvancedSearchModal";
import { useState, useEffect } from "react";

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Login />;
  }
  return <>{children}</>;
};

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

function App() {
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [facets, setFacets] = useState<Record<string, Record<string, number>>>({});

  // Callback global para búsqueda
  const handleSearch = async ({ vehicleType, searchTerm }: { vehicleType?: string; searchTerm?: string }) => {
    setSearchQuery(searchTerm || "");
    setSearchResults([]);
    setSearchModalOpen(true);
    setIsLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { "anunci-actiu": true, per_page: 100 };
      if (vehicleType) params["tipus-vehicle"] = vehicleType;
      if (searchTerm) params["search"] = searchTerm;
      const res = await axiosAdmin.get("/vehicles", { params });
      const items = Array.isArray(res.data.items) ? res.data.items : [];
      
      // Transformar de camelCase (API) a kebab-case (componentes)
      const transformedItems = items.map((v: any) => ({
        id: String(v.id),
        "titol-anunci": v.titolAnunci ?? "",
        "descripcio-anunci": v.descripcioAnunci ?? "",
        "marques-cotxe": v.marcaCotxe ?? "",
        "models-cotxe": v.modelsCotxe ?? "",
        "estat-vehicle": v.estatVehicle ?? "",
        any: v.any ?? "",
        quilometratge: v.quilometratge !== undefined && v.quilometratge !== null ? String(v.quilometratge) : "",
        preu: v.preu !== undefined && v.preu !== null ? String(v.preu) : "",
        "color-vehicle": v.colorVehicle ?? "",
        "tipus-combustible": v.tipusCombustible ?? "",
        "anunci-destacat": v.anunciDestacat !== undefined ? String(v.anunciDestacat) : "",
        "imatge-destacada-url": v.imatgeDestacadaUrl ?? "",
        "galeria-vehicle-urls": Array.isArray(v.galeriaVehicleUrls) ? v.galeriaVehicleUrls : [],
        "anunci-actiu": v.anunciActiu !== undefined ? String(v.anunciActiu) : ""
      }));
      
      setSearchResults(transformedItems);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar facets cuando se abre el modal avanzado
  useEffect(() => {
    if (isAdvancedSearchOpen) {
      axiosAdmin.get("/vehicles", { params: { "anunci-actiu": true, per_page: 1 } })
        .then(res => {
          setFacets(res.data.facets || {});
        })
        .catch(() => setFacets({}));
    }
  }, [isAdvancedSearchOpen]);

  return (
    <LanguageProvider>
      <VehicleProvider>
        <Router>
        <Header onSearch={handleSearch} onOpenAdvancedSearch={() => setIsAdvancedSearchOpen(true)} />
        <MainLayout>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home onSearch={handleSearch} />} />
          <Route path="/vehicle/:slug" element={<VehicleDetail />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/new" element={<NewVehicle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vehicles" element={<CotxesAndorra />} />
          <Route path="/vehicles/:brand" element={<BrandPage />} />
          <Route path="/favorits" element={<FavoritosPage />} />
          <Route path="/ultimes-vendes" element={<UltimesVendes />} />
          <Route path="/ultimes-vendes/marca/:brand" element={<SoldBrandPage />} />
          <Route path="/ultimes-vendes/vehicle/:slug" element={<VehicleDetail isSoldVehicle={true} />} />
          <Route path="/qui-som" element={<QuiSom />} />
          <Route path="/taller" element={<Taller />} />
          <Route path="/serveis" element={<Serveis />} />
          <Route path="/contacta" element={<Contacta />} />
          {/* Subpages for vehicle states */}
          <Route path="/cotxes-nous-a-andorra" element={<CotxesNousPage />} />
          <Route path="/cotxes-seminous-a-andorra" element={<CotxesSeminousPage />} />
          <Route path="/cotxes-de-segona-ma-a-andorra" element={<CotxesOcasioPage />} />
          <Route path="/cotxes-km0-a-andorra" element={<CotxesKm0AAndorra />} />
          <Route path="/cotxes-lloguer-a-andorra" element={<CotxesLloguerPage />} />
          <Route path="/cotxes-classics-a-andorra" element={<CotxesClassicsPage />} />
          <Route path="/cotxes-renting-a-andorra" element={<CotxesRentingPage />} />
          {/* Ruta privada para dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          {/* Rutas para admin dashboard */}
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/kars-vehicles" element={<PrivateRoute><KarsVehicles /></PrivateRoute>} />
          <Route path="/admin/vehicles/create" element={<PrivateRoute><CreateVehicle /></PrivateRoute>} />
          <Route path="/admin/vehicles/edit/:id" element={<PrivateRoute><EditVehicle /></PrivateRoute>} />
          <Route path="/admin/system-setup" element={<PrivateRoute><SystemSetup /></PrivateRoute>} />
          <Route path="/admin/system-info" element={<PrivateRoute><SystemInfo /></PrivateRoute>} />
          <Route path="/admin/blog" element={<PrivateRoute><BlogManagement /></PrivateRoute>} />
          <Route path="/admin/settings" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
          <Route path="/admin/installer" element={<PrivateRoute><SystemInstaller /></PrivateRoute>} />
          {/* Ruta dinámica para estado de vehículo */}
          <Route path="/estat-vehicle/:slug" element={<EstatVehiclePage />} />
          
          {/* Rutas localizadas - Español */}
          <Route path="/es" element={<Home onSearch={handleSearch} />} />
          <Route path="/es/vehiculos" element={<CotxesAndorra />} />
          <Route path="/es/vehiculos/:brand" element={<BrandPage />} />
          <Route path="/es/vehiculo/:slug" element={<VehicleDetail />} />
          <Route path="/es/ultimas-ventas" element={<UltimesVendes />} />
          <Route path="/es/ultimas-ventas/marca/:brand" element={<SoldBrandPage />} />
          <Route path="/es/ultimas-ventas/vehicle/:slug" element={<VehicleDetail isSoldVehicle={true} />} />
          <Route path="/es/quienes-somos" element={<QuiSom />} />
          <Route path="/es/taller" element={<Taller />} />
          <Route path="/es/servicios" element={<Serveis />} />
          <Route path="/es/contacto" element={<Contacta />} />
          <Route path="/es/favoritos" element={<FavoritosPage />} />
          
          {/* Rutas localizadas - Inglés */}
          <Route path="/en" element={<Home onSearch={handleSearch} />} />
          <Route path="/en/vehicles" element={<CotxesAndorra />} />
          <Route path="/en/vehicles/:brand" element={<BrandPage />} />
          <Route path="/en/vehicle/:slug" element={<VehicleDetail />} />
          <Route path="/en/latest-sales" element={<UltimesVendes />} />
          <Route path="/en/latest-sales/brand/:brand" element={<SoldBrandPage />} />
          <Route path="/en/latest-sales/vehicle/:slug" element={<VehicleDetail isSoldVehicle={true} />} />
          <Route path="/en/about-us" element={<QuiSom />} />
          <Route path="/en/workshop" element={<Taller />} />
          <Route path="/en/services" element={<Serveis />} />
          <Route path="/en/contact" element={<Contacta />} />
          <Route path="/en/favorites" element={<FavoritosPage />} />
          
          {/* Rutas localizadas - Francés */}
          <Route path="/fr" element={<Home onSearch={handleSearch} />} />
          <Route path="/fr/vehicules" element={<CotxesAndorra />} />
          <Route path="/fr/vehicules/:brand" element={<BrandPage />} />
          <Route path="/fr/vehicule/:slug" element={<VehicleDetail />} />
          <Route path="/fr/dernieres-ventes" element={<UltimesVendes />} />
          <Route path="/fr/dernieres-ventes/marque/:brand" element={<SoldBrandPage />} />
          <Route path="/fr/dernieres-ventes/vehicle/:slug" element={<VehicleDetail isSoldVehicle={true} />} />
          <Route path="/fr/qui-sommes-nous" element={<QuiSom />} />
          <Route path="/fr/atelier" element={<Taller />} />
          <Route path="/fr/services" element={<Serveis />} />
          <Route path="/fr/contact" element={<Contacta />} />
          <Route path="/fr/favoris" element={<FavoritosPage />} />
          
          {/* Rutas localizadas - Catalán */}
          <Route path="/ca" element={<Home onSearch={handleSearch} />} />
          <Route path="/ca/vehicles" element={<CotxesAndorra />} />
          <Route path="/ca/vehicles/:brand" element={<BrandPage />} />
          <Route path="/ca/vehicle/:slug" element={<VehicleDetail />} />
          <Route path="/ca/ultimes-vendes" element={<UltimesVendes />} />
          <Route path="/ca/ultimes-vendes/marca/:brand" element={<SoldBrandPage />} />
          <Route path="/ca/ultimes-vendes/vehicle/:slug" element={<VehicleDetail isSoldVehicle={true} />} />
          <Route path="/ca/qui-som" element={<QuiSom />} />
          <Route path="/ca/taller" element={<Taller />} />
          <Route path="/ca/serveis" element={<Serveis />} />
          <Route path="/ca/contacta" element={<Contacta />} />
          <Route path="/ca/favorits" element={<FavoritosPage />} />
        </Routes>
      </MainLayout>
      <SearchModal
        isOpen={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        vehicles={searchResults}
        searchQuery={searchQuery}
        isLoading={isLoading}
      />
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onOpenChange={setIsAdvancedSearchOpen}
        facets={facets}
      />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      </Router>
    </VehicleProvider>
    </LanguageProvider>
  );
}

export default App; 
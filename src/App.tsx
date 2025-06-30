import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import VehicleDetail from "./pages/VehicleDetail";
import NewVehicle from "./pages/NewVehicle";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
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
import FavoritosPage from "./pages/favoritos";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import VehicleListLayout from "./layouts/VehicleListLayout";
import SearchModal from "./components/SearchModal";
import { axiosAdmin } from "./api/axiosClient";

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
  return (
    <VehicleListLayout
      initialFilters={{ "estat-vehicle": slug ?? "", "anunci-actiu": true }}
      breadcrumbs={[
        { label: { es: `Estado: ${slug}`, ca: `Estat: ${slug}` }, href: `/estat-vehicle/${slug}` }
      ]}
      pageTitle={`Vehículos en estado: ${slug}`}
    />
  );
}

function App() {
  // Estado para el modal de búsqueda
  const [searchModalOpen, setSearchModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Callback global para búsqueda
  const handleSearch = async ({ vehicleType, searchTerm }) => {
    setSearchQuery(searchTerm || "");
    setSearchResults([]);
    setSearchModalOpen(true);
    setIsLoading(true);
    try {
      const params = {
        "anunci-actiu": true,
        per_page: 100,
      };
      if (vehicleType) params["tipus-vehicle"] = vehicleType;
      if (searchTerm) params["search"] = searchTerm;
      const res = await axiosAdmin.get("/vehicles", { params });
      const items = Array.isArray(res.data.items) ? res.data.items : [];
      setSearchResults(items);
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <Header onSearch={handleSearch} />
      <MainLayout>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home onSearch={handleSearch} />} />
          <Route path="/vehicle/:slug" element={<VehicleDetail />} />
          <Route path="/professional/:id" element={<ProfessionalProfile />} />
          <Route path="/new" element={<NewVehicle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vehicles-andorra" element={<CotxesAndorra />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
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
          {/* Ruta dinámica para estado de vehículo */}
          <Route path="/estat-vehicle/:slug" element={<EstatVehiclePage />} />
        </Routes>
      </MainLayout>
      <SearchModal
        isOpen={searchModalOpen}
        onOpenChange={setSearchModalOpen}
        vehicles={searchResults}
        searchQuery={searchQuery}
        isLoading={isLoading}
      />
    </Router>
  );
}

export default App; 
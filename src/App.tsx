import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import CotxesNousPage from "./pages/subpages/CotxesNousPage";
import CotxesSeminousPage from "./pages/subpages/CotxesSeminousPage";
import CotxesOcasioPage from "./pages/subpages/CotxesOcasioPage";
import CotxesKm0GerenciaPage from "./pages/subpages/CotxesKm0GerenciaPage";
import CotxesLloguerPage from "./pages/subpages/CotxesLloguerPage";
import CotxesClassicsPage from "./pages/subpages/CotxesClassicsPage";
import CotxesRentingPage from "./pages/subpages/CotxesRentingPage";
import FavoritosPage from "./pages/favoritos";
import ProfessionalProfile from "./pages/ProfessionalProfile";

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Login />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Header />
      <MainLayout>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
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
          <Route path="/cotxes-km0-a-andorra" element={<CotxesKm0GerenciaPage />} />
          <Route path="/cotxes-lloguer-a-andorra" element={<CotxesLloguerPage />} />
          <Route path="/cotxes-classics-a-andorra" element={<CotxesClassicsPage />} />
          <Route path="/cotxes-renting-a-andorra" element={<CotxesRentingPage />} />
          {/* Ruta privada para dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App; 
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
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/new" element={<NewVehicle />} />
          <Route path="/login" element={<Login />} />
          {/* Ruta privada para dashboard */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App; 
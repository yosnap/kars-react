import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { axiosAdmin } from "../api/axiosClient";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

interface Vehicle {
  id: string;
  [key: string]: unknown;
}

const VehicleDetail = () => {
  const { id } = useParams();
  const { user, axiosInstance } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    const client = user && axiosInstance ? axiosInstance : axiosAdmin;
    client
      .get(`/vehicles/${id}`)
      .then((res: { data: unknown }) => {
        const veh = res.data as Vehicle;
        setVehicle(veh);
        // Si no está autenticado y el vehículo no es activo, mostrar error
        if (!user && veh["anunci-actiu"] === false) {
          setError("Este vehículo no está disponible públicamente.");
        }
      })
      .catch(() => {
        setError("No se pudo cargar el vehículo");
      })
      .finally(() => setLoading(false));
  }, [id, user, axiosInstance]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!vehicle) return <div className="text-center py-8">No se encontró el vehículo.</div>;

  return (
    <div className="container mx-auto py-8">
      <PageBreadcrumbs
        items={[
          { label: { es: `Detalle vehículo ${id}`, ca: `Detall vehicle ${id}`, en: `Vehicle detail ${id}`, fr: `Détail véhicule ${id}` }, href: `/vehicle/${id}` }
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Detalle del Vehículo {vehicle.id}</h1>
      <pre>{JSON.stringify(vehicle, null, 2)}</pre>
    </div>
  );
};

export default VehicleDetail; 
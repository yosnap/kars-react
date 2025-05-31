import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

interface Vehicle {
  id: number;
  "titol-anunci"?: string;
  "marques-cotxe"?: string;
}

export default function Dashboard() {
  const { user, axiosInstance } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !user.username || !user.password || !axiosInstance) {
      setError("No autenticado");
      setLoading(false);
      return;
    }
    setLoading(true);
    axiosInstance
      .get("/vehicles")
      .then((res: { data: unknown }) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data as { items?: Vehicle[] }).items || [];
        setVehicles(data);
      })
      .catch(() => {
        setError("Error al cargar vehículos");
      })
      .finally(() => setLoading(false));
  }, [user, axiosInstance]);

  if (!user) return <div>Inicia sesión para ver tus vehículos.</div>;
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Dashboard profesional</h1>
      <pre>{JSON.stringify(vehicles, null, 2)}</pre>
    </div>
  );
} 
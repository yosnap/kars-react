import { useEffect, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import VehicleCard, { VehicleCardSkeleton } from "../components/VehicleCard";
import { useNavigate } from "react-router-dom";

interface Vehicle {
  id: string;
  "titol-anunci"?: string;
  "descripcio-anunci"?: string;
  "marques-cotxe"?: string;
  "models-cotxe"?: string;
  "estat-vehicle"?: string;
  "any"?: string;
  "quilometratge"?: number;
  "preu"?: number;
  "color-vehicle"?: string;
  "tipus-combustible"?: string;
  "anunci-destacat"?: boolean;
  "imatge-destacada-url"?: string;
  "galeria-vehicle-urls"?: string[];
  // Agrega aquí otros campos relevantes según la API
}

export default function FavoritosPage() {
  const { favorites } = useFavorites();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (favorites.length === 0) {
      setVehicles([]);
      return;
    }
    setVehicles([]);
    setLoading(true);
    setError("");
    Promise.all(
      favorites.map(id =>
        import("../api/axiosClient").then(({ axiosAdmin }) =>
          axiosAdmin.get(`/vehicles/${id}`)
            .then(res => res.data)
            .catch(() => null)
        )
      )
    )
      .then(results => {
        setVehicles(results.filter(Boolean));
      })
      .catch(() => setError("Error al cargar favoritos"))
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Mis Favoritos</h1>
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        )}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!loading && vehicles.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg mb-4">No tienes vehículos guardados en favoritos.</p>
            <button
              className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/")}
            >
              Volver al inicio
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((v) => {
            const uiVehicle = {
              id: v.id,
              ["titol-anunci"]: v["titol-anunci"] ?? "",
              ["descripcio-anunci"]: v["descripcio-anunci"] ?? "",
              ["marques-cotxe"]: v["marques-cotxe"] ?? "",
              ["models-cotxe"]: v["models-cotxe"] ?? "",
              ["estat-vehicle"]: v["estat-vehicle"] ?? "",
              ["any"]: v["any"] ?? "",
              ["quilometratge"]: v["quilometratge"] !== undefined && v["quilometratge"] !== null ? String(v["quilometratge"]) : "",
              ["preu"]: v["preu"] !== undefined && v["preu"] !== null ? String(v["preu"]) : "",
              ["color-vehicle"]: v["color-vehicle"] ?? "",
              ["tipus-combustible"]: v["tipus-combustible"] ?? "",
              ["anunci-destacat"]: v["anunci-destacat"] !== undefined ? String(v["anunci-destacat"]) : "",
              ["imatge-destacada-url"]: v["imatge-destacada-url"] ?? "",
              ["galeria-vehicle-urls"]: Array.isArray(v["galeria-vehicle-urls"]) ? v["galeria-vehicle-urls"] : [],
            };
            return <VehicleCard key={v.id} vehicle={uiVehicle} />;
          })}
        </div>
      </div>
    </div>
  );
} 
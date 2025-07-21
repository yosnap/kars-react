import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import FeaturedVehicles from "../components/FeaturedVehicles";
import VehicleCard from "../components/VehicleCard";
import Footer from "../components/Footer";
import type { VehicleUI } from "../components/VehicleCard";

export default function Home({ onSearch }: { onSearch: (params: { vehicleType?: string; searchTerm?: string }) => void }) {
  const [vehicles, setVehicles] = useState<VehicleUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Consulta a la API con paginación (sin filtros, solo para mostrar últimos vehículos)
  useEffect(() => {
    setLoading(true);
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const params = {
        "anunci-actiu": "true",
        venut: "false",
        per_page: 12,
        orderby: "date",
        order: "DESC"
      };
      
      axiosAdmin.get("/vehicles", { params })
        .then(res => {
          // Doble filtro: activos y no vendidos
          const ultimos = (res.data.items || []).filter(
            (v: any) => {
              const activo = v["anunci-actiu"] === "true" || v["anunci-actiu"] === true;
              const noVendido = v["venut"] === "false" || v["venut"] === false || !v["venut"];
              return activo && noVendido;
            }
          ).map((v: { [key: string]: unknown }) => ({
            id: String(v.id),
            ["titol-anunci"]: v["titol-anunci"] ?? "",
            ["descripcio-anunci"]: v["descripcio-anunci"] ?? "",
            ["marques-cotxe"]: v["marques-cotxe"] ?? "",
            ["models-cotxe"]: v["models-cotxe"] ?? "",
            ["estat-vehicle"]: v["estat-vehicle"] ?? "",
            any: v["any"] ?? "",
            quilometratge: v["quilometratge"] !== undefined && v["quilometratge"] !== null ? String(v["quilometratge"]) : "",
            preu: v["preu"] !== undefined && v["preu"] !== null ? String(v["preu"]) : "",
            ["color-vehicle"]: v["color-vehicle"] ?? "",
            ["tipus-combustible"]: v["tipus-combustible"] ?? "",
            ["potencia-cv"]: v["potencia-cv"] !== undefined && v["potencia-cv"] !== null ? String(v["potencia-cv"]) : "",
            slug: v["slug"] ?? "",
            ["anunci-destacat"]: v["anunci-destacat"] !== undefined ? String(v["anunci-destacat"]) : "",
            ["imatge-destacada-url"]: v["imatge-destacada-url"] ?? ""
          })) as VehicleUI[];
          setVehicles(ultimos);
        })
        .catch(() => {
          setError("Error en carregar vehicles");
        })
        .finally(() => setLoading(false));
    });
  }, []);


  return (
    <div className="min-h-screen">
      <HeroSection onSearch={onSearch} />
      <FeaturedVehicles />
      {/* Últimos vehículos añadidos */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-8 text-center text-white">Últims Vehicles Afegits</h2>
          {loading && <div>Carregant...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
        {/* Botón Ver Más Vehículos */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/vehicles")}
            className="bg-primary text-white px-8 py-4 text-lg font-bold rounded-lg border-2 border-transparent hover:border-white hover:bg-black transition-all duration-300"
          >
            VEURE MÉS VEHICLES
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
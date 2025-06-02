import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import FeaturedVehicles from "../components/FeaturedVehicles";
import ProfessionalsSection from "../components/ProfessionalsSection";
import QuickLinksSection from "../components/QuickLinksSection";
import VehicleCard from "../components/VehicleCard";
import AdBanner from "../components/AdBanner";
import Footer from "../components/Footer";
import FloatingFilterButton from "../components/FloatingFilterButton";
import VehicleFilters from "../components/VehicleFilters";
import type { VehicleUI } from "../components/VehicleCard";

export default function Home() {
  const [vehicles, setVehicles] = useState<VehicleUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // Consulta a la API con paginación (sin filtros, solo para mostrar últimos vehículos)
  useEffect(() => {
    setLoading(true);
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      axiosAdmin.get("/vehicles", {
        params: {
          "anunci-actiu": true,
          venut: false,
          per_page: 12,
          order: "desc"
        }
      })
        .then(res => {
          // Filtrar solo activos y no vendidos (ambos como string)
          const ultimos = (res.data.items || []).filter(
            (v: Record<string, string>) => v["anunci-actiu"] === "true" && v["venut"] === "false"
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
            slug: v["slug"] ?? "",
            ["anunci-destacat"]: v["anunci-destacat"] !== undefined ? String(v["anunci-destacat"]) : "",
            ["imatge-destacada-url"]: v["imatge-destacada-url"] ?? ""
          })) as VehicleUI[];
          setVehicles(ultimos);
        })
        .catch(() => {
          setError("Error al cargar vehículos");
        })
        .finally(() => setLoading(false));
    });
  }, []);

  // Callback para aplicar filtros: navegar a /cotxes-andorra con los filtros como query params
  const handleApplyFilters = (filters: Record<string, string>) => {
    setIsFilterSidebarOpen(false);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    navigate(`/vehicles-andorra?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      {/* Banner superior */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner size="small" position="header" />
      </div>
      <FeaturedVehicles />
      {/* Últimos vehículos añadidos */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Últimos Vehículos Añadidos</h2>
          {loading && <div>Cargando...</div>}
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
            onClick={() => navigate("/vehicles-andorra")}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Ver Más Vehículos
          </button>
        </div>
      </div>
      <ProfessionalsSection />
      <QuickLinksSection />
      {/* Banner de contenido */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner size="small" position="content" />
      </div>
      <FloatingFilterButton onClick={() => setIsFilterSidebarOpen(true)} />
      {/* Sidebar de filtros usando el nuevo componente */}
      {isFilterSidebarOpen && (
        <div className="fixed top-0 right-0 h-full w-full max-w-xs z-40 flex justify-end pointer-events-none">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-l-2xl h-full w-full max-w-xs p-6 overflow-y-auto relative pointer-events-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => setIsFilterSidebarOpen(false)}
              aria-label="Cerrar filtros"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Filtrar vehículos</h3>
            <VehicleFilters onApply={handleApplyFilters} />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
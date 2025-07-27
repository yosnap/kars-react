import { useEffect, useState } from "react";
import { useFavorites } from "../hooks/useFavorites";
import VehicleCard, { VehicleCardSkeleton } from "../components/VehicleCard";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";
import type { VehicleUI } from "../components/VehicleCard";

interface Vehicle {
  id: string;
  titolAnunci?: string;
  "titol-anunci"?: string;
  descripcioAnunci?: string;
  "descripcio-anunci"?: string;
  marquesCotxe?: string;
  "marques-cotxe"?: string;
  modelsCotxe?: string;
  "models-cotxe"?: string;
  estatVehicle?: string;
  "estat-vehicle"?: string;
  any?: string;
  quilometratge?: number;
  preu?: number;
  preuAntic?: number;
  preuAnterior?: number;
  "preu-antic"?: number;
  "preu-anterior"?: number;
  colorVehicle?: string;
  "color-vehicle"?: string;
  tipusCombustible?: string;
  "tipus-combustible"?: string;
  potenciaCv?: number;
  "potencia-cv"?: number;
  anunciDestacat?: boolean;
  "anunci-destacat"?: boolean;
  anunciActiu?: boolean;
  "anunci-actiu"?: boolean;
  venut?: boolean;
  imatgeDestacadaUrl?: string;
  "imatge-destacada-url"?: string;
  galeriaVehicleUrls?: string[];
  "galeria-vehicle-urls"?: string[];
  slug?: string;
}

export default function FavoritosPage() {
  const { favorites } = useFavorites();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (favorites.length === 0) {
      setVehicles([]);
      return;
    }
    setVehicles([]);
    setLoading(true);
    setError("");
    // Intentar carregar tots els vehicles i filtrar per IDs de favorits
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const params = {
        "anunci-actiu": "true",
        venut: "false",
        per_page: 100, // Obtener suficientes vehículos
        orderby: "date",
        order: "DESC"
      };
      
      return axiosAdmin.get("/vehicles", { params })
        .then(res => {
          const allVehicles = res.data.items || [];
          
          // Filtrar només els vehicles que estan a favorits
          const favoriteVehicles = allVehicles.filter((vehicle: any) => 
            favorites.includes(String(vehicle.id))
          );
          
          setVehicles(favoriteVehicles);
        });
    })
      .catch(error => {
        console.error("Error carregant favorits:", error);
        setError("Error en carregar favorits");
      })
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">{t('favorites.title')}</h1>
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        )}
        {error && <div className="text-red-600 mb-4 text-center bg-white p-4 rounded-lg">{t('favorites.error_loading')}</div>}
        {!loading && vehicles.length === 0 && (
          <div className="py-12 text-center">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg max-w-md mx-auto">
              <p className="text-lg mb-4 text-gray-800">{t('favorites.no_vehicles')}</p>
              <button
                className="bg-primary text-white px-8 py-4 text-lg font-bold rounded-lg border-2 border-transparent hover:border-white hover:bg-black hover:text-white transition-all duration-300"
                onClick={() => navigate("/")}
              >
                {t('favorites.back_home')}
              </button>
            </div>
          </div>
        )}
        {vehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((v) => {
              const uiVehicle: VehicleUI = {
                id: v.id,
                ["titol-anunci"]: v.titolAnunci || v["titol-anunci"] || "",
                ["descripcio-anunci"]: v.descripcioAnunci || v["descripcio-anunci"] || "",
                ["marques-cotxe"]: v.marquesCotxe || v["marques-cotxe"] || "",
                ["models-cotxe"]: v.modelsCotxe || v["models-cotxe"] || "",
                ["estat-vehicle"]: v.estatVehicle || v["estat-vehicle"] || "",
                any: v.any || "",
                quilometratge: v.quilometratge !== undefined && v.quilometratge !== null ? String(v.quilometratge) : "",
                preu: v.preu !== undefined && v.preu !== null ? String(v.preu) : "",
                "preu-antic": v.preuAntic || v["preu-antic"] ? String(v.preuAntic || v["preu-antic"]) : "",
                "preu-anterior": v.preuAnterior || v["preu-anterior"] ? String(v.preuAnterior || v["preu-anterior"]) : "",
                preuAntic: v.preuAntic || v["preu-antic"] ? String(v.preuAntic || v["preu-antic"]) : "",
                preuAnterior: v.preuAnterior || v["preu-anterior"] ? String(v.preuAnterior || v["preu-anterior"]) : "",
                ["color-vehicle"]: v.colorVehicle || v["color-vehicle"] || "",
                ["tipus-combustible"]: v.tipusCombustible || v["tipus-combustible"] || "",
                ["potencia-cv"]: v.potenciaCv || v["potencia-cv"] ? String(v.potenciaCv || v["potencia-cv"]) : "",
                slug: v.slug || "",
                ["anunci-destacat"]: v.anunciDestacat !== undefined ? String(v.anunciDestacat) : (v["anunci-destacat"] !== undefined ? String(v["anunci-destacat"]) : ""),
                ["anunci-actiu"]: v.anunciActiu !== undefined ? String(v.anunciActiu) : (v["anunci-actiu"] !== undefined ? String(v["anunci-actiu"]) : "true"),
                venut: v.venut !== undefined ? String(v.venut) : "false",
                ["imatge-destacada-url"]: v.imatgeDestacadaUrl || v["imatge-destacada-url"] || ""
              };
              return <VehicleCard key={v.id} vehicle={uiVehicle} />;
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
} 
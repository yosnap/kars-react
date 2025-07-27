import { useSearchParams } from "react-router-dom";
import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function CotxesAndorra() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  
  // Construir filtros iniciales desde los parámetros de búsqueda
  const initialFilters: Record<string, any> = { 
    "anunci-actiu": "true",
    "venut": "false"
  };
  
  // Agregar filtros de la URL si existen
  if (searchParams.get("tipus-vehicle")) {
    initialFilters["tipus-vehicle"] = searchParams.get("tipus-vehicle");
  }
  
  if (searchParams.get("search")) {
    initialFilters["search"] = searchParams.get("search");
  }
  
  if (searchParams.get("marques-cotxe")) {
    initialFilters["marques-cotxe"] = searchParams.get("marques-cotxe");
  }
  
  if (searchParams.get("marques-moto")) {
    initialFilters["marques-moto"] = searchParams.get("marques-moto");
  }
  
  if (searchParams.get("estat-vehicle")) {
    initialFilters["estat-vehicle"] = searchParams.get("estat-vehicle");
  }

  return (
    <VehicleListLayout
      pageTitle={t('pages.all_vehicles')}
      breadcrumbs={[
        { label: { es: "Todos los vehículos", ca: "Tots els vehicles", en: "All vehicles", fr: "Tous les véhicules" }, href: "/vehicles" }
      ]}
      initialFilters={initialFilters}
      hideFilters={true}
    />
  );
}
 
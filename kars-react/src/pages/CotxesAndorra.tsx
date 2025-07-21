import { useSearchParams } from "react-router-dom";
import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesAndorra() {
  const [searchParams] = useSearchParams();
  
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

  return (
    <VehicleListLayout
      pageTitle="Tots els vehicles"
      breadcrumbs={[
        { label: { es: "Todos los vehículos", ca: "Tots els vehicles", en: "All vehicles", fr: "Tous les véhicules" }, href: "/vehicles" }
      ]}
      initialFilters={initialFilters}
      hideFilters={true}
    />
  );
}
 
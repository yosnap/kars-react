import { useSearchParams } from "react-router-dom";
import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function UltimesVendes() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  
  // Construir filtros iniciales desde los parámetros de búsqueda
  const initialFilters: Record<string, any> = { 
    "anunci-actiu": true,
    "venut": true  // Solo vehículos vendidos
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
      pageTitle={t('pages.latest_sales')}
      breadcrumbs={[
        { label: { es: "Últimas ventas", ca: "Últimes vendes", en: "Latest sales", fr: "Dernières ventes" }, href: "/ultimes-vendes" }
      ]}
      initialFilters={initialFilters}
      hideFilters={true}
      showSoldButton={true}  // Nueva prop para mostrar botón "Venut"
      defaultSortBy="date_desc"  // Orden por fecha descendente (fecha de edición)
    />
  );
}
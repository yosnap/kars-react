import { useParams } from "react-router-dom";
import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";

export default function BrandPage() {
  const { brand } = useParams<{ brand: string }>();
  const { t } = useLanguage();
  const [brandLabel, setBrandLabel] = useState<string>("");
  
  // Capitalizar la primera letra de la marca para mostrar
  const displayBrand = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : "";
  
  useEffect(() => {
    if (brand) {
      // Aquí podrías hacer una llamada a la API para obtener el nombre correcto de la marca
      // Por ahora, simplemente usamos la marca formateada del slug
      setBrandLabel(displayBrand);
    }
  }, [brand, displayBrand]);
  
  // Construir filtros iniciales para vehículos disponibles
  const initialFilters: Record<string, any> = { 
    "anunci-actiu": "true", // Solo activos
    "venut": "false" // Solo no vendidos (disponibles)
  };
  
  // Agregar filtro de marca unificado
  if (brand) {
    initialFilters["marca"] = brand;
  }

  return (
    <VehicleListLayout
      pageTitle={`${t('pages.all_vehicles')} - ${brandLabel}`}
      breadcrumbs={[
        { 
          label: { 
            es: "Todos los vehículos", 
            ca: "Tots els vehicles", 
            en: "All vehicles", 
            fr: "Tous les véhicules" 
          }, 
          href: "/vehicles" 
        },
        {
          label: {
            es: brandLabel,
            ca: brandLabel,
            en: brandLabel,
            fr: brandLabel
          },
          href: ""
        }
      ]}
      initialFilters={initialFilters}
      hideFilters={true}
    />
  );
}
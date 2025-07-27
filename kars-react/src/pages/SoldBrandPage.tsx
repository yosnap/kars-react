import { useParams } from "react-router-dom";
import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";

export default function SoldBrandPage() {
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
  
  // Construir filtros iniciales para vehículos vendidos
  const initialFilters: Record<string, any> = { 
    "venut": "true" // Solo vendidos
  };
  
  // Agregar filtro de marca unificado
  if (brand) {
    initialFilters["marca"] = brand;
  }
  

  return (
    <VehicleListLayout
      pageTitle={`${t('nav.latest_sales')} - ${brandLabel}`}
      breadcrumbs={[
        { 
          label: { 
            es: "Últimas ventas", 
            ca: "Últimes vendes", 
            en: "Latest sales", 
            fr: "Dernières ventes" 
          }, 
          href: "/ultimes-vendes" 
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
      showSoldButton={true} // Mostrar botón "Vendido" en lugar de "Ver más"
    />
  );
}
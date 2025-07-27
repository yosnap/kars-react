import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function CotxesKm0AAndorra() {
  const { t } = useLanguage();
  
  return (
    <VehicleListLayout
      pageTitle={t('pages.km0_cars_andorra')}
      breadcrumbs={[
        { label: { es: "Coches km0", ca: "Cotxes km0", en: "Zero km cars", fr: "Voitures 0 km" }, href: "/cotxes-km0-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "km0-gerencia", "anunci-actiu": true }}
      lockedStateValue="km0-gerencia"
      hideFilters={true}
    />
  );
} 
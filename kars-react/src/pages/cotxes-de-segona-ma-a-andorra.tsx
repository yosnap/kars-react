import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function CotxesDeSegonaMaAAndorra() {
  const { t } = useLanguage();
  
  return (
    <VehicleListLayout
      pageTitle={t('pages.second_hand_cars_andorra')}
      breadcrumbs={[
        { label: { es: "Coches de segunda mano", ca: "Cotxes de segona mà", en: "Used cars", fr: "Voitures d'occasion" }, href: "/cotxes-de-segona-ma-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "ocasio", "anunci-actiu": true }}
      lockedStateValue="ocasio"
      hideFilters={true}
    />
  );
} 
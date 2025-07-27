import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function CotxesRentingAAndorra() {
  const { t } = useLanguage();
  
  return (
    <VehicleListLayout
      pageTitle={t('pages.renting_cars_andorra')}
      breadcrumbs={[
        { label: { es: "Coches de renting", ca: "Cotxes de renting", en: "Renting cars", fr: "Voitures en renting" }, href: "/cotxes-renting-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "renting", "anunci-actiu": true }}
      lockedStateValue="renting"
      hideFilters={true}
    />
  );
} 
import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function CotxesSeminousAAndorra() {
  const { t } = useLanguage();
  
  return (
    <VehicleListLayout
      pageTitle={t('pages.seminew_cars_andorra')}
      breadcrumbs={[
        { label: { es: "Coches seminuevos", ca: "Cotxes seminous", en: "Nearly new cars", fr: "Voitures semi-neuves" }, href: "/cotxes-seminous-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "seminou", "anunci-actiu": true }}
      lockedStateValue="seminou"
      hideFilters={true}
    />
  );
} 
import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function CotxesNousAAndorra() {
  const { t } = useLanguage();
  
  return (
    <VehicleListLayout
      pageTitle={t('pages.new_cars_andorra')}
      breadcrumbs={[
        { label: { es: "Coches nuevos", ca: "Cotxes nous", en: "New cars", fr: "Voitures neuves" }, href: "/cotxes-nous-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "nou" }}
      lockedStateValue="nou"
      hideFilters={true}
    />
  );
} 
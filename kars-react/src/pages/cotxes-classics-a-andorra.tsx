import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function CotxesClassicsAAndorra() {
  const { t } = useLanguage();
  
  return (
    <VehicleListLayout
      pageTitle={t('pages.classic_cars_andorra')}
      breadcrumbs={[
        { label: { es: "Coches clásicos", ca: "Cotxes clàssics", en: "Classic cars", fr: "Voitures classiques" }, href: "/cotxes-classics-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "classic", "anunci-actiu": true }}
      lockedStateValue="classic"
      hideFilters={true}
    />
  );
} 
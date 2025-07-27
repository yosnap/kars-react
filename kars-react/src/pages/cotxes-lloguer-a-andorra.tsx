import VehicleListLayout from "../layouts/VehicleListLayout";
import { useLanguage } from "../context/LanguageContext";

export default function CotxesLloguerAAndorra() {
  const { t } = useLanguage();
  
  return (
    <VehicleListLayout
      pageTitle={t('pages.rental_cars_andorra')}
      breadcrumbs={[
        { label: { es: "Coches de alquiler", ca: "Cotxes de lloguer", en: "Rental cars", fr: "Voitures de location" }, href: "/cotxes-lloguer-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "lloguer", "anunci-actiu": true }}
      lockedStateValue="lloguer"
      hideFilters={true}
    />
  );
} 
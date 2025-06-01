import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesDeSegonaMaAAndorra() {
  return (
    <VehicleListLayout
      pageTitle="Coches de segunda mano en Andorra"
      breadcrumbs={[
        { label: { es: "Coches de segunda mano", ca: "Cotxes de segona mà", en: "Used cars", fr: "Voitures d'occasion" }, href: "/cotxes-de-segona-ma-a-andorra" }
          ]}
      initialFilters={{ "estat-vehicle": "ocasio", "anunci-actiu": true }}
    />
  );
} 
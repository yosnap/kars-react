import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesLloguerAAndorra() {
  return (
    <VehicleListLayout
      pageTitle="Coches de alquiler en Andorra"
      breadcrumbs={[
        { label: { es: "Coches de alquiler", ca: "Cotxes de lloguer", en: "Rental cars", fr: "Voitures de location" }, href: "/cotxes-lloguer-a-andorra" }
          ]}
      initialFilters={{ "estat-vehicle": "lloguer", "anunci-actiu": true }}
    />
  );
} 
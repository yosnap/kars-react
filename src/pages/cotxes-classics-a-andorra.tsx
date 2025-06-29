import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesClassicsAAndorra() {
  return (
    <VehicleListLayout
      pageTitle="Coches clásicos en Andorra"
      breadcrumbs={[
        { label: { es: "Coches clásicos", ca: "Cotxes clàssics", en: "Classic cars", fr: "Voitures classiques" }, href: "/cotxes-classics-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "classic", "anunci-actiu": true }}
      lockedStateValue="classic"
    />
  );
} 
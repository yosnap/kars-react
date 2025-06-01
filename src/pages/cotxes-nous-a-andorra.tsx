import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesNousAAndorra() {
  return (
    <VehicleListLayout
      pageTitle="Coches nuevos en Andorra"
      breadcrumbs={[
        { label: { es: "Coches nuevos", ca: "Cotxes nous", en: "New cars", fr: "Voitures neuves" }, href: "/cotxes-nous-a-andorra" }
          ]}
      initialFilters={{ "estat-vehicle": "nou", "anunci-actiu": true }}
    />
  );
} 
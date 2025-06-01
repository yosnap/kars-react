import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesKm0AAndorra() {
  return (
    <VehicleListLayout
      pageTitle="Coches km0 en Andorra"
      breadcrumbs={[
        { label: { es: "Coches km0", ca: "Cotxes km0", en: "Zero km cars", fr: "Voitures 0 km" }, href: "/cotxes-km0-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "km0", "anunci-actiu": true }}
    />
  );
} 
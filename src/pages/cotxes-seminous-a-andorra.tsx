import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesSeminousAAndorra() {
  return (
    <VehicleListLayout
      pageTitle="Coches seminuevos en Andorra"
      breadcrumbs={[
        { label: { es: "Coches seminuevos", ca: "Cotxes seminous", en: "Nearly new cars", fr: "Voitures semi-neuves" }, href: "/cotxes-seminous-a-andorra" }
          ]}
      initialFilters={{ "estat-vehicle": "seminou", "anunci-actiu": true }}
    />
  );
} 
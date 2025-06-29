import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesRentingAAndorra() {
  return (
    <VehicleListLayout
      pageTitle="Coches de renting en Andorra"
      breadcrumbs={[
        { label: { es: "Coches de renting", ca: "Cotxes de renting", en: "Renting cars", fr: "Voitures en renting" }, href: "/cotxes-renting-a-andorra" }
      ]}
      initialFilters={{ "estat-vehicle": "renting", "anunci-actiu": true }}
      lockedStateValue="renting"
    />
  );
} 
import VehicleListLayout from "../layouts/VehicleListLayout";

export default function CotxesAndorra() {
  return (
    <VehicleListLayout
      pageTitle="Todos los vehículos"
      breadcrumbs={[
        { label: { es: "Todos los vehículos", ca: "Tots els vehicles", en: "All vehicles", fr: "Tous les véhicules" }, href: "/vehicles-andorra" }
      ]}
      initialFilters={{ "anunci-actiu": true }}
    />
  );
}
 
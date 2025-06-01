import VehicleListLayout from "../../layouts/VehicleListLayout";

const CotxesSeminousPage = () => (
  <VehicleListLayout
    basePath="/cotxes-seminous-a-andorra"
    breadcrumbs={[
      { label: { es: "Vehículos seminuevos", ca: "Vehicles seminous", en: "Nearly new vehicles", fr: "Véhicules semi-neufs" }, href: "/cotxes-seminous-a-andorra" }
    ]}
    pageTitle="Vehículos seminuevos"
    initialFilters={{ "estat-vehicle": "seminou", "anunci-actiu": "true" }}
    columns={3}
  />
  );

export default CotxesSeminousPage; 
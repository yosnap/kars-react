import VehicleListLayout from "../../layouts/VehicleListLayout";

const CotxesNousPage = () => (
  <VehicleListLayout
    basePath="/cotxes-nous-a-andorra"
    breadcrumbs={[
      { label: { es: "Coches nuevos", ca: "Cotxes nous", en: "New cars", fr: "Voitures neuves" }, href: "/cotxes-nous-a-andorra" }
    ]}
    pageTitle="Coches nuevos"
    initialFilters={{ "estat-vehicle": "nou", "anunci-actiu": "true" }}
    columns={3}
  />
);

export default CotxesNousPage;
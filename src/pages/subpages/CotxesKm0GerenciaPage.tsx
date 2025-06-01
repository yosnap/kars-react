import VehicleListLayout from "../../layouts/VehicleListLayout";

const CotxesKm0GerenciaPage = () => {
  return (
    <VehicleListLayout
      initialFilters={{ "estat-vehicle": "km0-gerencia", "anunci-actiu": true }}
      breadcrumbs={[
        {
          label: { ca: "Cotxes km0/gerència", es: "Coches km0/gerencia", en: "Km0/management cars", fr: "Voitures km0/gestion" },
          href: "/cotxes-km0-gerencia-a-andorra"
        }
      ]}
      pageTitle="Cotxes km0/gerència a Andorra"
      basePath="/cotxes-km0-gerencia-a-andorra"
      columns={3}
    />
  );
};

export default CotxesKm0GerenciaPage; 
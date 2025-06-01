import VehicleListLayout from "../../layouts/VehicleListLayout";

const CotxesOcasioPage = () => {
  return (
    <VehicleListLayout
      initialFilters={{ "estat-vehicle": "ocasio", "anunci-actiu": true }}
      breadcrumbs={[
        {
          label: { ca: "Cotxes d'ocasió", es: "Coches de ocasión", en: "Used cars", fr: "Voitures d'occasion" },
          href: "/cotxes-ocasio-a-andorra"
        }
      ]}
      pageTitle="Cotxes d'ocasió a Andorra"
      basePath="/cotxes-ocasio-a-andorra"
      columns={3}
    />
  );
};

export default CotxesOcasioPage; 
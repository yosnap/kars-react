import VehicleListLayout from "../../layouts/VehicleListLayout";

const CotxesLloguerPage = () => {
  return (
    <VehicleListLayout
      initialFilters={{ "estat-vehicle": "lloguer", "anunci-actiu": true }}
      breadcrumbs={[
        {
          label: { ca: "Cotxes de lloguer", es: "Coches de alquiler", en: "Rental cars", fr: "Voitures de location" },
          href: "/cotxes-lloguer-a-andorra"
        }
      ]}
      pageTitle="Cotxes de lloguer a Andorra"
      basePath="/cotxes-lloguer-a-andorra"
      columns={3}
    />
  );
};

export default CotxesLloguerPage; 
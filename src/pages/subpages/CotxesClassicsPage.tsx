import VehicleListLayout from "../../layouts/VehicleListLayout";

const CotxesClassicsPage = () => {
  return (
    <VehicleListLayout
      initialFilters={{ "estat-vehicle": "classic", "anunci-actiu": true }}
      breadcrumbs={[
        {
          label: { ca: "Cotxes clàssics", es: "Coches clásicos", en: "Classic cars", fr: "Voitures classiques" },
          href: "/cotxes-classics-a-andorra"
        }
      ]}
      pageTitle="Cotxes clàssics a Andorra"
      basePath="/cotxes-classics-a-andorra"
      columns={3}
    />
  );
};

export default CotxesClassicsPage; 
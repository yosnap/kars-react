import VehicleListLayout from "../../layouts/VehicleListLayout";

const CotxesRentingPage = () => {
  return (
    <VehicleListLayout
      initialFilters={{ "estat-vehicle": "renting", "anunci-actiu": true }}
      breadcrumbs={[
        {
          label: { ca: "Cotxes de renting", es: "Coches de renting", en: "Renting cars", fr: "Voitures en renting" },
          href: "/cotxes-renting-a-andorra"
        }
      ]}
      pageTitle="Cotxes de renting a Andorra"
      basePath="/cotxes-renting-a-andorra"
      columns={3}
    />
  );
};

export default CotxesRentingPage; 
import React from "react";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

const NewVehicle = () => {
  return (
    <div className="container mx-auto py-8">
      <PageBreadcrumbs
        items={[
          { label: { es: "Nuevo vehículo", ca: "Vehicle nou", en: "New vehicle", fr: "Nouveau véhicule" }, href: "/add-vehicle" }
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Nuevo Vehículo</h1>
      {/* Aquí irá el formulario para crear un vehículo */}
    </div>
  );
};

export default NewVehicle; 
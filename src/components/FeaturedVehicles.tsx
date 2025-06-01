import VehicleCard from "./VehicleCard";

const FeaturedVehicles = () => {
  // Mock data para vehículos destacados
  const featuredVehicles = [
    {
      id: "288027",
      "titol-anunci": "Peugeot 208 GT EAT8",
      "descripcio-anunci": "Vehículo en excelente estado",
      "marques-cotxe": "Peugeot",
      "models-cotxe": "208",
      "estat-vehicle": "Ocasión",
      any: "2021",
      quilometratge: 32000,
      preu: 18500,
      "color-vehicle": "Azul",
      "tipus-combustible": "Gasolina",
      "anunci-destacat": true,
      "imatge-destacada-url": "https://images.unsplash.com/photo-1619976215201-e5985fd80b0e?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    },
    // ...otros vehículos
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-center mb-2">Vehículos Destacados</h2>
          <p className="text-center text-gray-600 mb-6">
            Los mejores vehículos seleccionados por nuestros profesionales
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} crown={true} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVehicles; 
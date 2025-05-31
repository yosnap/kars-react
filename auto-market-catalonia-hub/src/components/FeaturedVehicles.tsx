
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VehicleCard from "./VehicleCard";

const FeaturedVehicles = () => {
  // Mock data for featured vehicles
  const featuredVehicles = [
    {
      id: "288027",
      "titol-anunci": "Peugeot 208 GT EAT8",
      "descripcio-anunci": "Vehículo en excelente estado",
      "marques-cotxe": "Peugeot",
      "models-cotxe": "208",
      "estat-vehicle": "Ocasión",
      "any": "2021",
      "quilometratge": "32000",
      "preu": "18500",
      "color-vehicle": "Azul",
      "tipus-combustible": "Gasolina",
      "anunci-destacat": "true",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1619976215201-e5985fd80b0e?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    },
    {
      id: "288028",
      "titol-anunci": "BMW Serie 3 320d",
      "descripcio-anunci": "BMW en perfecto estado",
      "marques-cotxe": "BMW",
      "models-cotxe": "Serie 3",
      "estat-vehicle": "Ocasión",
      "any": "2020",
      "quilometratge": "45000",
      "preu": "32000",
      "color-vehicle": "Blanco",
      "tipus-combustible": "Diésel",
      "anunci-destacat": "true",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    },
    {
      id: "288029",
      "titol-anunci": "Volkswagen Golf GTI",
      "descripcio-anunci": "Deportivo en excelentes condiciones",
      "marques-cotxe": "Volkswagen",
      "models-cotxe": "Golf",
      "estat-vehicle": "Km 0",
      "any": "2023",
      "quilometratge": "5000",
      "preu": "35000",
      "color-vehicle": "Rojo",
      "tipus-combustible": "Gasolina",
      "anunci-destacat": "true",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    },
    {
      id: "288030",
      "titol-anunci": "Mercedes-Benz Clase A",
      "descripcio-anunci": "Compacto premium",
      "marques-cotxe": "Mercedes-Benz",
      "models-cotxe": "Clase A",
      "estat-vehicle": "Nuevo",
      "any": "2024",
      "quilometratge": "0",
      "preu": "42000",
      "color-vehicle": "Negro",
      "tipus-combustible": "Híbrido",
      "anunci-destacat": "true",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Vehículos Destacados
            </CardTitle>
            <p className="text-center text-gray-600">
              Los mejores vehículos seleccionados por nuestros profesionales
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FeaturedVehicles;

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Vehicle {
  id: string;
  "titol-anunci": string;
  "descripcio-anunci": string;
  "marques-cotxe": string;
  "models-cotxe": string;
  "estat-vehicle": string;
  "any": string;
  "quilometratge": string;
  "preu": string;
  "color-vehicle": string;
  "tipus-combustible": string;
  "anunci-destacat": string;
  "imatge-destacada-url": string;
  "galeria-vehicle-urls": string[];
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  const formatKilometers = (km: string) => {
    return new Intl.NumberFormat('es-ES').format(parseInt(km)) + ' km';
  };

  const handleViewMore = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  console.log('Vehicle destacat:', vehicle["anunci-destacat"], typeof vehicle["anunci-destacat"]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative">
      {vehicle["anunci-destacat"] === "true" && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-tertiary rounded-full p-2">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      {/* Favorites icon - always visible */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors cursor-pointer">
          <Star className="w-4 h-4 text-gray-600 hover:text-primary" />
        </div>
      </div>
      
      <div className="aspect-video overflow-hidden">
        <img
          src={vehicle["imatge-destacada-url"]}
          alt={vehicle["titol-anunci"]}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Estado del vehículo */}
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            {vehicle["estat-vehicle"]}
          </Badge>
          
          {/* Título del anuncio */}
          <h3 className="font-semibold text-lg line-clamp-2">
            {vehicle["titol-anunci"]}
          </h3>
          
          {/* Precio */}
          <div className="pt-1">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(vehicle["preu"])}
            </p>
          </div>
          
          {/* Información del vehículo */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{vehicle["any"]}</span>
            <span>|</span>
            <span>{formatKilometers(vehicle["quilometratge"])}</span>
            <span>|</span>
            <span>{vehicle["tipus-combustible"]}</span>
          </div>
          
          {/* Badge profesional si aplica */}
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              Profesional
            </Badge>
          </div>
          
          {/* Botón Ver más */}
          <div className="pt-2">
            <button 
              onClick={handleViewMore}
              className="w-full bg-primary hover:bg-secondary text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Veure més
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;

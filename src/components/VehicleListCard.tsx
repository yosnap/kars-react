import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Crown, Star, Calendar, Gauge, Fuel, Palette } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import { useToast } from "../hooks/use-toast";

// Tipo visual para tarjetas de vehículo
export interface VehicleUI {
  id: string;
  "titol-anunci"?: string;
  "descripcio-anunci"?: string;
  "marques-cotxe"?: string;
  "models-cotxe"?: string;
  "estat-vehicle"?: string;
  any?: string;
  quilometratge?: string;
  preu?: string;
  "color-vehicle"?: string;
  "tipus-combustible"?: string;
  slug?: string;
  "anunci-actiu"?: string;
  venut?: string;
  "anunci-destacat"?: string;
  "imatge-destacada-url"?: string;
}

interface VehicleListCardProps {
  vehicle: VehicleUI;
}

const VehicleListCard = ({ vehicle }: VehicleListCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();

  const formatPrice = (price: string) => {
    if (!price || Number(price) === 0) return "A consultar";
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
    navigate(`/vehicle/${vehicle.slug}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFavorite = isFavorite(String(vehicle.id));
    toggleFavorite(String(vehicle.id));
    showToast(wasFavorite ? "Eliminado de favoritos" : "Agregado a favoritos", wasFavorite ? "info" : "success");
  };

  // Mapeo de estado a URL de archivo
  const estadoToArchiveUrl: Record<string, string> = {
    seminou: "/cotxes-seminous-a-andorra",
    nou: "/cotxes-nous-a-andorra",
    ocasio: "/cotxes-de-segona-ma-a-andorra",
    km0: "/cotxes-km0-a-andorra",
    lloguer: "/cotxes-lloguer-a-andorra",
    classic: "/cotxes-classics-a-andorra",
    renting: "/cotxes-renting-a-andorra",
  };
  const estado = vehicle["estat-vehicle"];
  const estadoUrl = estado && estadoToArchiveUrl[estado] ? estadoToArchiveUrl[estado] : `/estat-vehicle/${estado}`;

  const isInactive = false; // Assuming the vehicle is always active in this component

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow relative${isInactive ? " opacity-50" : ""}`}>
      {isInactive && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="bg-gray-700 text-white text-base font-bold px-6 py-2 rounded-full shadow-lg opacity-90">
            Vehículo Inactiu
          </span>
        </div>
      )}
      <CardContent className="p-0">
        <div className="flex">
          {/* Imagen */}
          <div className="relative w-64 flex-shrink-0" onClick={handleViewMore} style={{ cursor: 'pointer' }}>
            {vehicle["anunci-destacat"] === "true" && (
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-tertiary rounded-full p-2">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2 z-10">
              <div
                className={`rounded-full p-2 shadow transition-colors cursor-pointer ${isFavorite(String(vehicle.id)) ? "bg-primary" : "bg-white/80 backdrop-blur-sm hover:bg-white"}`}
                onClick={handleToggleFavorite}
              >
                <Star className={`w-4 h-4 transition-colors ${isFavorite(String(vehicle.id)) ? "text-white" : "text-gray-600 hover:text-primary"}`} />
              </div>
            </div>
            <img
              src={vehicle["imatge-destacada-url"]}
              alt={vehicle["titol-anunci"]}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Contenido principal */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            {/* Fila superior: estado, título, descripción + precio y badge usuario */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link to={estadoUrl} className="inline-block">
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary mb-2">
                    {vehicle["estat-vehicle"]}
                  </Badge>
                </Link>
                <h3 className="font-semibold text-xl truncate" style={{ lineHeight: '1.2' }}>
                  <span onClick={handleViewMore} style={{ cursor: 'pointer' }} title={vehicle["titol-anunci"]}>
                    {vehicle["titol-anunci"]}
                  </span>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: vehicle["descripcio-anunci"] ?? "" }} />
              </div>
              {/* Precio y badge usuario */}
              <div className="flex flex-col items-end min-w-[110px] ml-4">
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(vehicle["preu"] ?? "")}
                </p>
                <Badge variant="outline" className="text-xs mt-1">
                  Profesional
                </Badge>
              </div>
            </div>
            {/* Fila info técnica + botón */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              {/* Info técnica */}
              <div className="flex gap-6 text-sm text-gray-600 flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{vehicle["any"]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  <span>{formatKilometers(vehicle["quilometratge"] ?? "")} </span>
                </div>
                <div className="flex items-center gap-2">
                  <Fuel className="w-4 h-4" />
                  <span>{vehicle["tipus-combustible"]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>{vehicle["color-vehicle"]}</span>
                </div>
              </div>
              {/* Botón */}
              <button 
                onClick={handleViewMore}
                className="bg-primary hover:bg-secondary text-white py-2 px-6 rounded-lg font-medium transition-colors ml-2"
              >
                Veure més
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleListCard; 
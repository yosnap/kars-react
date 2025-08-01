import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Crown, Star, Calendar, Gauge, Fuel, Palette } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "../hooks/useFavorites";
import { useLocalizedNavigation } from "../hooks/useLocalizedNavigation";
import { useToast } from "../hooks/use-toast";
import { useVehicleDisplay } from "../hooks/useVehicleDisplay";
import { useLanguage } from "../context/LanguageContext";
import React from "react";

// Función para decodificar entidades HTML
const decodeHtmlEntities = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

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
  preuAntic?: string;
  preuAnterior?: string;
  "color-vehicle"?: string;
  "tipus-combustible"?: string;
  "potencia-cv"?: string;
  slug?: string;
  "anunci-actiu"?: string;
  venut?: string;
  "anunci-destacat"?: string;
  "imatge-destacada-url"?: string;
}

interface VehicleListCardProps {
  vehicle: VehicleUI;
  onUserAction?: () => void;
  searchQuery?: string;
  showSoldButton?: boolean;
}

function highlightText(text: string, query?: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
  );
}

const VehicleListCard = ({ vehicle, onUserAction, searchQuery, showSoldButton = false }: VehicleListCardProps) => {
  const navigate = useNavigate();
  const { navigate: localizedNavigate } = useLocalizedNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { currentLanguage } = useLanguage();
  const { getVehicleStateDisplay, getColorDisplay, getFuelTypeDisplay } = useVehicleDisplay();

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
    if (onUserAction) onUserAction();
    const slugOrId = vehicle.slug || vehicle.id;
    const isSold = vehicle.venut === "true" || vehicle.venut === "1";
    const basePath = isSold ? "/ultimes-vendes/vehicle" : "/vehicle";
    localizedNavigate(`${basePath}/${slugOrId}`);
  };

  const handleFavorite = () => {
    const wasFavorite = isFavorite(String(vehicle.id));
    toggleFavorite(String(vehicle.id));
    showToast(
      wasFavorite ? "Eliminat de favorits" : "Afegit a favorits",
      wasFavorite ? "info" : "success"
    );
  };

  // Mapeo de estado a URL dinámica
  const estado = vehicle["estat-vehicle"];
  const estadoUrl = typeof estado === "string" && estado.length > 0 ? `/estat-vehicle/${estado}` : null;
  const estadoLabel = estado ? getVehicleStateDisplay(estado) : '';
  const colorLabel = vehicle["color-vehicle"] ? getColorDisplay(vehicle["color-vehicle"]) : '';

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
            <img
              src={vehicle["imatge-destacada-url"]}
              alt={decodeHtmlEntities(vehicle["titol-anunci"] ?? "")}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Contenido principal */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            {/* Fila superior: estado, título, descripción + precio y badge usuario */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {estadoUrl && (
                  <Link to={estadoUrl} className="inline-block">
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary mb-2">
                      {estadoLabel}
                    </Badge>
                  </Link>
                )}
                <h3 className="font-semibold text-xl truncate" style={{ lineHeight: '1.2' }}>
                  <span onClick={handleViewMore} style={{ cursor: 'pointer' }} title={decodeHtmlEntities(vehicle["titol-anunci"] ?? "")}>
                    {highlightText(decodeHtmlEntities(vehicle["titol-anunci"] ?? ""), searchQuery ?? "")}
                  </span>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: highlightText(vehicle["descripcio-anunci"] ?? "", searchQuery) }} />
              </div>
              {/* Precio y marca/modelo */}
              <div className="flex flex-col items-end min-w-[110px] ml-4">
                {(vehicle.preuAntic || vehicle.preuAnterior) && (
                  <p className="text-sm text-gray-500 line-through">
                    {formatPrice(vehicle.preuAntic || vehicle.preuAnterior || "")}
                  </p>
                )}
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(vehicle["preu"] ?? "")}
                </p>
                {vehicle["tipus-combustible"] && (
                  <p className="text-xs text-gray-600 mt-1">
                    {getFuelTypeDisplay(vehicle["tipus-combustible"])}
                  </p>
                )}
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
                {vehicle["potencia-cv"] && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                    </svg>
                    <span>{vehicle["potencia-cv"]} cv</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span>{colorLabel || vehicle["color-vehicle"]}</span>
                </div>
              </div>
              {/* Botón favoritos y ver más */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFavorite}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorite(String(vehicle.id)) 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label={isFavorite(String(vehicle.id)) ? "Eliminar de favorits" : "Afegir a favorits"}
                >
                  <Star className="w-4 h-4" fill={isFavorite(String(vehicle.id)) ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={handleViewMore}
                  className={`py-2 px-6 rounded-lg font-medium transition-colors ${
                    showSoldButton 
                      ? "bg-black text-white hover:bg-primary" 
                      : "bg-primary hover:bg-secondary text-white"
                  }`}
                >
                  {showSoldButton ? "Venut" : "Veure més"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleListCard; 
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Crown, Star } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useRef, useState } from "react";
import { useToast } from "../hooks/use-toast";
import React from "react";

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

interface VehicleCardProps {
  vehicle: VehicleUI;
  crown?: boolean;
  onUserAction?: () => void;
  searchQuery?: string;
}

function highlightText(text: string, query?: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
  );
}

const VehicleCard = ({ vehicle, onUserAction, searchQuery }: VehicleCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const [favAnim, setFavAnim] = useState(false);
  const favTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatPrice = (price?: number | string) => {
    if (!price || Number(price) === 0) return "A consultar";
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const formatKilometers = (km?: number | string) => {
    if (!km) return "";
    return new Intl.NumberFormat('es-ES').format(Number(km)) + ' km';
  };

  const handleViewMore = () => {
    if (onUserAction) onUserAction();
    const slugOrId = vehicle.slug || vehicle.id;
    navigate(`/vehicle/${slugOrId}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFavorite = isFavorite(String(vehicle.id));
    toggleFavorite(String(vehicle.id));
    setFavAnim(true);
    if (favTimeout.current) clearTimeout(favTimeout.current);
    favTimeout.current = setTimeout(() => setFavAnim(false), 350);
    showToast(
      wasFavorite ? "Eliminado de favoritos" : "Añadido a favoritos",
      wasFavorite ? "info" : "success"
    );
  };

  const isInactive = vehicle["anunci-actiu"] === "false";
  const isSold = vehicle["venut"] === "true";

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow relative group${isInactive ? " opacity-50" : ""}`}>
      {/* Ribbon vendido */}
      {isSold && (
        <div className="absolute -left-8 top-4 z-30" style={{ transform: 'rotate(-45deg)' }}>
          <span className="bg-red-600 text-white text-xs font-bold px-8 py-1 shadow-lg uppercase tracking-wider select-none">
            Vendido
          </span>
        </div>
      )}
      {/* Badge destacado */}
      {String(vehicle["anunci-destacat"]) === "true" && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-tertiary rounded-full p-2 shadow-lg">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      {/* Badge inactivo */}
      {isInactive && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="bg-gray-700 text-white text-base font-bold px-6 py-2 rounded-full shadow-lg opacity-90">
            Vehículo Inactiu
          </span>
        </div>
      )}
      {/* Icono favoritos */}
      <div className="absolute top-2 right-2 z-10">
        <div
          className={`rounded-full p-2 shadow hover:shadow-lg transition-colors cursor-pointer ${isFavorite(String(vehicle.id)) ? "bg-primary" : "bg-white/80 backdrop-blur-sm hover:bg-white"} ${favAnim ? "animate-fav-bounce" : ""}`}
          onClick={handleToggleFavorite}
        >
          <Star className={`w-4 h-4 transition-colors ${isFavorite(String(vehicle.id)) ? "text-white" : "text-gray-600 group-hover:text-primary"}`} />
        </div>
      </div>
      {/* Imagen */}
      <div
        className="aspect-video overflow-hidden cursor-pointer"
        onClick={handleViewMore}
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleViewMore()}
        aria-label={`Ver detalle de ${vehicle["titol-anunci"] ?? "vehículo"}`}
        role="button"
      >
        <img
          src={vehicle["imatge-destacada-url"] ?? ""}
          alt={vehicle["titol-anunci"] ?? ""}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Estado del vehículo */}
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
            {vehicle["estat-vehicle"]}
          </Badge>
          {/* Título del anuncio */}
          <h3
            className="font-semibold text-lg truncate cursor-pointer"
            title={vehicle["titol-anunci"] ?? ""}
            onClick={handleViewMore}
            tabIndex={0}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleViewMore()}
            aria-label={`Ver detalle de ${vehicle["titol-anunci"] ?? "vehículo"}`}
            role="button"
          >
            {highlightText(vehicle["titol-anunci"], searchQuery)}
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
            <span>{formatKilometers(vehicle["quilometratge"])} </span>
            <span>|</span>
            <span
              className="truncate whitespace-nowrap max-w-[110px] inline-block align-bottom"
              title={vehicle["tipus-combustible"]}
            >
              {vehicle["tipus-combustible"] && vehicle["tipus-combustible"].length > 18
                ? vehicle["tipus-combustible"].slice(0, 15) + '...'
                : vehicle["tipus-combustible"]}
            </span>
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
              className="w-full block bg-primary hover:bg-secondary text-white py-2 px-4 rounded-lg font-medium transition-colors text-center cursor-pointer"
              onClick={handleViewMore}
            >
              Veure més
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Spinner simple con Tailwind
export function Spinner() {
  return (
    <div className="flex justify-center items-center py-8">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  );
}

// Skeleton para la card
export function VehicleCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse min-h-[370px] flex flex-col">
      {/* Imagen skeleton con aspect-video */}
      <div className="aspect-video bg-gray-200 rounded mb-4 w-full" />
      {/* Título */}
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      {/* Precio */}
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      {/* Info técnica */}
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
      {/* Botón */}
      <div className="h-10 bg-gray-200 rounded w-full mt-auto" />
    </div>
  );
}

export default VehicleCard; 
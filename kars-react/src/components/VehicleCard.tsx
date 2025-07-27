import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Crown, Star } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useLanguage } from "../context/LanguageContext";
import { useLocalizedNavigation } from "../hooks/useLocalizedNavigation";
import useVehicleTranslations from "../hooks/useVehicleTranslations";
import { useVehicleDisplay } from "../hooks/useVehicleDisplay";
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
  "preu-antic"?: string;
  "preu-anterior"?: string;
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

interface VehicleCardProps {
  vehicle: VehicleUI;
  crown?: boolean;
  onUserAction?: () => void;
  searchQuery?: string;
  showSoldButton?: boolean;
}

// Función para decodificar entidades HTML
const decodeHtmlEntities = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

function highlightText(text: string, query?: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
  );
}

const VehicleCard = ({ vehicle, onUserAction, searchQuery, showSoldButton = false }: VehicleCardProps) => {
  const navigate = useNavigate();
  const { navigate: localizedNavigate } = useLocalizedNavigation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { t, currentLanguage } = useLanguage();
  const { vehicleLabels } = useVehicleTranslations();
  const { getVehicleStateDisplay } = useVehicleDisplay();
  const [favAnim, setFavAnim] = useState(false);
  const favTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatPrice = (price?: number | string) => {
    if (!price || Number(price) === 0) return vehicleLabels.consultPrice;
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
    const isSold = vehicle.venut === "true" || vehicle.venut === true;
    const basePath = isSold ? "/ultimes-vendes/vehicle" : "/vehicle";
    localizedNavigate(`${basePath}/${slugOrId}`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFavorite = isFavorite(String(vehicle.id));
    toggleFavorite(String(vehicle.id));
    setFavAnim(true);
    if (favTimeout.current) clearTimeout(favTimeout.current);
    favTimeout.current = setTimeout(() => setFavAnim(false), 350);
    showToast(
      wasFavorite ? "Eliminat de favorits" : "Afegit a favorits",
      wasFavorite ? "info" : "success"
    );
  };

  const isInactive = vehicle["anunci-actiu"] === "false";
  const isSold = vehicle["venut"] === "true";

  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group flex flex-col h-full${isInactive ? " opacity-50" : ""}`}>
      {/* Ribbon vendido */}
      {isSold && (
        <div className="absolute -left-8 top-4 z-30" style={{ transform: 'rotate(-45deg)' }}>
          <span className="bg-red-600 text-white text-xs font-bold px-8 py-1 shadow-lg uppercase tracking-wider select-none">
{vehicleLabels.sold}
          </span>
        </div>
      )}
      {/* Badge destacado */}
      {String(vehicle["anunci-destacat"]) === "true" && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-tertiary rounded-full p-2 shadow-lg">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      {/* Badge inactivo */}
      {isInactive && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="bg-gray-700 text-white text-base font-bold px-6 py-2 rounded-full shadow-lg opacity-90">
            Vehicle Inactiu
          </span>
        </div>
      )}
      {/* Icona favorits */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className={`rounded-full p-2.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${isFavorite(String(vehicle.id)) ? "bg-primary hover:bg-primary" : "bg-white/90 backdrop-blur-sm hover:bg-white"} ${favAnim ? "animate-fav-bounce" : ""}`}
          onClick={handleToggleFavorite}
        >
          <Star className={`w-5 h-5 transition-colors ${isFavorite(String(vehicle.id)) ? "text-white fill-white" : "text-gray-600 hover:text-primary"}`} />
        </div>
      </div>
      
      {/* Imagen */}
      <div
        className="aspect-[4/3] overflow-hidden cursor-pointer rounded-t-2xl flex-shrink-0"
        onClick={handleViewMore}
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleViewMore()}
        aria-label={`Veure detall de ${decodeHtmlEntities(vehicle["titol-anunci"] ?? "vehicle")}`}
        role="button"
      >
        {vehicle["imatge-destacada-url"] ? (
          <img
            src={vehicle["imatge-destacada-url"]}
            alt={decodeHtmlEntities(vehicle["titol-anunci"] ?? "")}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Contenido */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Estado del vehículo */}
        {vehicle["estat-vehicle"] && (
          <div className="mb-3">
            <span className="inline-block text-xs font-medium px-2 py-1 rounded text-primary" style={{ backgroundColor: '#eeeeee' }}>
              {getVehicleStateDisplay(vehicle["estat-vehicle"])}
            </span>
          </div>
        )}
        
        {/* Título del anuncio */}
        <h3
          className="font-semibold text-lg text-gray-900 mb-2 cursor-pointer hover:text-gray-700 transition-colors truncate"
          title={decodeHtmlEntities(vehicle["titol-anunci"] ?? "")}
          onClick={handleViewMore}
          tabIndex={0}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleViewMore()}
          aria-label={`Veure detall de ${decodeHtmlEntities(vehicle["titol-anunci"] ?? "vehicle")}`}
          role="button"
        >
          {highlightText(decodeHtmlEntities(vehicle["titol-anunci"] ?? ""), searchQuery ?? "")}
        </h3>
        
        {/* Precio anterior tachado - solo si existe */}
        <div className="mb-1 h-5">
          {(() => {
            // Buscar precio anterior en diferentes campos posibles
            const oldPrice = (vehicle as any)["preu-antic"] || 
                           (vehicle as any)["preu-anterior"] || 
                           (vehicle as any).preuAntic || 
                           (vehicle as any).preuAnterior;
            
            return oldPrice && Number(oldPrice) > 0 ? (
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(oldPrice)}
              </span>
            ) : null;
          })()}
        </div>
        
        {/* Precio actual */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(vehicle["preu"])}
          </span>
        </div>
        
        {/* Información del vehículo con iconos - Km, CV, Año */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          {vehicle["quilometratge"] && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
              <span>{formatKilometers(vehicle["quilometratge"])}</span>
            </div>
          )}
          
          {/* Mostrar CV del vehículo */}
          {vehicle["potencia-cv"] && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
              <span>{vehicle["potencia-cv"]} {vehicleLabels.cv}</span>
            </div>
          )}
          
          {vehicle["any"] && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              <span>{vehicle["any"]}</span>
            </div>
          )}
        </div>
        
        {/* Botón Ver vehículo - se mantiene en la parte inferior */}
        <div className="mt-auto">
          <button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 text-center ${
              showSoldButton 
                ? "bg-black text-white hover:bg-primary" 
                : "bg-primary text-white hover:bg-black"
            }`}
            onClick={handleViewMore}
          >
            {showSoldButton ? vehicleLabels.sold : vehicleLabels.viewVehicle}
          </button>
        </div>
      </div>
    </div>
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
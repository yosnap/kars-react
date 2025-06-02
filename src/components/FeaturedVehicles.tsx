import { useEffect, useState, useRef } from "react";
import VehicleCard from "./VehicleCard";
import { axiosAdmin } from "../api/axiosClient";
import type { Vehicle } from "../types/Vehicle";

const AUTOPLAY_INTERVAL = 4000;

const getVisibleCount = () => {
  if (typeof window === "undefined") return 4;
  if (window.innerWidth < 640) return 1; // móvil
  if (window.innerWidth < 1024) return 2; // tablet
  return 4; // desktop
};

const FeaturedVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount());
  const autoplayRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Responsivo: cambia visibleCount según ancho
  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    axiosAdmin.get("/vehicles", {
      params: {
        "anunci-destacat": true,
        "anunci-actiu": true,
        venut: false,
        per_page: 100
      }
    })
      .then(res => {
        // Filtrar solo activos y no vendidos (ambos como string)
        const activos = (res.data.items || []).filter(
          (v: Record<string, string>) => v["anunci-actiu"] === "true" && v["venut"] === "false"
        );
        setVehicles(activos);
      })
      .finally(() => setLoading(false));
  }, []);

  // Número de grupos posibles
  const totalGroups = Math.max(vehicles.length - visibleCount + 1, 1);

  // Autoplay
  useEffect(() => {
    if (isHovered || vehicles.length <= visibleCount) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      return;
    }
    autoplayRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + 1 >= totalGroups) return 0;
        return prev + 1;
      });
    }, AUTOPLAY_INTERVAL);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [vehicles.length, isHovered, visibleCount, totalGroups]);

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) return totalGroups - 1;
      return prev - 1;
    });
  };
  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev + 1 >= totalGroups) return 0;
      return prev + 1;
    });
  };

  // Limitar el índice si cambia el número de grupos
  useEffect(() => {
    if (currentIndex > totalGroups - 1) {
      setCurrentIndex(Math.max(totalGroups - 1, 0));
    }
  }, [totalGroups, currentIndex]);

  // Para accesibilidad, ir al grupo al hacer focus
  const handleFocus = (idx: number) => setCurrentIndex(idx);

  // Pausa de autoplay al interactuar
  const pauseAutoplay = () => {
    setIsHovered(true);
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    setTimeout(() => setIsHovered(false), 3000);
  };

  // Render cards visibles (ventana deslizante)
  const renderCards = () => {
    if (loading) {
      return <div className="text-center w-full py-8 text-primary">Cargando...</div>;
    }
    if (vehicles.length === 0) {
      return <div className="text-center w-full py-8 text-primary">No hay vehículos destacados en este momento.</div>;
    }
    const windowVehicles = vehicles.slice(currentIndex, currentIndex + visibleCount);
    return (
      <div className="flex w-full gap-6 justify-center">
        {windowVehicles.map((vehicle, idx) => {
          const uiVehicle = {
            id: String(vehicle.id),
            ["titol-anunci"]: vehicle["titol-anunci"] ?? "",
            ["descripcio-anunci"]: vehicle["descripcio-anunci"] ?? "",
            ["marques-cotxe"]: vehicle["marques-cotxe"] ?? "",
            ["models-cotxe"]: vehicle["models-cotxe"] ?? "",
            ["estat-vehicle"]: vehicle["estat-vehicle"] ?? "",
            any: vehicle["any"] ?? "",
            quilometratge: vehicle["quilometratge"] !== undefined && vehicle["quilometratge"] !== null ? String(vehicle["quilometratge"]) : "",
            preu: vehicle["preu"] !== undefined && vehicle["preu"] !== null ? String(vehicle["preu"]) : "",
            ["color-vehicle"]: vehicle["color-vehicle"] ?? "",
            ["tipus-combustible"]: vehicle["tipus-combustible"] ?? "",
            slug: vehicle["slug"] ?? "",
            ["anunci-destacat"]: vehicle["anunci-destacat"] !== undefined ? String(vehicle["anunci-destacat"]) : "",
            ["imatge-destacada-url"]: vehicle["imatge-destacada-url"] ?? "",
            ["anunci-actiu"]: vehicle["anunci-actiu"] !== undefined ? String(vehicle["anunci-actiu"]) : undefined,
            venut: vehicle["venut"] !== undefined ? String(vehicle["venut"]) : undefined
          };
          return (
            <div
              key={vehicle.id}
              className="w-full max-w-xs flex-shrink-0"
              tabIndex={0}
              onFocus={() => handleFocus(currentIndex + idx)}
              style={{ flex: `0 0 ${100 / visibleCount}%` }}
            >
              <VehicleCard vehicle={uiVehicle} onUserAction={pauseAutoplay} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="py-12 bg-tertiary w-full">
      <div className="container mx-auto px-0 w-full relative flex flex-col items-center">
        <h2 className="text-2xl font-bold text-center mb-2 text-primary">Vehículos Destacados</h2>
        <p className="text-center mb-6 text-primary">
          Los mejores vehículos seleccionados por nuestros profesionales
        </p>
        {/* Flechas fuera del contenedor principal, alineadas a los extremos */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-secondary transition disabled:opacity-30"
          onClick={handlePrev}
          disabled={vehicles.length <= visibleCount}
          aria-label="Anterior"
          style={{ marginLeft: '-32px' }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div
          className="w-full flex justify-center items-center overflow-hidden px-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ maxWidth: '100%' }}
        >
          {renderCards()}
        </div>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-secondary transition disabled:opacity-30"
          onClick={handleNext}
          disabled={vehicles.length <= visibleCount}
          aria-label="Siguiente"
          style={{ marginRight: '-32px' }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
        {/* Dots de navegación ocultos */}
        {/* {totalGroups > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: totalGroups }).map((_, idx) => (
              <button
                key={idx}
                className={`w-3 h-3 rounded-full ${idx === currentIndex ? 'bg-primary' : 'bg-gray-300'} transition`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir al grupo ${idx + 1}`}
              />
            ))}
          </div>
        )} */}
      </div>
    </section>
  );
};

export default FeaturedVehicles; 
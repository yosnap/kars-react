import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import VehicleCard from "./VehicleCard";
import { axiosAdmin } from "../api/axiosClient";
import { useLanguage, getVehicleDescription } from "../context/LanguageContext";
import useVehicleTranslations from "../hooks/useVehicleTranslations";
import type { Vehicle } from "../types/Vehicle";
import { VehicleCardSkeleton } from "./VehicleCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const FeaturedVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, currentLanguage } = useLanguage();
  const { vehicleLabels } = useVehicleTranslations();

  useEffect(() => {
    setLoading(true);
    
    const params = {
      "anunci-destacat": "1",
      "anunci-actiu": "true",
      venut: "false",
      per_page: 100,
      orderby: "anunci-destacat",
      order: "DESC"
    };
    
    axiosAdmin.get("/vehicles", { params })
      .then(res => {
        const items = res.data.items || [];
        const activos = items.filter(
          (v: any) => v.anunciActiu === "true" || v.anunciActiu === true
        );
        setVehicles(activos);
      })
      .catch((error) => {
        console.error("FeaturedVehicles API error:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-12 w-full">
        <div className="container mx-auto px-0 w-full">
          <h2 className="text-4xl font-bold text-center mb-8 text-white">{vehicleLabels.featuredTitle}</h2>
          <div className="flex gap-6 overflow-hidden px-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(25%-18px)]">
                <VehicleCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) {
    return (
      <section className="py-12 w-full">
        <div className="container mx-auto px-0 w-full">
          <h2 className="text-4xl font-bold text-center mb-8 text-white">{vehicleLabels.featuredTitle}</h2>
          <div className="text-center py-8 text-white">
            No hi ha vehicles destacats en aquest moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 w-full">
      <div className="container mx-auto px-0 w-full relative">
        <h2 className="text-4xl font-bold text-center mb-8 text-white">{t('vehicles.featured_title')}</h2>
        
        <div className="relative px-4">
          {/* Botones de navegación personalizados */}
          <div className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-secondary transition-all cursor-pointer" style={{ marginLeft: '-32px' }}>
            <ChevronLeft className="w-5 h-5" />
          </div>
          
          <div className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-secondary transition-all cursor-pointer" style={{ marginRight: '-32px' }}>
            <ChevronRight className="w-5 h-5" />
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            className="featured-vehicles-swiper"
          >
            {vehicles.map((vehicle: any) => {
              const uiVehicle = {
                id: String(vehicle.id),
                ["titol-anunci"]: vehicle.titolAnunci ?? vehicle["titol-anunci"] ?? "",
                ["descripcio-anunci"]: getVehicleDescription(vehicle, currentLanguage),
                ["marques-cotxe"]: vehicle.marcaCotxe ?? vehicle["marques-cotxe"] ?? "",
                ["models-cotxe"]: vehicle.modelsCotxe ?? vehicle["models-cotxe"] ?? "",
                ["estat-vehicle"]: vehicle.estatVehicle ?? vehicle["estat-vehicle"] ?? "",
                any: vehicle.any ?? "",
                quilometratge: vehicle.quilometratge !== undefined && vehicle.quilometratge !== null ? String(vehicle.quilometratge) : "",
                preu: vehicle.preu !== undefined && vehicle.preu !== null ? String(vehicle.preu) : "",
                ["color-vehicle"]: vehicle.colorVehicle ?? vehicle["color-vehicle"] ?? "",
                ["tipus-combustible"]: vehicle.tipusCombustible ?? vehicle["tipus-combustible"] ?? "",
                ["potencia-cv"]: vehicle.potenciaCv !== undefined && vehicle.potenciaCv !== null ? String(vehicle.potenciaCv) : (vehicle["potencia-cv"] !== undefined && vehicle["potencia-cv"] !== null ? String(vehicle["potencia-cv"]) : ""),
                slug: vehicle.slug ?? "",
                ["anunci-destacat"]: vehicle.anunciDestacat !== undefined ? String(vehicle.anunciDestacat) : (vehicle["anunci-destacat"] !== undefined ? String(vehicle["anunci-destacat"]) : ""),
                ["imatge-destacada-url"]: vehicle.imatgeDestacadaUrl ?? vehicle["imatge-destacada-url"] ?? "",
                ["anunci-actiu"]: vehicle.anunciActiu !== undefined ? String(vehicle.anunciActiu) : (vehicle["anunci-actiu"] !== undefined ? String(vehicle["anunci-actiu"]) : undefined),
                venut: vehicle.venut !== undefined ? String(vehicle.venut) : undefined
              };

              return (
                <SwiperSlide key={vehicle.id}>
                  <VehicleCard vehicle={uiVehicle} />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
      
    </section>
  );
};

export default FeaturedVehicles;
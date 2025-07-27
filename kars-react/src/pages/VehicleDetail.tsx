import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useVehicleContext } from "../context/VehicleContext";
import { useVehicleTypes } from "../hooks/useVehicleTypes";
import { useLanguage, getVehicleDescription } from "../context/LanguageContext";
import { useLocalizedNavigation } from "../hooks/useLocalizedNavigation";
import useVehicleTranslations from "../hooks/useVehicleTranslations";
import useVehicleDisplay from "../hooks/useVehicleDisplay";
import { axiosAdmin } from "../api/axiosClient";
import { ChevronLeft, ChevronRight, Phone, MessageCircle, Star, Mail, CheckCircle, MapPin } from "lucide-react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { useFavorites } from "../hooks/useFavorites";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface Vehicle {
  id: string;
  [key: string]: unknown;
}

interface Professional {
  id?: string | number;
  name?: string;
  display_name?: string;
  phone?: string;
  email?: string;
  location?: string;
  "logo-empresa"?: string;
  "logo-empresa-home"?: string;
  "nom-empresa"?: string;
  "telefon-comercial"?: string;
  "telefon-whatsapp"?: string;
  "telefon-mobile-professional"?: string;
  "role"?: string;
  "registered_date"?: string;
}

// Esta función ya no es necesaria porque usamos useLanguage()

// Mapeo condicional para valores de BD que no coinciden exactamente con el instalador
const EXTRA_VALUE_MAPPING: Record<string, string> = {
  'gps': 'navegador-gps',
  'llandes-alliatge': 'kit-carrosseria', // Temporal hasta tener llandes en instalador
  'llums-led': 'fars-xeno', // Temporal hasta tener LED en instalador  
  'pintura-metallitzada': 'garantia-fabricant' // Temporal hasta tener pintura en instalador
};

// Función para mapear valores de BD y obtener el label correcto
const getExtraLabelFromDB = (dbValue: string, extrasLabels: Record<string, string>): string => {
  // Primero intentar mapear el valor
  const mappedValue = EXTRA_VALUE_MAPPING[dbValue] || dbValue;
  
  // Buscar en los labels cargados
  if (extrasLabels[mappedValue]) {
    return extrasLabels[mappedValue];
  }
  
  // Si no se encuentra, intentar con el valor original
  if (extrasLabels[dbValue]) {
    return extrasLabels[dbValue];
  }
  
  // Si no se encuentra, devolver el valor original formateado
  return dbValue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Esta función ya no es necesaria porque usamos getVehicleDescription del LanguageContext

const VehicleDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { setCurrentVehicle, setIsVehicleDetailPage } = useVehicleContext();
  const { emissions, upholsteryColors } = useVehicleTypes();
  const { currentLanguage, t } = useLanguage();
  const { getLocalizedHref } = useLocalizedNavigation();
  const { vehicleLabels } = useVehicleTranslations();
  const { 
    getFuelTypeDisplay, 
    getTransmissionDisplay, 
    getVehicleStateDisplay, 
    getTractionDisplay,
    getBodyworkDisplay,
    getColorDisplay,
    translateBooleanValue,
    translateSpecificValue 
  } = useVehicleDisplay();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loadingProfessional, setLoadingProfessional] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);
  const [extrasLabels, setExtrasLabels] = useState<Record<string, string>>({});

  // Favorites logic
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = vehicle ? isFavorite(String(vehicle.id)) : false;

  // Memoizar la descripción para evitar re-cálculos innecesarios
  const vehicleDescription = useMemo(() => {
    return vehicle ? getVehicleDescription(vehicle, currentLanguage) : '';
  }, [vehicle, currentLanguage]);

  useEffect(() => {
    setLoading(true);
    axiosAdmin
      .get(`/vehicles/${slug}`)
      .then((res: { data: Vehicle }) => {
        const veh = res.data;
        
        
        if (veh) {
          setVehicle(veh);
          setCurrentVehicle(veh); // Actualizar el contexto
          setIsVehicleDetailPage(true); // Marcar que estamos en página de detalle
          if (!user && veh["anunci-actiu"] === false) {
            setError("Aquest vehicle no està disponible públicament.");
          }
          // Scroll al inicio de la página
          window.scrollTo(0, 0);
        } else {
          setError("No s'ha trobat el vehicle");
        }
      })
      .catch(() => {
        setError("No s'ha pogut carregar el vehicle");
      })
      .finally(() => setLoading(false));
  }, [slug, user]);

  // Cargar extras labels cuando se carga el vehículo
  useEffect(() => {
    if (vehicle && (vehicle as any).tipusVehicle) {
      const tipus = String((vehicle as any).tipusVehicle).toLowerCase();
      
      // Determinar qué endpoints de extras cargar
      const endpoints: string[] = [];
      if (tipus === "moto" || tipus === "moto-quad-atv") {
        endpoints.push("/motorcycle-extras");
      } else if (tipus === "autocaravana-camper") {
        endpoints.push("/caravan-extras", "/habitacle-extras");
      } else {
        endpoints.push("/car-extras");
      }
      
      // Cargar todos los extras en paralelo
      Promise.all(
        endpoints.map(endpoint => 
          axiosAdmin.get(endpoint)
            .then(res => res.data.data || [])
            .catch(() => [])
        )
      ).then(results => {
        const allExtras = results.flat();
        const labelsMap: Record<string, string> = {};
        
        allExtras.forEach((extra: any) => {
          // El endpoint devuelve { id, name, slug } donde slug es el value
          const value = extra.slug || extra.value || extra.id;
          const name = extra.name || extra.label || extra.title;
          if (value && name) {
            labelsMap[value] = name;
          }
        });
        
        setExtrasLabels(labelsMap);
      });
    }
  }, [vehicle]);

  useEffect(() => {
    if (vehicle && vehicle.author_id) {
      setLoadingProfessional(true);
      axiosAdmin
        .get(`/sellers?user_id=${vehicle.author_id}`)
        .then(res => {
          setProfessional(res.data.data);
        })
        .catch(() => setProfessional(null))
        .finally(() => setLoadingProfessional(false));
    } else {
      setLoadingProfessional(false);
    }
  }, [vehicle]);

  // Limpiar contexto al desmontar componente
  useEffect(() => {
    return () => {
      setCurrentVehicle(null);
      setIsVehicleDetailPage(false);
    };
  }, [setCurrentVehicle, setIsVehicleDetailPage]);

  // Cargar marcas
  useEffect(() => {
    if (!vehicle || !(vehicle as any).tipusVehicle) return;
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const tipus = String((vehicle as any).tipusVehicle).toLowerCase();
      const endpointMarcas = tipus === "moto" || tipus === "moto-quad-atv"
        ? "/marques-moto"
        : "/marques-cotxe";
      axiosAdmin.get(endpointMarcas)
        .then(res => {
          const marcas = Array.isArray(res.data.data) ? res.data.data : [];
          setBrands(marcas);
        })
        .catch(() => setBrands([]));
    });
  }, [vehicle]);

  if (loading) {
    return <VehicleDetailSkeleton />;
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Oops!</h2>
          <p className="text-white mb-6">{error || "No s'ha trobat el vehicle"}</p>
          <Link to="/vehicles" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-black transition-colors">
            Tornar als vehicles
          </Link>
        </div>
      </div>
    );
  }

  // Función para decodificar entidades HTML
  const decodeHtmlEntities = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Extract data
  const images = Array.isArray((vehicle as any).galeriaVehicleUrls) ? (vehicle as any).galeriaVehicleUrls : [];
  const mainImageUrl = typeof (vehicle as any).imatgeDestacadaUrl === "string" ? (vehicle as any).imatgeDestacadaUrl : "";
  const allImages = [mainImageUrl, ...images].filter(Boolean);
  const mainImage = allImages[selectedImageIndex] || mainImageUrl;
  const priceValue = typeof (vehicle as any).preu === "string" || typeof (vehicle as any).preu === "number" 
    ? parseFloat(String((vehicle as any).preu)) 
    : 0;
  
  const formatPrice = (price: number) => {
    if (!price || price === 0) return "A consultar";
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatKilometers = (km: string | number) => {
    const numKm = typeof km === 'string' ? parseInt(km) : km;
    if (isNaN(numKm)) return km;
    return new Intl.NumberFormat('es-ES').format(numKm) + ' km';
  };

  // Obtener el campo de extras según el tipo de vehículo
  const getExtrasField = () => {
    const tipus = String((vehicle as any).tipusVehicle).toLowerCase();
    if (tipus === "moto" || tipus === "moto-quad-atv") {
      return (vehicle as any).extresMoto;
    } else if (tipus === "autocaravana-camper") {
      return (vehicle as any).extresAutocaravana;
    } else {
      return (vehicle as any).extresCotxe;
    }
  };

  const extras = getExtrasField();
  let extrasArray: string[] = [];
  
  if (typeof extras === "string" && extras.trim()) {
    // Intentar diferentes separadores
    if (extras.includes(',')) {
      extrasArray = extras.split(',').map(e => e.trim()).filter(Boolean);
    } else if (extras.includes(';')) {
      extrasArray = extras.split(';').map(e => e.trim()).filter(Boolean);
    } else if (extras.includes('\n')) {
      extrasArray = extras.split('\n').map(e => e.trim()).filter(Boolean);
    } else {
      // Si no hay separadores, tratar como un solo extra
      extrasArray = [extras.trim()];
    }
  } else if (Array.isArray(extras)) {
    extrasArray = extras.map(e => String(e).trim()).filter(Boolean);
  }
  
  
  

  // Breadcrumbs
  const tipusVehicleSlug = (vehicle as any).tipusVehicle ? String((vehicle as any).tipusVehicle).toLowerCase() : "";
  
  // Obtener la marca según el tipo de vehículo
  const isMoto = tipusVehicleSlug === "moto" || tipusVehicleSlug === "moto-quad-atv";
  const marcaLabel = isMoto 
    ? ((vehicle as any).marcaMoto ? String((vehicle as any).marcaMoto) : "")
    : ((vehicle as any).marcaCotxe ? String((vehicle as any).marcaCotxe) : "");
  
  const brandObj = brands.find(b => b.label.toLowerCase() === marcaLabel.toLowerCase());
  const marcaSlug = brandObj ? brandObj.value : marcaLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Construir el parámetro de filtro de marca correcto
  const marcaParam = isMoto ? `marques-moto=${marcaSlug}` : `marques-cotxe=${marcaSlug}`;
  
  const breadcrumbItems = [
    tipusVehicleSlug ? {
      label: {
        es: "Vehículos",
        ca: "Vehicles", 
        en: "Vehicles",
        fr: "Véhicules"
      },
      href: getLocalizedHref(`/vehicles`)
    } : null,
    marcaSlug ? {
      label: {
        es: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
        ca: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
        en: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
        fr: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1)
      },
      href: getLocalizedHref(`/vehicles?${marcaParam}${tipusVehicleSlug ? `&tipus-vehicle=${tipusVehicleSlug}` : ''}`)
    } : null,
    {
      label: {
        es: typeof (vehicle as any).titolAnunci === "string" ? decodeHtmlEntities((vehicle as any).titolAnunci) : "Detalle",
        ca: typeof (vehicle as any).titolAnunci === "string" ? decodeHtmlEntities((vehicle as any).titolAnunci) : "Detall",
        en: typeof (vehicle as any).titolAnunci === "string" ? decodeHtmlEntities((vehicle as any).titolAnunci) : "Detail",
        fr: typeof (vehicle as any).titolAnunci === "string" ? decodeHtmlEntities((vehicle as any).titolAnunci) : "Détail"
      }
    }
  ].filter(Boolean) as { label: { es: string; ca: string; en: string; fr: string }; href?: string }[];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <PageBreadcrumbs items={breadcrumbItems} brands={brands} />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Images and details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main image gallery */}
            <div className="space-y-4">
              {/* Featured Image */}
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={mainImage}
                    alt={typeof vehicle["titol-anunci"] === "string" ? vehicle["titol-anunci"] : ""}
                    className="w-full h-[500px] object-cover cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                  />
                  
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {allImages.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery Slider */}
              {allImages.length > 1 && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          idx === selectedImageIndex 
                            ? 'border-primary shadow-lg shadow-primary/20' 
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Imatge ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white mb-6">
                {decodeHtmlEntities(String((vehicle as any).titolAnunci || ""))}
              </h1>
            </div>

            {Boolean(vehicleDescription) && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-300 mb-4">{vehicleLabels.description}</h2>
                <div 
                  className="text-white prose prose-invert max-w-none [&_p]:mb-4 [&_br]:block [&_br]:content-[''] [&_br]:mt-2 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic"
                  dangerouslySetInnerHTML={{ 
                    __html: String(vehicleDescription) 
                  }}
                />
              </div>
            )}

            {/* Fixa tècnica */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-300 mb-6">{vehicleLabels.technicalSpecs}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Versió */}
                {Boolean((vehicle as any).versio) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Versió</span>
                    <span className="font-medium text-white">{String((vehicle as any).versio)}</span>
                  </div>
                )}
                
                {/* Any */}
                {Boolean((vehicle as any).any) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.year}</span>
                    <span className="font-medium text-white">{String((vehicle as any).any)}</span>
                  </div>
                )}

                {/* Tracció */}
                {Boolean((vehicle as any).traccio) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.traction}</span>
                    <span className="font-medium text-white">{getTractionDisplay((vehicle as any).traccio)}</span>
                  </div>
                )}

                {/* Cilindrada */}
                {Boolean((vehicle as any).cilindrada) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.engine}</span>
                    <span className="font-medium text-white">{String((vehicle as any).cilindrada)} {vehicleLabels.cc}</span>
                  </div>
                )}

                {/* Potència (CV) */}
                {Boolean((vehicle as any).potenciaCv) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.power}</span>
                    <span className="font-medium text-white">{String((vehicle as any).potenciaCv)} {vehicleLabels.cv}</span>
                  </div>
                )}

                {/* Potència (kW) */}
                {Boolean((vehicle as any).potenciaKw) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.power} (kW)</span>
                    <span className="font-medium text-white">{String((vehicle as any).potenciaKw)} kW</span>
                  </div>
                )}

                {/* Tipus combustible */}
                {Boolean((vehicle as any).tipusCombustible) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.fuelType}</span>
                    <span className="font-medium text-white">{getFuelTypeDisplay((vehicle as any).tipusCombustible)}</span>
                  </div>
                )}

                {/* Tipus canvi */}
                {Boolean((vehicle as any).tipusCanvi) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.transmission}</span>
                    <span className="font-medium text-white">{getTransmissionDisplay((vehicle as any).tipusCanvi)}</span>
                  </div>
                )}

                {/* Tipus propulsor */}
                {Boolean((vehicle as any).tipusPropulsor) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Propulsor</span>
                    <span className="font-medium text-white capitalize">{String((vehicle as any).tipusPropulsor)}</span>
                  </div>
                )}

                {/* Carrosseria */}
                {Boolean((vehicle as any).carrosseriaCotxe || (vehicle as any).carrosseriaMoto || (vehicle as any).carrosseriaCaravana) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.bodywork}</span>
                    <span className="font-medium text-white">{
                      getBodyworkDisplay(String((vehicle as any).carrosseriaCotxe || (vehicle as any).carrosseriaMoto || (vehicle as any).carrosseriaCaravana))
                    }</span>
                  </div>
                )}

                {/* Emissions vehicle */}
                {Boolean((vehicle as any).emissionsVehicle) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Emissions</span>
                    <span className="font-medium text-white">{
                      (() => {
                        const emissionValue = String((vehicle as any).emissionsVehicle);
                        // Buscar el label correspondiente en los datos del hook
                        const emissionOption = emissions.find(e => e.value === emissionValue);
                        return emissionOption ? emissionOption.label : emissionValue;
                      })()
                    }</span>
                  </div>
                )}

                {/* Consum urbà */}
                {Boolean((vehicle as any).consumUrba) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Consum urbà</span>
                    <span className="font-medium text-white">{String((vehicle as any).consumUrba)} l/100km</span>
                  </div>
                )}

                {/* Consum carretera */}
                {Boolean((vehicle as any).consumCarretera) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Consum carretera</span>
                    <span className="font-medium text-white">{String((vehicle as any).consumCarretera)} l/100km</span>
                  </div>
                )}

                {/* Consum mixt */}
                {Boolean((vehicle as any).consumMixt) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Consum mixt</span>
                    <span className="font-medium text-white">{String((vehicle as any).consumMixt)} l/100km</span>
                  </div>
                )}

                {/* Emissions CO2 */}
                {Boolean((vehicle as any).emissionsCo2) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Emissions CO2</span>
                    <span className="font-medium text-white">{String((vehicle as any).emissionsCo2)} g/km</span>
                  </div>
                )}

                {/* Nombre propietaris */}
                {Boolean((vehicle as any).nombrePropietaris) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Nombre propietaris</span>
                    <span className="font-medium text-white">{String((vehicle as any).nombrePropietaris)}</span>
                  </div>
                )}

                {/* Dies caducitat */}
                {Boolean((vehicle as any).diesCaducitat) && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Dies caducitat</span>
                    <span className="font-medium text-white">{String((vehicle as any).diesCaducitat)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Característiques */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-300 mb-6">{vehicleLabels.features}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Portes */}
                {Boolean((vehicle as any).portesCotxe) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.doors}</span>
                    <span className="font-medium text-white">{String((vehicle as any).portesCotxe)}</span>
                  </div>
                )}

                {/* Places */}
                {Boolean((vehicle as any).placesCotxe) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.seats}</span>
                    <span className="font-medium text-white">{String((vehicle as any).placesCotxe)}</span>
                  </div>
                )}

                {/* Color exterior */}
                {Boolean((vehicle as any).colorVehicle) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.color}</span>
                    <span className="font-medium text-white">{getColorDisplay(String((vehicle as any).colorVehicle))}</span>
                  </div>
                )}

                {/* Color tapisseria */}
                {Boolean((vehicle as any).colorTapisseria) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.upholsteryColor}</span>
                    <span className="font-medium text-white">{
                      (() => {
                        const colorValue = String((vehicle as any).colorTapisseria);
                        // Buscar el label correspondiente en los datos del hook
                        const colorOption = upholsteryColors.find(c => c.value === colorValue);
                        return colorOption ? colorOption.label : colorValue;
                      })()
                    }</span>
                  </div>
                )}

                {/* Tipus tapisseria */}
                {Boolean((vehicle as any).tipusTapisseria) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.upholsteryType}</span>
                    <span className="font-medium text-white capitalize">{String((vehicle as any).tipusTapisseria)}</span>
                  </div>
                )}

                {/* Climatització */}
                {((vehicle as any).climatitzacio === true || (vehicle as any).climatitzacio === 'true') && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.airConditioning}</span>
                    <span className="font-medium text-white">{translateBooleanValue(true)}</span>
                  </div>
                )}

                {/* Aire acondicionat */}
                {Boolean((vehicle as any).aireAcondicionat) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.airConditioner}</span>
                    <span className="font-medium text-white">
                      {translateBooleanValue((vehicle as any).aireAcondicionat)}
                    </span>
                  </div>
                )}

                {/* Vehicle fumador */}
                {((vehicle as any).vehicleFumador === true || (vehicle as any).vehicleFumador === 'true') && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.smokerVehicle}</span>
                    <span className="font-medium text-white">{translateBooleanValue(true)}</span>
                  </div>
                )}

                {/* Estat vehicle */}
                {Boolean((vehicle as any).estatVehicle) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.condition}</span>
                    <span className="font-medium text-white">{getVehicleStateDisplay((vehicle as any).estatVehicle)}</span>
                  </div>
                )}

                {/* Capacitat total */}
                {Boolean((vehicle as any).capacitatTotal) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">{vehicleLabels.totalCapacity}</span>
                    <span className="font-medium text-white">{String((vehicle as any).capacitatTotal)} kg</span>
                  </div>
                )}

                {/* Número maleters */}
                {Boolean((vehicle as any).numeroMaleters) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Núm. maleters</span>
                    <span className="font-medium text-white">{String((vehicle as any).numeroMaleters)}</span>
                  </div>
                )}

                {/* Roda recanvi */}
                {Boolean((vehicle as any).rodaRecanvi) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Roda recanvi</span>
                    <span className="font-medium text-white">{
                      (() => {
                        const rodaRecanviValue = String((vehicle as any).rodaRecanvi);
                        // Mapear valores específicos según el formulario
                        const rodaRecanviMap: Record<string, string> = {
                          'roda_substitucio': 'Roda Substitució',
                          'r_kit_reparacio': 'Kit reparació'
                        };
                        return rodaRecanviMap[rodaRecanviValue] || rodaRecanviValue;
                      })()
                    }</span>
                  </div>
                )}

                {/* Velocitat màxima */}
                {Boolean((vehicle as any).velocitatMaxima) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Velocitat màxima</span>
                    <span className="font-medium text-white">{String((vehicle as any).velocitatMaxima)} km/h</span>
                  </div>
                )}

                {/* Acceleració 0-100 */}
                {Boolean((vehicle as any).acceleracio0100) && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Acceleració 0-100</span>
                    <span className="font-medium text-white">{String((vehicle as any).acceleracio0100)} s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informació comercial */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-300 mb-6">{vehicleLabels.commercialInfo}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Garantia */}
                {Boolean((vehicle as any).garantia) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Garantia</span>
                    <span className="font-medium text-white">{
                      (() => {
                        const garantia = String((vehicle as any).garantia);
                        // Convertir valores booleanos o textuales usando traducciones dinámicas
                        if (garantia === 'true' || garantia === '1' || garantia === 'si' || garantia === 'sí' || garantia === 'yes') {
                          return translateBooleanValue(true);
                        } else if (garantia === 'false' || garantia === '0' || garantia === 'no') {
                          return translateBooleanValue(false);
                        }
                        // Si es otro valor, intentar capitalizar
                        return garantia.charAt(0).toUpperCase() + garantia.slice(1).toLowerCase();
                      })()
                    }</span>
                  </div>
                )}

                {/* Origen */}
                {Boolean((vehicle as any).origen) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Origen</span>
                    <span className="font-medium text-white">{
                      (() => {
                        const origen = String((vehicle as any).origen).toLowerCase();
                        const translatedOrigin = translateSpecificValue(origen);
                        // Si no encuentra traducción, capitalizar el original
                        return translatedOrigin !== origen ? translatedOrigin : origen.charAt(0).toUpperCase() + origen.slice(1);
                      })()
                    }</span>
                  </div>
                )}

                {/* IVA */}
                {Boolean((vehicle as any).iva) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">IVA</span>
                    <span className="font-medium text-white">{String((vehicle as any).iva)}</span>
                  </div>
                )}

                {/* Finançament */}
                {Boolean((vehicle as any).finacament) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Finançament</span>
                    <span className="font-medium text-white">{String((vehicle as any).finacament)}</span>
                  </div>
                )}

                {/* Vehicle accidentat */}
                {Boolean((vehicle as any).vehicleAccidentat) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Vehicle accidentat</span>
                    <span className="font-medium text-white">
                      {translateBooleanValue((vehicle as any).vehicleAccidentat)}
                    </span>
                  </div>
                )}

                {/* Llibre manteniment */}
                {((vehicle as any).llibreManteniment === true || (vehicle as any).llibreManteniment === 'true') && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Llibre manteniment</span>
                    <span className="font-medium text-white">{translateBooleanValue(true)}</span>
                  </div>
                )}

                {/* Revisions oficials */}
                {((vehicle as any).revisionsOficials === true || (vehicle as any).revisionsOficials === 'true') && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Revisions oficials</span>
                    <span className="font-medium text-white">{translateBooleanValue(true)}</span>
                  </div>
                )}

                {/* Preu antic */}
                {Boolean((vehicle as any).preuAntic) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Preu anterior</span>
                    <span className="font-medium text-white">{String((vehicle as any).preuAntic)} €</span>
                  </div>
                )}

                {/* Preu mensual */}
                {Boolean((vehicle as any).preuMensual) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Preu mensual</span>
                    <span className="font-medium text-white">{String((vehicle as any).preuMensual)} €/mes</span>
                  </div>
                )}

                {/* Preu diari */}
                {Boolean((vehicle as any).preuDiari) && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Preu diari</span>
                    <span className="font-medium text-white">{String((vehicle as any).preuDiari)} €/dia</span>
                  </div>
                )}

                {/* Impostos deduïbles */}
                {((vehicle as any).impostosDeduibles === true || (vehicle as any).impostosDeduibles === 'true') && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Impostos deduïbles</span>
                    <span className="font-medium text-white">{translateBooleanValue(true)}</span>
                  </div>
                )}

                {/* Vehicle a canvi */}
                {((vehicle as any).vehicleACanvi === true || (vehicle as any).vehicleACanvi === 'true') && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Vehicle a canvi</span>
                    <span className="font-medium text-white">{translateSpecificValue('accepta')}</span>
                  </div>
                )}

                {/* Quilometratge */}
                {Boolean((vehicle as any).quilometratge) && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Quilometratge</span>
                    <span className="font-medium text-white">{formatKilometers((vehicle as any).quilometratge)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            {(vehicle["one-pedal"] || vehicle["frenada-regenerativa"]) && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-900 rounded-lg p-6">
                  {Boolean(vehicle["one-pedal"]) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">One Pedal</h3>
                      <p className="text-white">{String(vehicle["one-pedal"])}</p>
                    </div>
                  )}
                  {Boolean(vehicle["frenada-regenerativa"]) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">Frenada Regenerativa</h3>
                      <p className="text-white">{String(vehicle["frenada-regenerativa"])}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extras */}
            {extrasArray.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">{vehicleLabels.extras}</h2>
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {extrasArray.map((extra, idx) => {
                      // Usar la función de mapeo para obtener el label correcto
                      const extraLabel = getExtraLabelFromDB(extra, extrasLabels);
                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <span className="text-white">{extraLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Vehicle info card */}
          <div className="space-y-6">
            {/* Vehicle info card */}
            <div className="bg-gray-900 rounded-lg p-6 sticky top-4">
              <div className="space-y-4">
                {/* Price section */}
                <div className="border-b border-gray-700 pb-4">
                  {(() => {
                    // Verificar múltiples campos para precio anterior
                    const preuAnteriorValue = (vehicle as any).preuAnterior || 
                                             (vehicle as any).preuAntic || 
                                             (vehicle as any)['preu-anterior'] ||
                                             (vehicle as any)['preu-antic'] ||
                                             (vehicle as any).preuOriginal ||
                                             (vehicle as any).previousPrice;
                    const hasOldPrice = Boolean(preuAnteriorValue);
                    const oldPriceNumber = hasOldPrice 
                      ? (typeof preuAnteriorValue === "string" || typeof preuAnteriorValue === "number" 
                          ? parseFloat(String(preuAnteriorValue)) 
                          : 0)
                      : 0;
                    
                    return hasOldPrice ? (
                      // Layout ecommerce con precio anterior tachado
                      <div className="text-center space-y-1">
                        <div className="text-center">
                          <span className="text-gray-400 text-xl line-through">
                            {formatPrice(oldPriceNumber)}
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-red-500">
                          {formatPrice(priceValue)}
                        </p>
                      </div>
                    ) : (
                      // Layout normal sin precio anterior
                      <p className="text-3xl font-bold text-red-500 text-center">
                        {formatPrice(priceValue)}
                      </p>
                    );
                  })()}
                </div>

                {/* Vehicle details */}
                <div className="space-y-3 text-white">
                  {Boolean((vehicle as any).any) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.year}:</span>
                      <span className="font-medium">{String((vehicle as any).any)}</span>
                    </div>
                  )}
                  {Boolean((vehicle as any).cilindrada) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.engine}:</span>
                      <span className="font-medium">{String((vehicle as any).cilindrada)} cc</span>
                    </div>
                  )}
                  {Boolean((vehicle as any).potenciaCv) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.power}:</span>
                      <span className="font-medium">{String((vehicle as any).potenciaCv)} CV</span>
                    </div>
                  )}
                  {Boolean((vehicle as any).carrosseriaCotxe) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.bodywork}:</span>
                      <span className="font-medium">{getBodyworkDisplay(String((vehicle as any).carrosseriaCotxe))}</span>
                    </div>
                  )}
                  {Boolean((vehicle as any).marcaCotxe) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.brand}:</span>
                      <span className="font-medium capitalize">{String((vehicle as any).marcaCotxe)}</span>
                    </div>
                  )}
                  {Boolean((vehicle as any).modelsCotxe) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.model}:</span>
                      <span className="font-medium capitalize">{String((vehicle as any).modelsCotxe)}</span>
                    </div>
                  )}
                  {Boolean((vehicle as any).quilometratge) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.mileage}:</span>
                      <span className="font-medium">{formatKilometers((vehicle as any).quilometratge)}</span>
                    </div>
                  )}
                  {Boolean((vehicle as any).tipusCombustible) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.fuelType}:</span>
                      <span className="font-medium">{getFuelTypeDisplay(String((vehicle as any).tipusCombustible))}</span>
                    </div>
                  )}
                  {Boolean((vehicle as any).estatVehicle) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{vehicleLabels.condition}:</span>
                      <span className="font-medium">{getVehicleStateDisplay(String((vehicle as any).estatVehicle))}</span>
                    </div>
                  )}
                </div>

                {/* Venut button for sold vehicles or Favorite button */}
                {(vehicle as any).venut === "true" || (vehicle as any).venut === true ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium bg-red-600 text-white cursor-not-allowed opacity-90"
                  >
                    <CheckCircle className="w-5 h-5 fill-current" />
                    Venut
                  </button>
                ) : (
                  <button
                    onClick={() => vehicle && toggleFavorite(String(vehicle.id))}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                      isFav 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
                    {isFav ? vehicleLabels.removeFromFavorites : vehicleLabels.addToFavorites}
                  </button>
                )}

                {/* Share buttons */}
                <div className="flex gap-2">
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${vehicle["titol-anunci"]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    𝕏
                  </a>
                  <a 
                    href={`https://wa.me/?text=${vehicle["titol-anunci"]} ${window.location.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    <MessageCircle className="w-5 h-5 inline" />
                  </a>
                  <a 
                    href={`mailto:?subject=${vehicle["titol-anunci"]}&body=${window.location.href}`}
                    className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    <Mail className="w-5 h-5 inline" />
                  </a>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    f
                  </a>
                </div>
              </div>
            </div>

            {/* Professional info card */}
            {professional && !loadingProfessional && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Contacte</h3>
                
                {professional["logo-empresa"] && (
                  <div className="mb-4">
                    <img 
                      src={professional["logo-empresa"]} 
                      alt={professional["nom-empresa"] || ''} 
                      className="h-16 object-contain"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  {professional["nom-empresa"] && (
                    <div className="text-white font-medium">
                      {professional["nom-empresa"]}
                    </div>
                  )}
                  
                  {professional["telefon-comercial"] && (
                    <a 
                      href={`tel:${professional["telefon-comercial"]}`}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {professional["telefon-comercial"]}
                    </a>
                  )}
                  
                  {professional.email && (
                    <a 
                      href={`mailto:${professional.email}`}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {professional.email}
                    </a>
                  )}
                  
                  {professional.location && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      {professional.location}
                    </div>
                  )}
                  
                  {professional.id && (
                    <Link 
                      to={`/professional/${professional.id}`}
                      className="block w-full bg-primary text-white py-2 px-4 rounded-lg text-center hover:bg-black transition-colors mt-4"
                    >
                      Veure perfil
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-gray-900 rounded-lg">
          <p className="text-gray-400 text-sm text-center">
            *HEM ESTAT CUROSOS EN LA DESCRIPCIÓ DE LES CARACTERÍSTIQUES D'AQUEST VEHICLE. TOT I AIXÍ NO REPRESENTEN UNA GARANTIA PER ERRORS D'ESCRIPTURA I LA TRANSMISSIÓ DE LES DADES.
          </p>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={allImages.map(src => ({ src }))}
        index={selectedImageIndex}
        plugins={[Thumbnails]}
      />

      <Footer />
    </div>
  );
};

// Helper functions

// Skeleton component
const VehicleDetailSkeleton = () => (
  <div className="min-h-screen">
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-lg overflow-hidden animate-pulse">
            <div className="h-[500px] bg-gray-800" />
            <div className="flex gap-2 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-16 bg-gray-800 rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-2 animate-pulse">
            <div className="h-8 w-2/3 bg-gray-800 rounded" />
            <div className="h-6 w-1/3 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6 animate-pulse">
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-800 rounded" />
                  <div className="h-4 w-16 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default VehicleDetail;
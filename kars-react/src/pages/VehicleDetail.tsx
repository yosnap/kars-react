import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

// Function to get the current language (similar to PageBreadcrumbs)
const getCurrentLanguage = () => {
  // Default to Catalan, but can be extended to detect from URL or user preferences
  return "ca";
};

// Function to get the description in the current language
const getVehicleDescription = (vehicle: Vehicle) => {
  const currentLang = getCurrentLanguage();
  
  // Map language codes to field names (using kebab-case as in the API)
  const descriptionFields = {
    'ca': 'descripcio-anunci-ca',
    'es': 'descripcio-anunci-es', 
    'en': 'descripcio-anunci-en',
    'fr': 'descripcio-anunci-fr'
  };
  
  const fieldName = descriptionFields[currentLang as keyof typeof descriptionFields];
  let description = vehicle[fieldName] as string;
  
  // Fallback hierarchy: current language -> Catalan -> Spanish -> English -> legacy field
  if (!description || description.trim() === '') {
    description = vehicle['descripcio-anunci-ca'] as string ||
                 vehicle['descripcio-anunci-es'] as string ||
                 vehicle['descripcio-anunci-en'] as string ||
                 vehicle['descripcio-anunci'] as string || '';
  }
  
  return description;
};

const VehicleDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loadingProfessional, setLoadingProfessional] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);

  // Favorites logic
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = vehicle ? isFavorite(String(vehicle.id)) : false;

  useEffect(() => {
    setLoading(true);
    axiosAdmin
      .get(`/vehicles/${slug}`)
      .then((res: { data: Vehicle }) => {
        const veh = res.data;
        if (veh) {
          setVehicle(veh);
          if (!user && veh["anunci-actiu"] === false) {
            setError("Aquest vehicle no està disponible públicament.");
          }
        } else {
          setError("No s'ha trobat el vehicle");
        }
      })
      .catch(() => {
        setError("No s'ha pogut carregar el vehicle");
      })
      .finally(() => setLoading(false));
  }, [slug, user]);

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

  // Cargar marcas
  useEffect(() => {
    if (!vehicle || !vehicle["tipus-vehicle"]) return;
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const tipus = String(vehicle["tipus-vehicle"]).toLowerCase();
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
  const images = Array.isArray(vehicle["galeria-vehicle-urls"]) ? vehicle["galeria-vehicle-urls"] : [];
  const mainImageUrl = typeof vehicle["imatge-destacada-url"] === "string" ? vehicle["imatge-destacada-url"] : "";
  const allImages = [mainImageUrl, ...images].filter(Boolean);
  const mainImage = allImages[selectedImageIndex] || mainImageUrl;
  const priceValue = typeof vehicle.preu === "string" || typeof vehicle.preu === "number" 
    ? parseFloat(String(vehicle.preu)) 
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
    const tipus = String(vehicle["tipus-vehicle"]).toLowerCase();
    if (tipus === "moto" || tipus === "moto-quad-atv") {
      return vehicle["extres-moto"];
    } else if (tipus === "autocaravana-camper") {
      return vehicle["extres-autocaravana"];
    } else {
      return vehicle["extres-cotxe"];
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
  const tipusVehicleSlug = vehicle["tipus-vehicle"] ? String(vehicle["tipus-vehicle"]).toLowerCase() : "";
  const marcaLabel = vehicle["marques-cotxe"] ? String(vehicle["marques-cotxe"]) : "";
  const brandObj = brands.find(b => b.label.toLowerCase() === marcaLabel.toLowerCase());
  const marcaSlug = brandObj ? brandObj.value : marcaLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const breadcrumbItems = [
    tipusVehicleSlug ? {
      label: {
        es: "Vehículos",
        ca: "Vehicles", 
        en: "Vehicles",
        fr: "Véhicules"
      },
      href: `/vehicles`
    } : null,
    marcaSlug ? {
      label: {
        es: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
        ca: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
        en: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
        fr: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1)
      },
      href: `/vehicles`
    } : null,
    {
      label: {
        es: typeof vehicle["titol-anunci"] === "string" ? decodeHtmlEntities(vehicle["titol-anunci"]) : "Detalle",
        ca: typeof vehicle["titol-anunci"] === "string" ? decodeHtmlEntities(vehicle["titol-anunci"]) : "Detall",
        en: typeof vehicle["titol-anunci"] === "string" ? decodeHtmlEntities(vehicle["titol-anunci"]) : "Detail",
        fr: typeof vehicle["titol-anunci"] === "string" ? decodeHtmlEntities(vehicle["titol-anunci"]) : "Détail"
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
                {decodeHtmlEntities(String(vehicle["titol-anunci"] || ""))}
              </h1>
            </div>

            {(() => {
              const description = getVehicleDescription(vehicle);
              return Boolean(description) && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-300 mb-4">Descripció</h2>
                  <div 
                    className="text-white prose prose-invert max-w-none [&_p]:mb-4 [&_br]:block [&_br]:content-[''] [&_br]:mt-2 [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic"
                    dangerouslySetInnerHTML={{ 
                      __html: String(description) 
                    }}
                  />
                </div>
              );
            })()}

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
                <h2 className="text-2xl font-bold text-white mb-4">Extras</h2>
                <div className="bg-gray-900 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {extrasArray.map((extra, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-white">{extra}</span>
                      </div>
                    ))}
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
                  {Boolean(vehicle["preu-anterior"]) && (
                    <p className="text-gray-400 text-lg line-through text-center mb-1">
                      {formatPrice(typeof vehicle["preu-anterior"] === "string" || typeof vehicle["preu-anterior"] === "number" 
                        ? parseFloat(String(vehicle["preu-anterior"])) 
                        : 0)}
                    </p>
                  )}
                  <p className="text-3xl font-bold text-red-500 text-center">
                    {formatPrice(priceValue)}
                  </p>
                </div>

                {/* Vehicle details */}
                <div className="space-y-3 text-white">
                  {Boolean(vehicle.any) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Any:</span>
                      <span className="font-medium">{String(vehicle.any)}</span>
                    </div>
                  )}
                  {Boolean(vehicle["motor"]) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Motor:</span>
                      <span className="font-medium">{String(vehicle["motor"])}</span>
                    </div>
                  )}
                  {Boolean(vehicle["potencia-cv"]) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Potència:</span>
                      <span className="font-medium">{String(vehicle["potencia-cv"])} CV</span>
                    </div>
                  )}
                  {Boolean(vehicle["models-cotxe"]) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="font-medium">{String(vehicle["models-cotxe"])}</span>
                    </div>
                  )}
                  {Boolean(vehicle.quilometratge) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quilometratge:</span>
                      <span className="font-medium">{formatKilometers(String(vehicle.quilometratge))}</span>
                    </div>
                  )}
                  {Boolean(vehicle["tipus-cotxe"]) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipus:</span>
                      <span className="font-medium">{String(vehicle["tipus-cotxe"])}</span>
                    </div>
                  )}
                  {Boolean(vehicle["tipus-combustible"]) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Combustible:</span>
                      <span className="font-medium">{String(vehicle["tipus-combustible"])}</span>
                    </div>
                  )}
                  {Boolean(vehicle["estat-vehicle"]) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estat:</span>
                      <span className="font-medium capitalize">{String(vehicle["estat-vehicle"])}</span>
                    </div>
                  )}
                  {Boolean(vehicle["nombre-de-portes"]) && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Núm. de portes:</span>
                      <span className="font-medium">{String(vehicle["nombre-de-portes"])}</span>
                    </div>
                  )}
                </div>

                {/* Venut button for sold vehicles or Favorite button */}
                {vehicle.venut === "true" || vehicle.venut === true ? (
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
                    {isFav ? 'Eliminar dels favorits' : 'Afegir als favorits'}
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
function getVehicleTypeLabel(slug: string): string {
  switch (slug.toLowerCase()) {
    case "cotxe": return "Cotxe";
    case "moto-quad-atv": return "Moto";
    case "autocaravana-camper": return "Caravana";
    case "vehicle-comercial": return "Vehicle comercial";
    default: return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
  }
}

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
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { axiosAdmin } from "../api/axiosClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Phone, MessageCircle, Calculator, User, Car, Handshake, Star } from "lucide-react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { Link } from "react-router-dom";
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
  // Custom fields from API
  "logo-empresa"?: string;
  "logo-empresa-home"?: string;
  "nom-empresa"?: string;
  "telefon-comercial"?: string;
  "telefon-whatsapp"?: string;
  "telefon-mobile-professional"?: string;
  "role"?: string;
  "registered_date"?: string;
}

const VehicleDetail = () => {
  const { slug } = useParams();
  const { user, axiosInstance } = useAuth();
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
    const client = user && axiosInstance ? axiosInstance : axiosAdmin;
    client
      .get(`/vehicles/${slug}`)
      .then((res: { data: Vehicle }) => {
        const veh = res.data;
        if (veh) {
          setVehicle(veh);
          if (!user && veh["anunci-actiu"] === false) {
            setError("Este vehículo no está disponible públicamente.");
          }
        } else {
          setError("No se encontró el vehículo");
        }
      })
      .catch(() => {
        setError("No se pudo cargar el vehículo");
      })
      .finally(() => setLoading(false));
  }, [slug, user, axiosInstance]);

  useEffect(() => {
    if (vehicle && vehicle.author_id) {
      setLoadingProfessional(true);
      // Use only the relative path, since axiosAdmin already has the baseURL set
      axiosAdmin
        .get(`/sellers?user_id=${vehicle.author_id}`)
        .then(res => {
          // Access the seller data inside the 'data' property of the response
          setProfessional(res.data.data);
        })
        .catch(() => setProfessional(null))
        .finally(() => setLoadingProfessional(false));
    } else {
      setLoadingProfessional(false);
    }
  }, [vehicle]);

  // Cargar marcas al montar o cambiar tipo de vehículo
  useEffect(() => {
    if (!vehicle || !vehicle["tipus-vehicle"]) return;
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const tipus = String(vehicle["tipus-vehicle"]).toLowerCase();
      const endpointMarcas = tipus === "moto" || tipus === "moto-quad-atv"
        ? "/marques-moto"
        : "/marques-cotxe";
      axiosAdmin.get(endpointMarcas)
        .then((res) => {
          const marcas = Array.isArray(res.data.data) ? res.data.data : [];
          setBrands(marcas);
        })
        .catch(() => setBrands([]));
    });
  }, [vehicle && vehicle["tipus-vehicle"]]);

  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!loading && !loadingProfessional && !vehicle) {
    return <div className="text-center py-8">No se encontró el vehículo.</div>;
  }

  // Only render the main content if vehicle is not null
  if (!vehicle) return null;

  // Galería de imágenes
  const gallery: string[] = Array.isArray(vehicle["galeria-vehicle"])
    ? vehicle["galeria-vehicle"]
    : Array.isArray(vehicle["galeria-vehicle-urls"])
      ? vehicle["galeria-vehicle-urls"]
      : [];
  const mainImage = gallery[selectedImageIndex] || (typeof vehicle["imatge-destacada-id"] === "string" ? vehicle["imatge-destacada-id"] : (typeof vehicle["imatge-destacada-url"] === "string" ? vehicle["imatge-destacada-url"] : undefined));

  // Ficha técnica y características
  const specs = [
    { label: "Versió", value: vehicle["versio"] },
    { label: "Any", value: vehicle["any"] || vehicle["any-fabricacio"] },
    { label: "Tracció", value: vehicle["traccio"] },
    { label: "Cilindrada", value: vehicle["cilindrada"] },
    { label: "Potència (CV)", value: vehicle["potencia-cv"] },
    { label: "Emissions", value: vehicle["emissions-vehicle"] },
    { label: "Transmissió", value: vehicle["tipus-canvi-cotxe"] },
    { label: "Nombre propietaris", value: vehicle["nombre-propietaris"] },
    { label: "Carrosseria", value: vehicle["carrosseria-cotxe"] },
    { label: "Dies caducitat", value: vehicle["dies-caducitat"] },
  ];
  const features = [
    { label: "Portes", value: vehicle["portes-cotxe"] },
    { label: "Places", value: vehicle["places-cotxe"] },
    { label: "Maleter (L)", value: vehicle["capacitat-maleters-cotxe"] },
    { label: "Color tapisseria", value: vehicle["color-tapisseria"] },
    { label: "Climatització", value: vehicle["climatitzacio"] },
  ];
  const extras = Array.isArray(vehicle["extres-cotxe"]) ? vehicle["extres-cotxe"] : [];

  // Skeleton blocks with the same structure and spacing as the real sidebar blocks
  const SellerSidebarSkeleton = () => (
    <div className="flex flex-col gap-6">
      {/* Seller block skeleton */}
      <Card className="rounded-2xl">
        <CardContent className="p-8 flex flex-col items-center animate-pulse">
          {/* Logo */}
          <div className="w-20 h-20 rounded-full bg-gray-200 mb-4" />
          {/* Name */}
          <div className="h-6 w-32 bg-gray-200 rounded mb-1" />
          {/* Phone */}
          <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
          {/* Divider */}
          <div className="w-full border-t my-3" />
          {/* Role badge */}
          <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
          {/* Registration date */}
          <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
          {/* Buttons */}
          <div className="w-full flex flex-col gap-3 mb-4">
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-200 rounded" />
          </div>
          {/* Extra data */}
          <div className="w-full pt-4 border-t text-xs text-gray-500">
            <div className="flex justify-between mb-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between mb-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between mb-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Info extra block skeleton */}
      <Card className="rounded-2xl">
        <CardContent className="p-6 animate-pulse">
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Full page skeleton for vehicle detail
  const VehicleDetailSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main column skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery skeleton */}
            <Card>
              <CardContent className="p-0 animate-pulse">
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-200" />
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-20 h-16 rounded bg-gray-200" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Título, precio, badges skeleton */}
            <div className="space-y-2 animate-pulse">
              <div className="h-8 w-2/3 bg-gray-200 rounded" />
              <div className="h-6 w-1/3 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-200 rounded" />
            </div>
            {/* Ficha técnica skeleton */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Fitxa tècnica</CardTitle>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="grid md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Características skeleton */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Característiques</CardTitle>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="grid md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Extras skeleton */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Extres inclosos</CardTitle>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="grid md:grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-200 rounded-full" />
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Sidebar skeleton (reuse SellerSidebarSkeleton) */}
          <div className="flex flex-col gap-6">
            <SellerSidebarSkeleton />
          </div>
        </div>
      </div>
    </div>
  );

  // Sidebar vehicle info skeleton
  const VehicleSidebarInfoSkeleton = () => (
    <Card className="rounded-2xl animate-pulse">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-6 w-24 bg-gray-200 rounded mb-2" /> {/* Badge destacado */}
          <div className="h-8 w-2/3 bg-gray-200 rounded" /> {/* Título */}
          <div className="h-7 w-1/3 bg-gray-200 rounded mb-2" /> {/* Precio */}
          <div className="h-5 w-20 bg-gray-200 rounded mb-2" /> {/* Estado */}
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="h-10 w-full bg-gray-200 rounded mt-4" /> {/* Botón favoritos */}
        </div>
      </CardContent>
    </Card>
  );

  // Función para mapear el slug de tipo de vehículo a label amigable
  function getVehicleTypeLabel(slug: string): string {
    switch (slug.toLowerCase()) {
      case "cotxe": return "Coche";
      case "moto-quad-atv": return "Moto";
      case "autocaravana-camper": return "Caravana";
      case "vehicle-comercial": return "Vehículo comercial";
      default: return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
    }
  }

  function slugify(str: string) {
    return str
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Render visual
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs con estructura: Inicio - Tipo de vehículo - Marca - Nombre del vehículo */}
      {(() => {
        // Construye el array de breadcrumbs y filtra los undefined
        const tipusVehicleSlug = vehicle["tipus-vehicle"] ? String(vehicle["tipus-vehicle"]).toLowerCase() : "";
        const marcaLabel = vehicle["marques-cotxe"] ? String(vehicle["marques-cotxe"]) : "";
        const brandObj = brands.find(b => b.label.toLowerCase() === marcaLabel.toLowerCase());
        const marcaSlug = brandObj ? brandObj.value : slugify(marcaLabel);
        const breadcrumbItems = [
          tipusVehicleSlug ? {
            label: {
              es: getVehicleTypeLabel(tipusVehicleSlug),
              ca: getVehicleTypeLabel(tipusVehicleSlug),
              en: getVehicleTypeLabel(tipusVehicleSlug),
              fr: getVehicleTypeLabel(tipusVehicleSlug)
            },
            href: `/vehicles-andorra?tipus-vehicle=${encodeURIComponent(tipusVehicleSlug)}`
          } : null,
          marcaSlug ? {
            label: {
              es: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
              ca: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
              en: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1),
              fr: marcaLabel.charAt(0).toUpperCase() + marcaLabel.slice(1)
            },
            href: `/vehicles-andorra?tipus-vehicle=${encodeURIComponent(tipusVehicleSlug)}&marques-cotxe=${encodeURIComponent(marcaSlug)}`
          } : null,
          {
            label: {
              es: typeof vehicle["titol-anunci"] === "string" ? vehicle["titol-anunci"] : "Detalle",
              ca: typeof vehicle["titol-anunci"] === "string" ? vehicle["titol-anunci"] : "Detall",
              en: typeof vehicle["titol-anunci"] === "string" ? vehicle["titol-anunci"] : "Detail",
              fr: typeof vehicle["titol-anunci"] === "string" ? vehicle["titol-anunci"] : "Détail"
            }
          }
        ].filter(Boolean) as { label: { es: string; ca: string; en: string; fr: string }; href?: string }[];
        return <PageBreadcrumbs items={breadcrumbItems} brands={brands} />;
      })()}
      {(loading && !vehicle)
        ? <VehicleDetailSkeleton />
        : (
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Gallery */}
                <Card>
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={typeof mainImage === "string" ? mainImage : undefined}
                          alt={typeof vehicle["titol-anunci"] === "string" ? vehicle["titol-anunci"] : ""}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setLightboxOpen(true)}
                        />
                      </div>
                      {/* Gallery controls */}
                      {Array.isArray(gallery) && gallery.length > 1 && <>
                        <button
                          onClick={() => setSelectedImageIndex(selectedImageIndex === 0 ? gallery.length - 1 : selectedImageIndex - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(selectedImageIndex === gallery.length - 1 ? 0 : selectedImageIndex + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>}
                      {/* Thumbnails */}
                      {Array.isArray(gallery) && gallery.length > 1 && (
                        <div className="flex gap-2 p-4 overflow-x-auto">
                          {gallery.map((url: string, index: number) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 ${selectedImageIndex === index ? 'border-primary' : 'border-gray-200'}`}
                            >
                              <img
                                src={url}
                                alt={`Vista ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Lightbox component */}
                      <Lightbox
                        open={lightboxOpen}
                        close={() => setLightboxOpen(false)}
                        slides={gallery.map((url) => ({ src: url }))}
                        index={selectedImageIndex}
                        on={{ view: ({ index }) => setSelectedImageIndex(index) }}
                        plugins={[Thumbnails]}
                        animation={{ fade: 400 }}
                      />
                    </div>
                  </CardContent>
                </Card>
                {/* Descripción */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Descripció</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: vehicle["descripcio-anunci"] || "" }} />
                  </CardContent>
                </Card>
                {/* Ficha técnica */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Fitxa tècnica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {specs.filter(s => s.value).map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-medium">{typeof value === "string" || typeof value === "number" ? value : ""}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {/* Características */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Característiques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {features.filter(f => f.value).map(({ label, value }) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-medium">{typeof value === "string" || typeof value === "number" ? value : ""}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                {/* Extras */}
                {extras.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Extres inclosos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        {extras.map((extra: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-sm">{extra}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Vehicle info block in sidebar */}
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Badge destacado */}
                      {vehicle["anunci-destacat"] === true && (
                        <span className="inline-block bg-tertiary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Destacado
                        </span>
                      )}
                      {/* Título */}
                      {typeof vehicle["titol-anunci"] === "string" && (
                        <h1 className="text-2xl font-bold">{vehicle["titol-anunci"]}</h1>
                      )}
                      {/* Precio */}
                      <p className="text-3xl font-bold text-primary mb-2">
                        {vehicle["preu"] && Number(vehicle["preu"]) > 0
                          ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(Number(vehicle["preu"]))
                          : "A consultar"}
                      </p>
                      {/* Estado */}
                      {typeof vehicle["estat-vehicle"] === "string" && (
                        <span className="inline-block border border-gray-300 rounded-full px-3 py-1 text-sm mb-2">
                          {vehicle["estat-vehicle"]}
                        </span>
                      )}
                      {/* Technical and equipment data table */}
                      <div className="text-sm text-gray-800 space-y-1">
                        <div><span className="font-bold">Propulsor:</span> <span className="text-orange-600">{String(vehicle["tipus-propulsor"] ?? "-")}</span></div>
                        <div><span className="font-bold">Combustible:</span> <span className="text-orange-600">{String(vehicle["tipus-combustible"] ?? "-")}</span></div>
                        <div><span className="font-bold">Canvi:</span> <span className="text-orange-600">{String(vehicle["tipus-canvi-cotxe"] ?? "-")}</span></div>
                        <div><span className="font-bold">Marca:</span> <span className="text-orange-600">{String(vehicle["marques-cotxe"] ?? "-")}</span></div>
                        <div><span className="font-bold">Model:</span> <span className="text-orange-600">{String(vehicle["models-cotxe"] ?? "-")}</span></div>
                        <div><span className="font-bold">Versió:</span> <span>{String(vehicle["versio"] ?? "-")}</span></div>
                        <div><span className="font-bold">Segment:</span> <span>{String(vehicle["carrosseria-cotxe"] ?? "-")}</span></div>
                        <div><span className="font-bold">Any:</span> <span>{String(vehicle["any"] ?? vehicle["any-fabricacio"] ?? "-")}</span></div>
                        <div><span className="font-bold">Propietaris:</span> <span>{String(vehicle["nombre-propietaris"] ?? "-")}</span></div>
                        <div><span className="font-bold">Llibre manteniment:</span> <span>{vehicle["llibre-manteniment"] === true ? "Si" : vehicle["llibre-manteniment"] === false ? "No" : "-"}</span></div>
                        <div><span className="font-bold">Impostos deduïbles :</span> <span>{vehicle["impostos-deduibles"] === true ? "Si" : vehicle["impostos-deduibles"] === false ? "No" : "-"}</span></div>
                      </div>
                      {/* Favorites button */}
                      <Button
                        variant={isFav ? "secondary" : "outline"}
                        className={`w-full flex items-center justify-center gap-2 mt-4 ${isFav ? 'bg-primary text-white hover:bg-orange-700' : ''}`}
                        onClick={() => {
                          if (!vehicle) return;
                          toggleFavorite(String(vehicle.id));
                        }}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current text-white' : 'text-primary'}`} />
                        {isFav ? 'Eliminar de favorits' : 'Afegir a favorits'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                {/* Skeleton for vehicle info block */}
                {(loading || loadingProfessional) && <VehicleSidebarInfoSkeleton />}
                {/* Seller block: skeleton while loadingProfessional, data when loaded */}
                {loadingProfessional
                  ? <SellerSidebarSkeleton />
                  : professional && (
                    <Card>
                      <CardContent className="p-8 flex flex-col items-center">
                        {/* Company logo if exists, clickable to professional page */}
                        {professional["logo-empresa-home"] && typeof professional["logo-empresa-home"] === "string" && professional["logo-empresa-home"] !== "false" && (
                          <Link to={`/professional/${professional.id}`} className="block mb-4">
                            <img
                              src={professional["logo-empresa-home"]}
                              alt={professional["nom-empresa"] || professional["name"] || "Logo"}
                              className="w-20 h-20 object-contain rounded-full bg-white border hover:scale-105 transition-transform"
                            />
                          </Link>
                        )}
                        {/* Company or seller name, clickable to professional page */}
                        <div className="text-xl font-bold text-center mb-1">
                          <Link to={`/professional/${professional.id}`} className="hover:underline text-orange-700">
                            {professional["nom-empresa"] || professional["name"]}
                          </Link>
                        </div>
                        {/* Commercial phone */}
                        {professional["telefon-comercial"] && (
                          <div className="flex items-center gap-2 text-gray-700 mb-1">
                            <Phone className="w-4 h-4" />
                            <span>
                              Telèfon comercial: <span className="font-semibold text-orange-500">{professional["telefon-comercial"]}</span>
                            </span>
                          </div>
                        )}
                        {/* Divider */}
                        <div className="w-full border-t my-3" />
                        {/* Role badge */}
                        {professional["role"] && (
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-4 py-1 rounded mb-2">
                            {professional["role"].charAt(0).toUpperCase() + professional["role"].slice(1)}
                          </span>
                        )}
                        {/* Registration date */}
                        {professional["registered_date"] && (
                          <div className="text-xs text-gray-500 mb-4">
                            Data Alta {professional["registered_date"].split(' ')[0].split('-').reverse().join('.')}
                          </div>
                        )}
                        {/* Buttons */}
                        <div className="w-full flex flex-col gap-3 mb-4">
                          {/* WhatsApp or message */}
                          {(professional["telefon-whatsapp"] || professional["telefon-mobile-professional"]) && (
                            <Button
                              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
                              asChild
                            >
                              <a
                                href={`https://wa.me/${professional["telefon-whatsapp"] || professional["telefon-mobile-professional"]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span className="flex items-center justify-center gap-2">
                                  <MessageCircle className="w-5 h-5" />
                                  Enviar Missatge
                                </span>
                              </a>
                            </Button>
                          )}
                          {/* Seller profile */}
                          <Link to={`/professional/${professional.id}`}>
                            <Button variant="outline" className="w-full font-bold text-orange-600 border-orange-500 hover:bg-orange-50 flex items-center gap-2">
                              <User className="w-5 h-5" />
                              Perfil vendedor
                            </Button>
                          </Link>
                          {/* Vehicles in stock */}
                          <Link to={`/professional/${professional.id}?stock=1`}>
                            <Button variant="outline" className="w-full font-bold text-orange-600 border-orange-500 hover:bg-orange-50 flex items-center gap-2">
                              <Car className="w-5 h-5" />
                              Vehicles en stock
                            </Button>
                          </Link>
                          {/* Vehicles sold */}
                          <Link to={`/professional/${professional.id}?sold=1`}>
                            <Button variant="outline" className="w-full font-bold text-orange-600 border-orange-500 hover:bg-orange-50 flex items-center gap-2">
                              <Handshake className="w-5 h-5" />
                              Vehicles venuts
                            </Button>
                          </Link>
                          {/* Loan calculator */}
                          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            Calculadora prèstec
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="text-gray-500 text-base space-y-2">
                      <div className="flex justify-between">
                        <span>Anunci creat:</span>
                        <span>
                          {vehicle["data-creacio"]
                            ? String(vehicle["data-creacio"]).split('-').reverse().join('.')
                            : "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ID vehicle:</span>
                        <span>{vehicle["id"]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Afegits a favorits:</span>
                        <span>{isFav ? 1 : 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      <Footer />
    </div>
  );
};

export default VehicleDetail; 
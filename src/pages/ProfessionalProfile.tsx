import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";
import { MapPin, Phone, Mail, MessageCircle, Star, Award, Calendar, Users, Building2 } from "lucide-react";
import VehicleCard from "../components/VehicleCard";
import VehicleListCard from "../components/VehicleListCard";
import ListViewControls from "../components/ListViewControls";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { axiosAdmin } from "../api/axiosClient";

// Nueva interfaz Professional según el payload real
interface Professional {
  id: number;
  username: string;
  email: string;
  name: string;
  "nom-empresa": string;
  "logo-empresa": string;
  "logo-empresa-home"?: string;
  "telefon-mobile-professional"?: string;
  "telefon-comercial"?: string;
  "telefon-whatsapp"?: string;
  "localitat-professional"?: string;
  "adreca-professional"?: string;
  "nom-contacte"?: string;
  "cognoms-contacte"?: string;
  "descripcio-empresa"?: string;
  "pagina-web"?: string;
  "galeria-professionals"?: string[];
  "total_vehicles"?: number;
  "active_vehicles"?: number;
  registered_date?: string;
  role?: string;
}

// Importa el tipo Vehicle si lo tienes definido globalmente
import type { Vehicle } from "../types/Vehicle";

const ProfessionalProfile = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [activeTab, setActiveTab] = useState<string>("stock");

  // Estados para paginación real de la API
  const [totalVehiclesInStock, setTotalVehiclesInStock] = useState<number>(0);
  const [totalPagesInStock, setTotalPagesInStock] = useState<number>(1);
  const [totalVehiclesSold, setTotalVehiclesSold] = useState<number>(0);
  const [totalPagesSold, setTotalPagesSold] = useState<number>(1);

  // Fetch professional by id o slug
  useEffect(() => {
    setLoading(true);
    if (!id || isNaN(Number(id))) {
      setProfessional(null);
      setLoading(false);
      return;
    }
    const url = `/sellers?user_id=${id}`;
    axiosAdmin.get(url)
      .then(res => {
        let seller = null;
        if (Array.isArray(res.data?.data)) {
          seller = res.data.data.length > 0 ? res.data.data[0] : null;
        } else if (res.data?.data && typeof res.data.data === 'object') {
          seller = res.data.data;
        }
        setProfessional(seller);
      })
      .catch(() => {
        setProfessional(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch vehicles para profesional con paginación real
  useEffect(() => {
    if (!professional?.id) return;
    // Stock
    if (activeTab === "stock") {
      axiosAdmin.get(`/vehicles`, {
        params: {
          'anunci-actiu': true,
          user_id: professional.id,
          venut: false,
          page: currentPage,
          per_page: itemsPerPage
        }
      }).then(res => {
        setVehicles(res.data.items || []);
        setTotalVehiclesInStock(res.data.total || res.data.items.length || 0);
        setTotalPagesInStock(res.data.pages || Math.ceil((res.data.total || 0) / itemsPerPage) || 1);
      });
    } else {
      // Vendidos
      axiosAdmin.get(`/vehicles`, {
        params: {
          'anunci-actiu': true,
          user_id: professional.id,
          venut: 'true',
          page: currentPage,
          per_page: itemsPerPage
        }
      }).then(res => {
        setVehicles(res.data.items || []);
        setTotalVehiclesSold(res.data.total || res.data.items.length || 0);
        setTotalPagesSold(res.data.pages || Math.ceil((res.data.total || 0) / itemsPerPage) || 1);
      });
    }
  }, [professional, activeTab, currentPage, itemsPerPage]);

  // Los vehículos ya vienen paginados de la API
  const currentVehicles = vehicles;
  const totalPages = activeTab === "stock" ? totalPagesInStock : totalPagesSold;
  const totalItems = activeTab === "stock" ? totalVehiclesInStock : totalVehiclesSold;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + currentVehicles.length;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const breadcrumbItems = [
    { label: { es: "Professionals", ca: "Professionals", en: "Professionals", fr: "Professionals" }, href: "/profesionales" },
    { label: {
        es: (professional ? (professional["nom-empresa"] || professional.name || slug) : slug) || "",
        ca: (professional ? (professional["nom-empresa"] || professional.name || slug) : slug) || "",
        en: (professional ? (professional["nom-empresa"] || professional.name || slug) : slug) || "",
        fr: (professional ? (professional["nom-empresa"] || professional.name || slug) : slug) || ""
      }, icon: Building2 as React.ComponentType<unknown>, href: professional ? `/profesionales/${professional.id}` : undefined }
  ];

  if (loading) return <div className="py-16 text-center text-lg">Carregant perfil professional...</div>;
  if (!professional) return <div className="py-16 text-center text-red-600">No s'ha trobat el professional.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageBreadcrumbs items={breadcrumbItems} />
      <div className="container mx-auto px-4 py-8">
        {/* Professional Profile Card */}
        <Card className="mb-8 overflow-hidden shadow-2xl border border-gray-200 rounded-2xl bg-white">
          {/* Logo limpio sin overlay */}
          <div className="w-full flex justify-center items-center bg-white relative" style={{ height: 220, minHeight: 180 }}>
            <img
              src={professional["logo-empresa"] || ""}
              alt={`${professional.name || professional["nom-empresa"] || "Professional"} cover`}
              className="object-contain max-h-full"
              style={{ maxHeight: 200, width: "auto" }}
            />
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>
          <CardContent className="relative px-8 pb-8 bg-gradient-to-b from-white to-gray-50/50">
            {/* Main Profile Section */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8 flex-1">
                {/* Avatar */}
                <div className="relative mb-6 lg:mb-0 flex-shrink-0 -mt-20">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 blur-lg"></div>
                  <Avatar className="relative w-36 h-36 border-6 border-white shadow-2xl ring-4 ring-primary/20">
                    <AvatarImage src={professional["logo-empresa-home"] || professional["logo-empresa-home"] || ""} alt={professional.name || professional["nom-empresa"] || "Professional"} className="object-cover" />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-secondary text-white">
                      {(professional.name || professional["nom-empresa"] || "P").split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>
                {/* Main Information */}
                <div className="flex-1 lg:pt-6 space-y-6">
                  {/* Title and Ratings */}
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                      {professional.name || professional["nom-empresa"] || "Professional"}
                    </h1>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center bg-yellow-50 rounded-full px-4 py-2 border border-yellow-200">
                        <Star className="w-5 h-5 text-yellow-400 mr-2 fill-current" />
                        <span className="font-bold text-gray-900 text-lg">{professional.role === "verified" ? "Verificado" : "-"}</span>
                      </div>
                      <div className="flex items-center bg-blue-50 rounded-full px-4 py-2 border border-blue-200">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        <span className="font-semibold text-blue-900">{totalVehiclesInStock + totalVehiclesSold} vehicles</span>
                      </div>
                    </div>
                  </div>
                  {/* Info Container */}
                  <div className="bg-white/80 backdrop-blur rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
                    {/* Description */}
                    <div>
                      <p className="text-gray-700 text-lg leading-relaxed">{professional["descripcio-empresa"] ?? ""}</p>
                    </div>
                    {/* Contact Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <MapPin className="w-6 h-6 mr-3 text-primary flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-700 block">Adreça</span>
                          <span className="text-gray-600">{professional["adreca-professional"] ?? "-"}, {professional["localitat-professional"] ?? "-"}</span>
                        </div>
                      </div>
                      <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <Phone className="w-6 h-6 mr-3 text-primary flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-700 block">Telèfon</span>
                          <span className="text-gray-600">{professional["telefon-comercial"] ?? "-"}</span>
                        </div>
                      </div>
                    </div>
                    {/* Contact Person */}
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-primary" />
                        Persona de contacte
                      </h3>
                      <div className="flex items-center">
                        <Avatar className="w-16 h-16 mr-4 border-2 border-primary/20">
                          <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg">
                            {(professional["nom-contacte"] ?? "").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{professional["nom-contacte"] ?? "-"}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600 flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {professional.email ?? "-"}
                            </span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Des del {professional.registered_date ?? "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Button */}
              <div className="mt-6 lg:mt-0 lg:pt-6 flex-shrink-0">
                <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 rounded-xl">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contactar ara
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-xl border border-gray-200 rounded-2xl bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <Award className="w-8 h-8 mr-3" />
              Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex justify-between items-center mb-6">
                <TabsList className="grid w-auto grid-cols-2">
                  <TabsTrigger value="stock" className="px-8">
                    Vehicles en Stock ({totalVehiclesInStock})
                  </TabsTrigger>
                  <TabsTrigger value="sold" className="px-8">
                    Vehicles Venuts ({totalVehiclesSold})
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="stock" className="space-y-6">
                <ListViewControls
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  sortBy={sortBy}
                  onSortByChange={handleSortByChange}
                  currentPage={currentPage}
                  totalItems={totalItems}
                  startIndex={startIndex}
                  endIndex={endIndex}
                />
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }>
                  {currentVehicles.map((vehicle) => {
                    const uiVehicle = {
                      id: vehicle.id,
                      ["titol-anunci"]: vehicle["titol-anunci"] ?? "",
                      ["descripcio-anunci"]: vehicle["descripcio-anunci"] ?? "",
                      ["marques-cotxe"]: vehicle["marques-cotxe"] ?? "",
                      ["models-cotxe"]: vehicle["models-cotxe"] ?? "",
                      ["estat-vehicle"]: vehicle["estat-vehicle"] ?? "",
                      ["any"]: vehicle["any"] ?? "",
                      ["quilometratge"]: vehicle["quilometratge"] !== undefined && vehicle["quilometratge"] !== null ? String(vehicle["quilometratge"]) : "",
                      ["preu"]: vehicle["preu"] !== undefined && vehicle["preu"] !== null ? String(vehicle["preu"]) : "",
                      ["color-vehicle"]: vehicle["color-vehicle"] ?? "",
                      ["tipus-combustible"]: vehicle["tipus-combustible"] ?? "",
                      ["slug"]: vehicle["slug"] ?? "",
                      ["anunci-destacat"]: vehicle["anunci-destacat"] !== undefined ? String(vehicle["anunci-destacat"]) : "",
                      ["imatge-destacada-url"]: vehicle["imatge-destacada-url"] ?? "",
                      ["galeria-vehicle-urls"]: Array.isArray(vehicle["galeria-vehicle-urls"]) ? vehicle["galeria-vehicle-urls"] : [],
                      ["anunci-actiu"]: vehicle["anunci-actiu"] !== undefined ? String(vehicle["anunci-actiu"]) : ""
                    };
                    return viewMode === "grid" ? (
                      <VehicleCard key={vehicle.id} vehicle={uiVehicle} />
                    ) : (
                      <VehicleListCard key={vehicle.id} vehicle={uiVehicle} />
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          size="default"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              size="default"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          size="default"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </TabsContent>
              <TabsContent value="sold" className="space-y-6">
                <ListViewControls
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  sortBy={sortBy}
                  onSortByChange={handleSortByChange}
                  currentPage={currentPage}
                  totalItems={totalItems}
                  startIndex={startIndex}
                  endIndex={endIndex}
                />
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }>
                  {currentVehicles.map((vehicle) => {
                    const uiVehicle = {
                      id: vehicle.id,
                      ["titol-anunci"]: vehicle["titol-anunci"] ?? "",
                      ["descripcio-anunci"]: vehicle["descripcio-anunci"] ?? "",
                      ["marques-cotxe"]: vehicle["marques-cotxe"] ?? "",
                      ["models-cotxe"]: vehicle["models-cotxe"] ?? "",
                      ["estat-vehicle"]: vehicle["estat-vehicle"] ?? "",
                      ["any"]: vehicle["any"] ?? "",
                      ["quilometratge"]: vehicle["quilometratge"] !== undefined && vehicle["quilometratge"] !== null ? String(vehicle["quilometratge"]) : "",
                      ["preu"]: vehicle["preu"] !== undefined && vehicle["preu"] !== null ? String(vehicle["preu"]) : "",
                      ["color-vehicle"]: vehicle["color-vehicle"] ?? "",
                      ["tipus-combustible"]: vehicle["tipus-combustible"] ?? "",
                      ["slug"]: vehicle["slug"] ?? "",
                      ["anunci-destacat"]: vehicle["anunci-destacat"] !== undefined ? String(vehicle["anunci-destacat"]) : "",
                      ["imatge-destacada-url"]: vehicle["imatge-destacada-url"] ?? "",
                      ["galeria-vehicle-urls"]: Array.isArray(vehicle["galeria-vehicle-urls"]) ? vehicle["galeria-vehicle-urls"] : [],
                      ["anunci-actiu"]: vehicle["anunci-actiu"] !== undefined ? String(vehicle["anunci-actiu"]) : ""
                    };
                    return (
                      <div key={vehicle.id} className="relative">
                        {viewMode === "grid" ? (
                          <VehicleCard vehicle={uiVehicle} />
                        ) : (
                          <VehicleListCard vehicle={uiVehicle} />
                        )}
                        <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center rounded-lg">
                          <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                            VENUT
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {Math.ceil(totalItems / itemsPerPage) > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          size="default"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, Math.ceil(totalItems / itemsPerPage)) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              size="default"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          size="default"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < Math.ceil(totalItems / itemsPerPage)) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === Math.ceil(totalItems / itemsPerPage) ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalProfile; 
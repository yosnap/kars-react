import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Vehicle } from "../types/Vehicle";
import { useLanguage, getVehicleDescription } from "../context/LanguageContext";
import Footer from "../components/Footer";
import VehicleFilters, { defaultFilters as vehicleDefaultFilters } from "../components/VehicleFilters";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import ListViewControls from "../components/ListViewControls";
import VehicleCard from "../components/VehicleCard";
import VehicleListCard from "../components/VehicleListCard";
import { VehicleCardSkeleton } from "../components/VehicleCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../components/ui/pagination";

interface BreadcrumbLabel {
  ca: string;
  es?: string;
  en?: string;
  fr?: string;
}

interface VehicleListLayoutProps {
  initialFilters?: Record<string, string | boolean>;
  breadcrumbs?: Array<{ label: BreadcrumbLabel; href: string }>;
  pageTitle?: string;
  disableBaseQuery?: boolean; // Si true, no añade anunci-actiu ni venut
  customEndpoint?: string; // Nuevo prop para endpoint personalizado
  lockedStateValue?: string; // Nuevo prop para bloquear el select de estado
  hideFilters?: boolean; // Nuevo prop para ocultar los filtros
  showSoldButton?: boolean; // Nuevo prop para mostrar botón "Venut" en lugar de "Veure vehicle"
  defaultSortBy?: string; // Ordenación por defecto
  // basePath?: string;
}

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => {
    const params = Object.fromEntries(new URLSearchParams(search));
    delete params["anunci-actiu"];
    return params;
  }, [search]);
}

// Utilidad para traducir sortBy a orderby/order
function getOrderParams(sortBy: string) {
  switch (sortBy) {
    case "featured":
      return { orderby: "featured", order: "DESC" };
    case "price_asc":
      return { orderby: "price", order: "ASC" };
    case "price_desc":
      return { orderby: "price", order: "DESC" };
    case "date_desc":
      return { orderby: "date", order: "DESC" };
    case "date_asc":
      return { orderby: "date", order: "ASC" };
    case "title_asc":
      return { orderby: "title", order: "ASC" };
    case "title_desc":
      return { orderby: "title", order: "DESC" };
    default:
      return { orderby: "date", order: "DESC" };
  }
}

const VehicleListLayout: React.FC<VehicleListLayoutProps> = ({
  initialFilters = {},
  breadcrumbs = [],
  pageTitle = "Listado de vehículos",
  disableBaseQuery = false,
  customEndpoint,
  lockedStateValue,
  hideFilters = false, // Por defecto, mostrar filtros (compatibilidad)
  showSoldButton = false, // Por defecto, no mostrar botón vendido
  defaultSortBy = "date_desc", // Por defecto, orden por fecha descendente
  // basePath = "/vehicles-andorra",
}) => {
  const filters = useQueryParams();
  const { t, currentLanguage } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para vista, paginación y orden
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(defaultSortBy);

  // Estado para las marcas (brands) para los breadcrumbs
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Cálculo de paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Scroll al top cuando se carga el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch de vehículos (adaptar según tu API)
  useEffect(() => {
    setLoading(true);
    setVehicles([]); // Limpiar para mostrar skeletons
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const orderParams = getOrderParams(sortBy);
      // Elimina sortBy y order de los filtros antes de enviar a la API
      const { sortBy: _sortByFilter, order: _orderFilter, ...filtersWithoutSortBy } = filters;
      const params: Record<string, string | number | boolean> = {
        ...(!disableBaseQuery ? { "anunci-actiu": "true", "venut": "false" } : {}),
        orderby: orderParams.orderby,
        ...(orderParams.order ? { order: orderParams.order } : {}),
        ...initialFilters,
        ...filtersWithoutSortBy,
        page: currentPage,
        per_page: itemsPerPage,
      };
      const endpoint = customEndpoint || "/vehicles";
      
      
      axiosAdmin.get(endpoint, { params })
        .then(res => {
          const items = res.data.items || [];
          // NO filtrar ya que el backend debería hacerlo
          const activos = items;
          setVehicles(activos);
          
          // Usar siempre los valores del backend para consistencia
          setTotalItems(res.data.total || 0);
          setTotalPages(res.data.pages || 1);
        })
        .catch(err => {
          console.error('❌ API Error:', err);
          console.error('❌ Error response:', err.response);
          setError("Error al cargar vehículos");
        })
        .finally(() => setLoading(false));
    });
  }, [filters, initialFilters, currentPage, itemsPerPage, sortBy, disableBaseQuery, customEndpoint]);

  // Sincroniza currentPage con el valor de la query string 'page' solo al cargar
  useEffect(() => {
    const pageFromQuery = Number(filters.page) || 1;
    setCurrentPage(pageFromQuery);
  }, [filters.page]);

  // Sincroniza itemsPerPage con la URL (per_page)
  useEffect(() => {
    const perPageFromQuery = Number(filters.per_page) || 12;
    if (perPageFromQuery !== itemsPerPage) {
      setItemsPerPage(perPageFromQuery);
    }
  }, [filters.per_page]);

  // Sincroniza sortBy con la URL
  useEffect(() => {
    const sortByFromQuery = filters.sortBy || defaultSortBy;
    if (sortByFromQuery !== sortBy) {
      setSortBy(sortByFromQuery);
    }
  }, [filters.sortBy, defaultSortBy]);

  // Cambiar orden y sincronizar con la URL
  const handleSortByChange = useCallback((value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("sortBy", value);
    params.set("per_page", itemsPerPage.toString());
    params.set("page", "1");
    navigate(`${location.pathname}?${params.toString()}`);
    setSortBy(value);
    setCurrentPage(1);
  }, [navigate, location.pathname, itemsPerPage]);

  // Cambiar elementos por página y sincronizar con la URL
  const handleItemsPerPageChange = useCallback((value: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("per_page", value.toString());
    params.set("page", "1");
    navigate(`${location.pathname}?${params.toString()}`);
    // setItemsPerPage(value); // Ya se sincroniza por el efecto
    setCurrentPage(1);
  }, [navigate, location.pathname]);

  // Cambiar vista (grid/list)
  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
  }, []);

  // Cambiar página
  const handlePageChange = useCallback((page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    navigate(`${location.pathname}?${params.toString()}`);
    setCurrentPage(page);
  }, [navigate, location.pathname]);

  // Callback para aplicar filtros desde el sidebar
  const handleApplyFilters = (filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && k !== "anunci-actiu") params.append(k, v);
    });
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Determina si hay filtros activos (excluyendo page, order, per_page, anunci-actiu, venut, sortBy)
  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => !["page", "order", "per_page", "anunci-actiu", "venut", "sortBy"].includes(k) && v
  );
  // Decide qué filtros pasar a VehicleFilters (excluyendo per_page y valores vacíos de la URL)
  const filtersForVehicleFilters = hasActiveFilters
    ? Object.fromEntries(
        Object.entries({ ...initialFilters, ...filters })
          .filter(([k, v]) => !["per_page"].includes(k) && v !== "")
          .map(([k, v]) => [k, v.toString()])
      )
    : vehicleDefaultFilters;

  // Cargar marcas al montar o cambiar tipo de vehículo
  useEffect(() => {
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      // Para tipos distintos de moto, usar endpoint de coches
      const endpointMarcas = filters["tipus-vehicle"] === "moto"
        ? "/marques-moto"
        : "/marques-cotxe";
      axiosAdmin.get(endpointMarcas)
        .then((res) => {
          const marcas = Array.isArray(res.data.data) ? res.data.data : [];
          setBrands(marcas);
        })
        .catch(() => setBrands([]));
    });
  }, [filters["tipus-vehicle"]]);

  // Render cards según vista
  const renderVehicles = () => {
    // Solo muestro skeletons si está cargando y no hay vehículos previos
    if (loading && vehicles.length === 0) {
      if (viewMode === "grid") {
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
            {[...Array(itemsPerPage)].map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        );
      } else {
        return (
          <div className="space-y-4">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse h-40" />
            ))}
          </div>
        );
      }
    }
    // Si está cargando pero ya hay vehículos, muestro la lista anterior
    // y no muestro el spinner ni skeletons
    if (error) return <div className="text-red-600">{t('vehicles.error_loading')}: {error}</div>;
    if (!vehicles.length) return <div>{t('vehicles.no_results')}</div>;
    // Mapeo seguro a VehicleUI - convirtiendo de camelCase de la API a kebab-case para los componentes
    const vehiclesUI = vehicles.map((v: any) => ({
      id: String(v.id),
      ["titol-anunci"]: v.titolAnunci ?? "",
      ["descripcio-anunci"]: getVehicleDescription(v, currentLanguage),
      ["marques-cotxe"]: v.marcaCotxe ?? "",
      ["models-cotxe"]: v.modelsCotxe ?? "",
      ["estat-vehicle"]: v.estatVehicle ?? "",
      any: v.any ?? "",
      quilometratge: v.quilometratge !== undefined && v.quilometratge !== null ? String(v.quilometratge) : "",
      preu: v.preu !== undefined && v.preu !== null ? String(v.preu) : "",
      ["preu-antic"]: v.preuAntic !== undefined && v.preuAntic !== null ? String(v.preuAntic) : "",
      ["preu-anterior"]: v.preuAnterior !== undefined && v.preuAnterior !== null ? String(v.preuAnterior) : "",
      ["color-vehicle"]: v.colorVehicle ?? "",
      ["tipus-combustible"]: v.tipusCombustible ?? "",
      ["potencia-cv"]: v.potenciaCv !== undefined && v.potenciaCv !== null ? String(v.potenciaCv) : "",
      slug: v.slug ?? "",
      ["anunci-destacat"]: v.anunciDestacat !== undefined ? String(v.anunciDestacat) : "",
      ["imatge-destacada-url"]: v.imatgeDestacadaUrl ?? "",
      ["anunci-actiu"]: v.anunciActiu !== undefined ? String(v.anunciActiu) : "",
      venut: v.venut !== undefined ? String(v.venut) : ""
    }));
    return (
      <div className={
        viewMode === "grid"
          ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
          : "space-y-4"
      }>
        {vehiclesUI.map((v) =>
          viewMode === "grid"
            ? <VehicleCard key={v.id} vehicle={v} showSoldButton={showSoldButton} />
            : <VehicleListCard key={v.id} vehicle={v} showSoldButton={showSoldButton} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">

        {/* Migas de pan minimalistas */}
        {breadcrumbs.length > 0 && (
          <div className="mb-4 text-white [&_*]:!text-white [&_a]:!text-white [&_.text-primary]:!text-primary [&_[aria-current='page']]:!text-primary breadcrumb-container">
            <PageBreadcrumbs
              items={breadcrumbs.map(b => ({
                ...b,
                label: {
                  ca: b.label.ca ?? "",
                  es: b.label.es ?? "",
                  en: b.label.en ?? "",
                  fr: b.label.fr ?? ""
                }
              }))}
              brands={brands}
            />
          </div>
        )}

        {/* Título de la página */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white text-center">{pageTitle}</h1>
        </div>
        
        {/* Contenido principal */}
        <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de filtros - Oculto si hideFilters es true */}
        {!hideFilters && (
          <aside className="w-full md:w-72 flex-shrink-0 mb-8 md:mb-0">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 sticky top-8 text-white shadow-lg border border-gray-700/30">
              <h2 className="text-xl font-bold mb-4 text-white">{t('vehicles.filter_title')}</h2>
              <VehicleFilters
                key={lockedStateValue ? `locked-${lockedStateValue}` : JSON.stringify(filtersForVehicleFilters)}
                initialFilters={filtersForVehicleFilters}
                onApply={handleApplyFilters}
                lockedStateValue={lockedStateValue}
              />
            </div>
          </aside>
        )}
        {/* Listado de vehículos */}
        <main className={hideFilters ? "w-full" : "flex-1"}>
          <div>
            {/* Controles de vista y paginación */}
            <div className="mb-4">
              <ListViewControls
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                sortBy={sortBy}
                onSortByChange={handleSortByChange}
                currentPage={currentPage}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
              />
            </div>
          {/* Fila de filtros aplicados y botón quitar filtros (solo si hay filtros activos y no están ocultos) */}
          {!hideFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center min-h-[40px]">
            {(() => {
              const appliedFilters: Record<string, string | boolean> = { ...initialFilters, ...filters };
              const filterEntries = Object.entries(appliedFilters).filter(
                ([k, v]) => !["page", "order", "per_page", "anunci-actiu", "venut", "sortBy"].includes(k) && v
              );
              if (filterEntries.length === 0) return null;
              return <>
                <span className="font-semibold text-gray-700">{t('vehicles.applied_filters')}</span>
                {filterEntries.map(([k, v]) => {
                  // Mapeo visual para mostrar 'km0' en vez de 'km0-gerencia'
                  let displayValue = v;
                  let displayKey = k.replace(/-/g, ' ');
                  if (k === "estat-vehicle" && v === "km0-gerencia") displayValue = "km0";
                  // Mapeo para tipo de vehículo
                  if (k === "tipus-vehicle") {
                    displayKey = "Tipo de vehículo";
                    if (v === "cotxe") displayValue = "Coche";
                    else if (v === "moto-quad-atv") displayValue = "Moto";
                    else if (v === "autocaravana-camper") displayValue = "Caravana";
                    else if (v === "vehicle-comercial") displayValue = "Vehículo comercial";
                  }
                  const isFixed = Object.prototype.hasOwnProperty.call(initialFilters, k) && !Object.prototype.hasOwnProperty.call(filters, k);
                  return (
                    <span key={k} className="relative bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center pr-6">
                      {displayKey}: {displayValue}
                      {!isFixed && (
                        <button
                          className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-blue-700 hover:text-red-600 rounded-full focus:outline-none"
                          style={{ transform: 'translate(40%, -40%)' }}
                          aria-label={`Eliminar filtro ${k}`}
                          onClick={() => {
                            const params = new URLSearchParams(window.location.search);
                            params.delete(k);
                            params.set("page", "1");
                            navigate(`${location.pathname}?${params.toString()}`);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  );
                })}
                {/* Botón quitar todos los filtros */}
                <button
                  className="ml-2 px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold border border-gray-300 hover:bg-gray-200 transition"
                  onClick={() => {
                    navigate(`${location.pathname}?page=1`);
                  }}
                >
                  Quitar filtros
                </button>
              </>;
            })()}
          </div>
          )}
          {renderVehicles()}
          {/* Paginación visual */}
          <div className="flex justify-center items-center gap-4 mt-8">
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <button
                      className={`flex items-center justify-center h-10 px-4 text-sm font-medium transition-colors border rounded-md gap-1 ${
                        currentPage <= 1 
                          ? 'pointer-events-none opacity-50 bg-gray-800 text-gray-500 border-gray-700' 
                          : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m15 18-6-6 6-6"/>
                      </svg>
                      <span>{t('pagination.previous')}</span>
                    </button>
                  </PaginationItem>
                  {/* Números de página: sistema mejorado con inicio, fin y puntos suspensivos */}
                  {(() => {
                    let start = Math.max(1, currentPage - 2);
                    const end = Math.min(totalPages, start + 4);
                    if (end - start < 4) {
                      start = Math.max(1, end - 4);
                    }
                    const pages = [];
                    // Siempre mostrar la primera página
                    if (start > 1) {
                      pages.push(
                        <PaginationItem key={1}>
                          <button
                            className={`flex items-center justify-center h-10 px-4 text-sm font-medium transition-colors border rounded-md ${
                              currentPage === 1 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                            }`}
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </button>
                        </PaginationItem>
                      );
                      if (start > 2) {
                        pages.push(
                          <PaginationItem key="start-ellipsis">
                            <span className="px-2 text-gray-400">...</span>
                          </PaginationItem>
                        );
                      }
                    }
                    // Páginas centrales
                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(
                          <PaginationItem key={i}>
                            <button
                              className={`flex items-center justify-center h-10 px-4 text-sm font-medium transition-colors border rounded-md ${
                                currentPage === i 
                                  ? 'bg-primary text-white border-primary' 
                                  : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                              }`}
                              onClick={() => handlePageChange(i)}
                            >
                              {i}
                            </button>
                          </PaginationItem>
                        );
                      }
                    }
                    // Siempre mostrar la última página
                    if (end < totalPages) {
                      if (end < totalPages - 1) {
                        pages.push(
                          <PaginationItem key="end-ellipsis">
                            <span className="px-2 text-gray-400">...</span>
                          </PaginationItem>
                        );
                      }
                      pages.push(
                        <PaginationItem key={totalPages}>
                          <button
                            className={`flex items-center justify-center h-10 px-4 text-sm font-medium transition-colors border rounded-md ${
                              currentPage === totalPages 
                                ? 'bg-primary text-white border-primary' 
                                : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700'
                            }`}
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </PaginationItem>
                      );
                    }
                    return pages;
                  })()}
                  <PaginationItem>
                    <button
                      className={`flex items-center justify-center h-10 px-4 text-sm font-medium transition-colors border rounded-md gap-1 ${
                        currentPage >= totalPages 
                          ? 'pointer-events-none opacity-50 bg-gray-800 text-gray-500 border-gray-700' 
                          : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      <span>{t('pagination.next')}</span>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
          </div>
        </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VehicleListLayout; 
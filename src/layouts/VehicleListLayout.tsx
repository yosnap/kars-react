import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Vehicle } from "../types/Vehicle";
import Footer from "../components/Footer";
import VehicleFilters, { defaultFilters as vehicleDefaultFilters } from "../components/VehicleFilters";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import ListViewControls from "../components/ListViewControls";
import VehicleCard from "../components/VehicleCard";
import VehicleListCard from "../components/VehicleListCard";
import { VehicleCardSkeleton, Spinner } from "../components/VehicleCard";
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
      // Ordenar por el campo numérico 'anunci-destacat' descendente
      return { orderby: "anunci-destacat", order: "DESC" };
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
      return { orderby: "anunci-destacat", order: "DESC" };
  }
}

const VehicleListLayout: React.FC<VehicleListLayoutProps> = ({
  initialFilters = {},
  breadcrumbs = [],
  pageTitle = "Listado de vehículos",
  disableBaseQuery = false,
  customEndpoint,
  lockedStateValue,
  // basePath = "/vehicles-andorra",
}) => {
  const filters = useQueryParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para vista, paginación y orden
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");

  // Estado para las marcas (brands) para los breadcrumbs
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Cálculo de paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Memoriza los filtros para evitar que cambien en cada render y disparen el efecto innecesariamente
  const memoizedFilters = useMemo(() => ({ ...filters }), [JSON.stringify(filters)]);

  // Fetch de vehículos (adaptar según tu API)
  useEffect(() => {
    // Debug: log para ver cuándo y por qué se dispara el efecto
    console.log("[VehicleListLayout] Disparando fetch de vehículos", {
      memoizedFilters,
      initialFilters,
      currentPage,
      itemsPerPage,
      sortBy,
      disableBaseQuery,
      customEndpoint
    });
    setLoading(true);
    setVehicles([]); // Limpiar para mostrar skeletons
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const orderParams = getOrderParams(sortBy);
      const params: Record<string, string | number | boolean> = {
        ...initialFilters,
        ...memoizedFilters,
        ...(disableBaseQuery ? {} : {}), // No añadir 'anunci-actiu' nunca
        page: currentPage,
        per_page: itemsPerPage,
        orderby: orderParams.orderby,
        ...(orderParams.order ? { order: orderParams.order } : {}),
      };
      const endpoint = customEndpoint || "/vehicles";
      axiosAdmin.get(endpoint, { params })
        .then(res => {
          // Filtra solo los vehículos activos
          const activos = (res.data.items || []).filter(
            (v: Record<string, string>) => v["anunci-actiu"] === "true"
          );
          setVehicles(activos);
          setTotalItems(res.data.total || activos.length || 0);
          setTotalPages(res.data.pages || Math.ceil(activos.length / itemsPerPage) || 1);
        })
        .catch(() => setError("Error al cargar vehículos"))
        .finally(() => setLoading(false));
    });
  }, [memoizedFilters, initialFilters, currentPage, itemsPerPage, sortBy, disableBaseQuery, customEndpoint]);

  // Sincroniza currentPage con el valor de la query string 'page'
  useEffect(() => {
    const pageFromQuery = Number(filters.page) || 1;
    if (pageFromQuery !== currentPage) {
      setCurrentPage(pageFromQuery);
    }
  }, [filters.page]);

  // Sincroniza itemsPerPage con la URL (per_page)
  useEffect(() => {
    const perPageFromQuery = Number(filters.per_page) || 12;
    if (perPageFromQuery !== itemsPerPage) {
      setItemsPerPage(perPageFromQuery);
    }
  }, [filters.per_page]);

  // Cambiar orden
  const handleSortByChange = useCallback((value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  }, []);

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
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Callback para aplicar filtros desde el sidebar
  const handleApplyFilters = (filters: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && k !== "anunci-actiu") params.append(k, v);
    });
    navigate(`${location.pathname}?${params.toString()}`);
  };

  // Determina si hay filtros activos (excluyendo page, order, per_page, anunci-actiu, venut)
  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => !["page", "order", "per_page", "anunci-actiu", "venut"].includes(k) && v
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
    if (loading && vehicles.length === 0) {
      // Skeletons mientras carga
      if (viewMode === "grid") {
        return (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6`}>
            {[...Array(itemsPerPage)].map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        );
      } else {
        // Skeletons para lista
        return (
          <div className="space-y-4">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse h-40" />
            ))}
          </div>
        );
      }
    }
    if (loading) return <Spinner />;
    if (error) return <div className="text-red-600">{error}</div>;
    if (!vehicles.length) return <div>No hay vehículos disponibles.</div>;
    // Mapeo seguro a VehicleUI
    const vehiclesUI = vehicles.map((v) => ({
      ...v,
      quilometratge: v.quilometratge !== undefined && v.quilometratge !== null ? String(v.quilometratge) : "",
      preu: v.preu !== undefined && v.preu !== null ? String(v.preu) : "",
      ["anunci-actiu"]: v["anunci-actiu"] !== undefined && v["anunci-actiu"] !== null ? String(v["anunci-actiu"]) : "",
      venut: v.venut !== undefined && v.venut !== null ? String(v.venut) : "",
      ["anunci-destacat"]: v["anunci-destacat"] !== undefined && v["anunci-destacat"] !== null ? String(v["anunci-destacat"]) : "",
    }));
    return (
      <div className={
        viewMode === "grid"
          ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6`
          : "space-y-4"
      }>
        {vehiclesUI.map((v) =>
          viewMode === "grid"
            ? <VehicleCard key={v.id} vehicle={v} />
            : <VehicleListCard key={v.id} vehicle={v} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs siempre en una columna y ancho completo */}
      {breadcrumbs.length > 0 && (
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
      )}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar de filtros */}
        <aside className="w-full md:w-72 flex-shrink-0 mb-8 md:mb-0">
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4">Filtrar vehículos</h2>
            <VehicleFilters
              key={lockedStateValue ? `locked-${lockedStateValue}` : JSON.stringify(filtersForVehicleFilters)}
              initialFilters={filtersForVehicleFilters}
              onApply={handleApplyFilters}
              lockedStateValue={lockedStateValue}
            />
          </div>
        </aside>
        {/* Listado de vehículos */}
        <main className="flex-1">
          {pageTitle && <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>}
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
          {/* Fila de filtros aplicados y botón quitar filtros (solo si hay filtros activos) */}
          <div className="mb-6 flex flex-wrap gap-2 items-center min-h-[40px]">
            {(() => {
              const appliedFilters: Record<string, string | boolean> = { ...initialFilters, ...filters };
              const filterEntries = Object.entries(appliedFilters).filter(
                ([k, v]) => !["page", "order", "per_page", "anunci-actiu", "venut"].includes(k) && v
              );
              if (filterEntries.length === 0) return null;
              return <>
                <span className="font-semibold text-gray-700">Filtros aplicados:</span>
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
          {renderVehicles()}
          {/* Paginación visual */}
          <div className="flex justify-center items-center gap-4 mt-8">
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={currentPage > 1 ? () => handlePageChange(currentPage - 1) : undefined}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
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
                          <PaginationLink
                            isActive={currentPage === 1}
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </PaginationLink>
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
                            <PaginationLink
                              isActive={currentPage === i}
                              onClick={() => handlePageChange(i)}
                            >
                              {i}
                            </PaginationLink>
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
                          <PaginationLink
                            isActive={currentPage === totalPages}
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return pages;
                  })()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={currentPage < totalPages ? () => handlePageChange(currentPage + 1) : undefined}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default VehicleListLayout; 
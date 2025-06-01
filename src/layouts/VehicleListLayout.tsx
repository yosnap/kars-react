import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { Vehicle } from "../types/Vehicle";
import Footer from "../components/Footer";
import VehicleFilters from "../components/VehicleFilters";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import ListViewControls from "../components/ListViewControls";
import VehicleCard from "../components/VehicleCard";
import VehicleListCard from "../components/VehicleListCard";
import { VehicleCardSkeleton, Spinner } from "../components/VehicleCard";

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

const VehicleListLayout: React.FC<VehicleListLayoutProps> = ({
  initialFilters = {},
  breadcrumbs = [],
  pageTitle = "Listado de vehículos",
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

  // Cálculo de paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Fetch de vehículos (adaptar según tu API)
  useEffect(() => {
    setLoading(true);
    setVehicles([]); // Limpiar para mostrar skeletons
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const params: Record<string, string | number | boolean> = {
        ...initialFilters,
        ...filters,
        page: currentPage,
        per_page: itemsPerPage,
        order: sortBy,
      };
      axiosAdmin.get("/vehicles", { params })
        .then(res => {
          setVehicles(res.data.items || []);
          setTotalItems(res.data.total || res.data.items?.length || 0);
          setTotalPages(res.data.pages || 1);
        })
        .catch(() => setError("Error al cargar vehículos"))
        .finally(() => setLoading(false));
    });
  }, [filters, initialFilters, currentPage, itemsPerPage, sortBy]);

  // Cambiar orden
  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Cambiar elementos por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
    return (
      <div className={
        viewMode === "grid"
          ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6`
          : "space-y-4"
      }>
        {vehicles.map((v) =>
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
        />
      )}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar de filtros */}
        <aside className="w-full md:w-72 flex-shrink-0 mb-8 md:mb-0">
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-4">Filtrar vehículos</h2>
            <VehicleFilters initialFilters={Object.fromEntries(Object.entries({ ...initialFilters, ...filters }).map(([k, v]) => [k, v.toString()]))} onApply={() => {}} />
          </div>
        </aside>
        {/* Listado de vehículos */}
        <main className="flex-1">
          {pageTitle && <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>}
          {/* Controles de vista y paginación */}
          <div className="mb-4">
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
          </div>
          {/* Fila de filtros aplicados y botón quitar filtros (solo si hay filtros activos) */}
          <div className="mb-6 flex flex-wrap gap-2 items-center min-h-[40px]">
            {(() => {
              // Combina filtros de la URL y los fijos
              const appliedFilters: Record<string, string | boolean> = { ...initialFilters, ...filters };
              // Solo muestra si hay algún filtro (excluyendo page y order)
              const filterEntries = Object.entries(appliedFilters).filter(
                ([k, v]) => k !== "page" && k !== "order" && v
              );
              if (filterEntries.length === 0) return null;
              return <>
                <span className="font-semibold text-gray-700">Filtros aplicados:</span>
                {filterEntries.map(([k, v]) => {
                  const isFixed = Object.prototype.hasOwnProperty.call(initialFilters, k) && !Object.prototype.hasOwnProperty.call(filters, k);
                  return (
                    <span key={k} className="relative bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center pr-6">
                      {k.replace(/-/g, ' ')}: {v}
                      {!isFixed && (
                        <button
                          className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-blue-700 hover:text-red-600 rounded-full focus:outline-none"
                          style={{ transform: 'translate(40%, -40%)' }}
                          aria-label={`Eliminar filtro ${k}`}
                          onClick={() => {
                            const params = new URLSearchParams(window.location.search);
                            params.delete(k);
                            params.set("page", "1");
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
                    const params = new URLSearchParams();
                    params.set("page", "1");
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
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Anterior
            </button>
            <span>Página {currentPage} de {totalPages}</span>
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default VehicleListLayout; 
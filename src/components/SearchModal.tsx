import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import VehicleCard, { VehicleCardSkeleton } from "./VehicleCard";
import VehicleListCard from "./VehicleListCard";
import ListViewControls from "./ListViewControls";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Vehicle {
  id: string;
  "titol-anunci": string;
  "descripcio-anunci": string;
  "marques-cotxe": string;
  "models-cotxe": string;
  "estat-vehicle": string;
  "any": string;
  "quilometratge": string;
  "preu": string;
  "color-vehicle": string;
  "tipus-combustible": string;
  "anunci-destacat": string;
  "imatge-destacada-url": string;
  "galeria-vehicle-urls": string[];
  "anunci-actiu": string;
}

interface SearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  searchQuery: string;
  isLoading?: boolean;
}

const SearchModal = ({ isOpen, onOpenChange, vehicles, searchQuery, isLoading = false }: SearchModalProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");

  // Función para ordenar vehículos
  const sortVehicles = (vehicles: Vehicle[], sortBy: string) => {
    const sortedVehicles = [...vehicles];
    
    switch (sortBy) {
      case "featured":
        return sortedVehicles.sort((a, b) => 
          (b["anunci-destacat"] === "true" ? 1 : 0) - (a["anunci-destacat"] === "true" ? 1 : 0)
        );
      case "price-low":
        return sortedVehicles.sort((a, b) => parseInt(a["preu"]) - parseInt(b["preu"]));
      case "price-high":
        return sortedVehicles.sort((a, b) => parseInt(b["preu"]) - parseInt(a["preu"]));
      case "newest":
        return sortedVehicles.sort((a, b) => parseInt(b["any"]) - parseInt(a["any"]));
      case "oldest":
        return sortedVehicles.sort((a, b) => parseInt(a["any"]) - parseInt(b["any"]));
      case "alphabetical-az":
        return sortedVehicles.sort((a, b) => a["titol-anunci"].localeCompare(b["titol-anunci"]));
      case "alphabetical-za":
        return sortedVehicles.sort((a, b) => b["titol-anunci"].localeCompare(a["titol-anunci"]));
      default:
        return sortedVehicles;
    }
  };

  // Filtrar solo vehículos activos
  const activeVehicles = vehicles.filter(v => v["anunci-actiu"] === "true");
  const sortedVehicles = sortVehicles(activeVehicles, sortBy);
  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = sortedVehicles.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle className="text-2xl font-bold">
              {searchQuery ? `Resultados: "${searchQuery}"` : "Resultados de búsqueda"}
            </DialogTitle>
            <p className="text-gray-600 mt-1">
              {isLoading
                ? "Buscando..."
                : `${activeVehicles.length} vehículo${activeVehicles.length !== 1 ? 's' : ''} encontrado${activeVehicles.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="space-y-6 h-full overflow-y-auto">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
                <span className="text-sm text-gray-400 font-medium">Mostrant 0 de 0 resultats</span>
              </div>
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1"
                : "space-y-4 px-1"
              }>
                {[...Array(itemsPerPage)].map((_, i) => (
                  viewMode === "grid"
                    ? <VehicleCardSkeleton key={i} />
                    : <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse min-h-[120px] flex flex-col" />
                ))}
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <Card className="h-full">
              <CardContent className="p-8 text-center h-full flex items-center justify-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-600">
                    No hay vehículos que coincidan con la búsqueda "{searchQuery}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 h-full overflow-y-auto">
              {isLoading ? (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-4">
                  <span className="text-sm text-gray-400 font-medium">Buscando...</span>
                </div>
              ) : (
                <ListViewControls
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  sortBy={sortBy}
                  onSortByChange={handleSortByChange}
                  currentPage={currentPage}
                  totalItems={sortedVehicles.length}
                  startIndex={startIndex}
                  endIndex={endIndex}
                />
              )}

              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-1"
                : "space-y-4 px-1"
              }>
                {paginatedVehicles.map((vehicle) => (
                  viewMode === "grid" ? (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} searchQuery={searchQuery} />
                  ) : (
                    <VehicleListCard key={vehicle.id} vehicle={vehicle} searchQuery={searchQuery} />
                  )
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;

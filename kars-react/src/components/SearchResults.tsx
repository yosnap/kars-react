
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VehicleCard from "./VehicleCard";
import VehicleListCard from "./VehicleListCard";
import ListViewControls from "./ListViewControls";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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
}

interface SearchResultsProps {
  vehicles: Vehicle[];
  searchQuery: string;
  isLoading?: boolean;
}

const SearchResults = ({ vehicles, searchQuery, isLoading = false }: SearchResultsProps) => {
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

  const sortedVehicles = sortVehicles(vehicles, sortBy);
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

  if (isLoading) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600">
                No hay vehículos que coincidan con la búsqueda "{searchQuery}"
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Resultados de búsqueda: "{searchQuery}"
            </CardTitle>
            <p className="text-gray-600">
              {vehicles.length} vehículo{vehicles.length !== 1 ? 's' : ''} encontrado{vehicles.length !== 1 ? 's' : ''}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {paginatedVehicles.map((vehicle) => (
                viewMode === "grid" ? (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ) : (
                  <VehicleListCard key={vehicle.id} vehicle={vehicle} />
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
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SearchResults;

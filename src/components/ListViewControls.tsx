import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid2X2, LayoutList } from "lucide-react";

interface ListViewControlsProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  sortBy?: string;
  onSortByChange?: (sortBy: string) => void;
  currentPage: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

const ListViewControls = ({
  viewMode,
  onViewModeChange,
  itemsPerPage = 12,
  onItemsPerPageChange,
  sortBy = "featured",
  onSortByChange,
  currentPage = 1,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0
}: ListViewControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {/* Contador de resultados */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">
          Mostrant {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems.toLocaleString()} resultats
        </span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4">
        {/* Selector de ordenación */}
        {onSortByChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="featured">Destacados primero</SelectItem>
                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="alphabetical-az">Alfabético (A-Z)</SelectItem>
                <SelectItem value="alphabetical-za">Alfabético (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selector de elementos por página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="36">36</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selector de vista */}
        <div className="flex items-center gap-1 border border-gray-200 rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-r-none"
          >
            <Grid2X2 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-l-none"
          >
            <LayoutList className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListViewControls; 
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
  //currentPage = 1,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0
}: ListViewControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-900/95 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-xl text-white">
      {/* Contador de resultados */}
      <div className="text-sm text-gray-300">
        <span className="font-medium">
          Mostrant {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems.toLocaleString()} resultats
        </span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4">
        {/* Selector de ordenación */}
        {onSortByChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Ordenar per:</span>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                <SelectValue placeholder="Selecciona una opció" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border border-gray-700 shadow-xl z-50 text-white">
                <SelectItem value="featured" className="text-white hover:bg-gray-700 focus:bg-gray-700">Destacats primer</SelectItem>
                <SelectItem value="price_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">Preu: menor a major</SelectItem>
                <SelectItem value="price_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">Preu: major a menor</SelectItem>
                <SelectItem value="date_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">Més recents</SelectItem>
                <SelectItem value="date_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">Més antics</SelectItem>
                <SelectItem value="title_asc" className="text-white hover:bg-gray-700 focus:bg-gray-700">Alfabètic (A-Z)</SelectItem>
                <SelectItem value="title_desc" className="text-white hover:bg-gray-700 focus:bg-gray-700">Alfabètic (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selector de elementos por página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Mostrar:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(parseInt(value))}>
            <SelectTrigger className="w-20 bg-gray-700/50 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border border-gray-700 shadow-xl z-50 text-white">
              <SelectItem value="5" className="text-white hover:bg-gray-700 focus:bg-gray-700">5</SelectItem>
              <SelectItem value="10" className="text-white hover:bg-gray-700 focus:bg-gray-700">10</SelectItem>
              <SelectItem value="12" className="text-white hover:bg-gray-700 focus:bg-gray-700">12</SelectItem>
              <SelectItem value="24" className="text-white hover:bg-gray-700 focus:bg-gray-700">24</SelectItem>
              <SelectItem value="36" className="text-white hover:bg-gray-700 focus:bg-gray-700">36</SelectItem>
              <SelectItem value="48" className="text-white hover:bg-gray-700 focus:bg-gray-700">48</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Selector de vista */}
        <div className="flex items-center gap-1 border border-gray-600 rounded-md">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={`rounded-r-none ${viewMode === "grid" ? "bg-primary text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white"}`}
          >
            <Grid2X2 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={`rounded-l-none ${viewMode === "list" ? "bg-primary text-white" : "bg-gray-700/50 text-gray-300 hover:bg-gray-600 hover:text-white"}`}
          >
            <LayoutList className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ListViewControls; 
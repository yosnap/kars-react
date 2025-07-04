
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterActiveDisplayProps {
  activeFilters: string[];
  onRemoveFilter: (filterKey: string) => void;
  onClearAll: () => void;
}

const FilterActiveDisplay = ({ activeFilters, onRemoveFilter, onClearAll }: FilterActiveDisplayProps) => {
  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium">Filtros activos:</span>
      {activeFilters.map((filter) => (
        <Badge 
          key={filter} 
          variant="secondary" 
          className="bg-primary text-white cursor-pointer hover:bg-secondary"
          onClick={() => onRemoveFilter(filter)}
        >
          {filter} <X className="w-3 h-3 ml-1" />
        </Badge>
      ))}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onClearAll}
        className="ml-2"
      >
        Limpiar todo
      </Button>
    </div>
  );
};

export default FilterActiveDisplay;

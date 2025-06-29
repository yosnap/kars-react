
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import VehicleFilters from "./VehicleFilters";

interface FilterState {
  tipusVehicle: string;
  marca: string;
  model: string;
  marcaCotxe: string;
  modelCotxe: string;
  marcaMoto: string;
  modelMoto: string;
  estatVehicle: string;
  tipusCombustible: string;
  tipusPropulsor: string;
  tipusCanvi: string;
  anyMin: string;
  anyMax: string;
  preuMin: string;
  preuMax: string;
  quilometratgeMax: string;
  potenciaMin: string;
  potenciaMax: string;
  colorVehicle: string;
  destacats: boolean;
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdvancedSearchModal = ({ isOpen, onOpenChange }: AdvancedSearchModalProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    tipusVehicle: "",
    marca: "",
    model: "",
    marcaCotxe: "",
    modelCotxe: "",
    marcaMoto: "",
    modelMoto: "",
    estatVehicle: "",
    tipusCombustible: "",
    tipusPropulsor: "",
    tipusCanvi: "",
    anyMin: "",
    anyMax: "",
    preuMin: "",
    preuMax: "",
    quilometratgeMax: "",
    potenciaMin: "",
    potenciaMax: "",
    colorVehicle: "",
    destacats: false,
  });

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Crear parámetros de búsqueda basados en los filtros
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && value !== false) {
        searchParams.append(key, value.toString());
      }
    });

    // Redirigir a la página de resultados con los filtros como parámetros
    const queryString = searchParams.toString();
    const resultsUrl = queryString ? `/resultados?${queryString}` : '/resultados';
    
    navigate(resultsUrl);
    onOpenChange(false);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== "" && value !== false
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">
            Búsqueda Avanzada
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <VehicleFilters 
            onFiltersChange={handleFiltersChange}
            showApplyButton={false}
          />
        </div>

        <div className="border-t pt-4 mt-4 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="flex-1 bg-primary hover:bg-secondary"
            disabled={!hasActiveFilters}
          >
            Buscar Vehículos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearchModal;

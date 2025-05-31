
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import VehicleFilters from "./VehicleFilters";

interface FiltersSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FiltersSidebar = ({ isOpen, onOpenChange }: FiltersSidebarProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros de Búsqueda</SheetTitle>
          <SheetDescription>
            Encuentra el vehículo perfecto para ti
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <VehicleFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FiltersSidebar;

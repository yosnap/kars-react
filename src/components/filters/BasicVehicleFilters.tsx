import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Car, Bike, Home, Truck } from "lucide-react";

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

interface BasicVehicleFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | boolean) => void;
}

const BasicVehicleFilters = ({ filters, onFilterChange }: BasicVehicleFiltersProps) => {
  const marcasCotxe = [
    "Peugeot", "Volkswagen", "Ford", "Seat", "BMW", "Mercedes-Benz", 
    "Audi", "Toyota", "Hyundai", "Kia", "Nissan", "Honda", "Fiat",
    "Renault", "Opel", "Citroën", "Mazda", "Volvo", "Skoda"
  ];

  const marcasMoto = [
    "Honda", "Yamaha", "Kawasaki", "Suzuki", "BMW", "Ducati",
    "KTM", "Harley-Davidson", "Aprilia", "Triumph", "Beta", "Sherco"
  ];

  const combustiblesCotxe = [
    "Benzina", "Gasoil", "Elèctric", "Híbrid", "Híbrid Endollable", 
    "Elèctric + Combustible", "GLP", "Altres"
  ];

  const combustiblesMoto = [
    "Benzina", "Elèctric", "Híbrid", "Altres"
  ];

  const propulsors = [
    "Combustió", "Elèctric", "Híbrid", "Híbrid Endollable"
  ];

  const tipusCanvis = [
    "Manual", "Automàtic", "Semi-Automàtic", "Auto-Seqüencial"
  ];

  const colores = [
    "Blanc", "Negre", "Gris", "Plata", "Blau", "Vermell", 
    "Verd", "Groc", "Marró", "Taronja"
  ];

  const vehicleTypes = [
    { value: "COTXE", label: "Coche", icon: Car },
    { value: "MOTO", label: "Moto", icon: Bike },
    { value: "CARAVANA", label: "Caravana", icon: Home },
    { value: "CAMIO", label: "Camión", icon: Truck },
  ];

  const getCombustiblesForVehicleType = () => {
    return filters.tipusVehicle === "MOTO" ? combustiblesMoto : combustiblesCotxe;
  };

  const renderCheckboxGrid = (items: string[], filterKey: keyof FilterState) => (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox
            id={`${filterKey}-${item}`}
            checked={filters[filterKey] === item}
            onCheckedChange={(checked) => 
              onFilterChange(filterKey, checked ? item : '')
            }
          />
          <Label htmlFor={`${filterKey}-${item}`} className="text-sm">
            {item}
          </Label>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <Label htmlFor="cerca-vehicle">Cercar vehicle...</Label>
        <Input
          placeholder="Cercar vehicle..."
          className="mt-1"
        />
      </div>

      {/* Vehicle Type Selection with Icons */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Tipo de Vehículo</Label>
        <RadioGroup 
          value={filters.tipusVehicle} 
          onValueChange={(value) => onFilterChange('tipusVehicle', value)}
          className="grid grid-cols-2 gap-4"
        >
          {vehicleTypes.map((vehicleType) => {
            const IconComponent = vehicleType.icon;
            return (
              <div key={vehicleType.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={vehicleType.value} id={vehicleType.value.toLowerCase()} />
                <IconComponent className="w-5 h-5 text-gray-600" />
                <Label htmlFor={vehicleType.value.toLowerCase()} className="cursor-pointer flex-1">
                  {vehicleType.label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Conditional Brand and Model Filters */}
      {filters.tipusVehicle === "COTXE" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="marca-cotxe">Marca de cotxe</Label>
            <Select onValueChange={(value) => onFilterChange('marcaCotxe', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Marca de cotxe" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {marcasCotxe.map((marca) => (
                  <SelectItem key={marca} value={marca}>
                    {marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model-cotxe">Model de cotxe</Label>
            <Select onValueChange={(value) => onFilterChange('modelCotxe', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Model de cotxe" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="A3">A3</SelectItem>
                <SelectItem value="A4">A4</SelectItem>
                <SelectItem value="Golf">Golf</SelectItem>
                <SelectItem value="Polo">Polo</SelectItem>
                <SelectItem value="Focus">Focus</SelectItem>
                <SelectItem value="Fiesta">Fiesta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filters.tipusVehicle === "MOTO" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="marca-moto">Marca de moto</Label>
            <Select onValueChange={(value) => onFilterChange('marcaMoto', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Marca de moto" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {marcasMoto.map((marca) => (
                  <SelectItem key={marca} value={marca}>
                    {marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model-moto">Model de moto</Label>
            <Select onValueChange={(value) => onFilterChange('modelMoto', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Model de moto" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="CBR">CBR</SelectItem>
                <SelectItem value="R1">R1</SelectItem>
                <SelectItem value="Ninja">Ninja</SelectItem>
                <SelectItem value="GSX">GSX</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Fuel Type with Checkboxes in 2 columns */}
      {filters.tipusVehicle && (
        <div>
          <Label className="text-sm font-medium">Tipus de combustible</Label>
          {renderCheckboxGrid(getCombustiblesForVehicleType(), 'tipusCombustible')}
        </div>
      )}

      {/* Propulsion Type in 2 columns */}
      <div>
        <Label className="text-sm font-medium">Tipus de propulsor</Label>
        {renderCheckboxGrid(propulsors, 'tipusPropulsor')}
      </div>

      {/* Gearbox Type in 2 columns */}
      <div>
        <Label className="text-sm font-medium">Tipus de canvi</Label>
        {renderCheckboxGrid(tipusCanvis, 'tipusCanvi')}
      </div>

      {/* Vehicle State */}
      <div>
        <Label htmlFor="estat-vehicle">Estado</Label>
        <Select onValueChange={(value) => onFilterChange('estatVehicle', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="Nou">Nuevo</SelectItem>
            <SelectItem value="Km0">Km 0</SelectItem>
            <SelectItem value="Ocasió">Ocasión</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color in 2 columns */}
      <div>
        <Label className="text-sm font-medium">Color</Label>
        {renderCheckboxGrid(colores, 'colorVehicle')}
      </div>

      {/* Featured Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="destacats"
          checked={filters.destacats}
          onCheckedChange={(checked) => onFilterChange('destacats', checked as boolean)}
        />
        <Label htmlFor="destacats" className="text-sm">
          Solo vehículos destacados
        </Label>
      </div>
    </div>
  );
};

export default BasicVehicleFilters;

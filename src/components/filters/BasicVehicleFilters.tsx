import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  destacat: boolean;
}

interface MarcaWithCount {
  nombre: string;
  count: number;
}

interface BasicVehicleFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | boolean) => void;
  marcas?: MarcaWithCount[];
  modelos?: MarcaWithCount[];
  estados?: string[];
  combustibles?: {name: string; value: string}[];
  propulsores?: {name: string; value: string}[];
  cambios?: {name: string; value: string}[];
  colores?: string[];
  tipusVehicleCounts?: Record<string, number>;
  combustibleCounts?: Record<string, number>;
  propulsorCounts?: Record<string, number>;
  canviCounts?: Record<string, number>;
}

const BasicVehicleFilters = ({ filters, onFilterChange, marcas, modelos, estados, combustibles, propulsores, cambios, colores, tipusVehicleCounts, combustibleCounts, propulsorCounts, canviCounts }: BasicVehicleFiltersProps) => {
  const marcasCotxeLocal = [
    "Peugeot", "Volkswagen", "Ford", "Seat", "BMW", "Mercedes-Benz", 
    "Audi", "Toyota", "Hyundai", "Kia", "Nissan", "Honda", "Fiat",
    "Renault", "Opel", "Citroën", "Mazda", "Volvo", "Skoda"
  ];

  const marcasMotoLocal = [
    "Honda", "Yamaha", "Kawasaki", "Suzuki", "BMW", "Ducati",
    "KTM", "Harley-Davidson", "Aprilia", "Triumph", "Beta", "Sherco"
  ];

  const combustiblesCotxeLocal = [
    {name: "Benzina", value: "combustible-benzina"},
    {name: "Dièsel", value: "combustible-diesel"}, 
    {name: "Elèctric", value: "combustible-electric"}, 
    {name: "Híbrid", value: "hibrid"}, 
    {name: "Híbrid Endollable", value: "hibrid-endollable"}, 
    {name: "Elèctric + Combustible", value: "combustible-electric-combustible"}, 
    {name: "Gas Natural", value: "combustible-gas-natural-gnc"},
    {name: "GLP", value: "combustible-gas-liquat-glp"}, 
    {name: "Biocombustible", value: "combustible-biocombustible"},
    {name: "Hidrògen", value: "combustible-hidrogen"},
    {name: "Solar", value: "combustible-solar"},
    {name: "Solar + Combustible", value: "combustible-solar-hibrid"},
    {name: "Altres", value: "combustible-altres"}
  ];

  const combustiblesMotoLocal = [
    {name: "Benzina", value: "combustible-benzina"}, 
    {name: "Elèctric", value: "combustible-electric"}, 
    {name: "Híbrid", value: "hibrid"}, 
    {name: "Altres", value: "combustible-altres"}
  ];

  const propulsorsLocal = [
    {name: "Combustió", value: "combustio"},
    {name: "Elèctric", value: "electric"}, 
    {name: "Híbrid", value: "hibrid"}, 
    {name: "Hibrid Endollable", value: "hibrid-endollable"}
  ];

  const tipusCanvisLocal = [
    {name: "Manual", value: "manual"}, 
    {name: "Automàtic", value: "automatic"}, 
    {name: "Semi-Automàtic", value: "semi-automatic"}, 
    {name: "Auto-Seqüencial", value: "auto-sequencial"},
    {name: "Geartronic", value: "geartronic"},
    {name: "Seqüencial", value: "sequencial"}
  ];

  const coloresLocal = [
    "Blanc", "Negre", "Gris", "Plata", "Blau", "Vermell", 
    "Verd", "Groc", "Marró", "Taronja"
  ];

  const marcasCotxeToShow = (marcas && marcas.length > 0
    ? marcas
        .filter((m): m is MarcaWithCount => 
          typeof m === 'object' &&
          m !== null &&
          typeof m.nombre === 'string' &&
          m.nombre.trim() !== '' &&
          typeof m.count === 'number'
        )
        // Elimina duplicados por nombre
        .filter((m, i, arr) => arr.findIndex(x => x.nombre === m.nombre) === i)
    : marcasCotxeLocal.map(nombre => ({ nombre, count: 0 })));
  const modelosToShow = modelos && modelos.length > 0 
    ? modelos.filter(modelo => {
        if (typeof modelo === 'string') return true;
        if (typeof modelo === 'object' && modelo !== null && 'nombre' in modelo) return true;
        return false;
      }) 
    : [];
  
  console.log("BasicVehicleFilters - modelos prop:", modelos);
  console.log("BasicVehicleFilters - modelosToShow:", modelosToShow);
  console.log("BasicVehicleFilters - filters.tipusVehicle:", filters.tipusVehicle);
  console.log("BasicVehicleFilters - filters.marcaCotxe:", filters.marcaCotxe);
  // Preparar combustibles con contadores
  const getCombustiblesWithCount = () => {
    const apiData = combustibles && combustibles.length > 0 ? combustibles : [];
    const baseList = filters.tipusVehicle === "MOTO" ? 
      (apiData.length > 0 ? apiData.filter(c => ["combustible-benzina", "combustible-electric", "hibrid", "combustible-altres"].includes(c.value)) : combustiblesMotoLocal) :
      (apiData.length > 0 ? apiData : combustiblesCotxeLocal);
    
    if (combustibleCounts && Object.keys(combustibleCounts).length > 0) {
      return baseList
        .filter(item => combustibleCounts[item.name] > 0)
        .map(item => ({ nombre: item.name, count: combustibleCounts[item.name] || 0 }));
    }
    return baseList.map(item => ({ nombre: item.name, count: 0 }));
  };

  // Preparar propulsores con contadores
  const getPropulsoresWithCount = () => {
    const apiData = propulsores && propulsores.length > 0 ? propulsores : propulsorsLocal;
    if (propulsorCounts && Object.keys(propulsorCounts).length > 0) {
      return apiData
        .filter(item => propulsorCounts[item.name] > 0)
        .map(item => ({ nombre: item.name, count: propulsorCounts[item.name] || 0 }));
    }
    return apiData.map(item => ({ nombre: item.name, count: 0 }));
  };

  // Preparar cambios con contadores
  const getCambiosWithCount = () => {
    const apiData = cambios && cambios.length > 0 ? cambios : tipusCanvisLocal;
    if (canviCounts && Object.keys(canviCounts).length > 0) {
      return apiData
        .filter(item => canviCounts[item.name] > 0)
        .map(item => ({ nombre: item.name, count: canviCounts[item.name] || 0 }));
    }
    return apiData.map(item => ({ nombre: item.name, count: 0 }));
  };
  const coloresToShow = (colores && colores.length > 0 ? colores.filter(c => typeof c === 'string') : coloresLocal);
  const estadosToShow = estados && estados.length > 0 ? estados : ["Nou", "Km0", "Ocasió"];

  const vehicleTypes = [
    { value: "COTXE", label: "Coche", icon: Car },
    { value: "MOTO", label: "Moto", icon: Bike },
    { value: "CARAVANA", label: "Caravana", icon: Home },
    { value: "VEHICLE COMERCIAL", label: "Vehicle Comercial", icon: Truck },
  ];

  const getCombustiblesForVehicleType = () => {
    return getCombustiblesWithCount();
  };

  // Función para obtener el label y placeholder de marca según el tipo de vehículo
  const getMarcaLabel = () => {
    switch (filters.tipusVehicle) {
      case "COTXE": return { label: "Marca", placeholder: "Marca de cotxe" };
      case "MOTO": return { label: "Marca", placeholder: "Marca de moto" };
      case "CARAVANA": return { label: "Marca", placeholder: "Marca autocaravana" };
      case "CAMIO": return { label: "Marca", placeholder: "Marca vehicle comercial" };
      case "VEHICLE COMERCIAL": return { label: "Marca", placeholder: "Marca vehicle comercial" };
      default: return { label: "Marca", placeholder: "Marca" };
    }
  };
  const getModelLabel = () => {
    switch (filters.tipusVehicle) {
      case "COTXE": return { label: "Modelo", placeholder: "Model de cotxe" };
      case "MOTO": return { label: "Modelo", placeholder: "Model de moto" };
      case "CARAVANA": return { label: "Modelo", placeholder: "Model autocaravana" };
      case "CAMIO": return { label: "Modelo", placeholder: "Model vehicle comercial" };
      case "VEHICLE COMERCIAL": return { label: "Modelo", placeholder: "Model vehicle comercial" };
      default: return { label: "Modelo", placeholder: "Modelo" };
    }
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

  const renderCheckboxGridWithCount = (items: MarcaWithCount[], filterKey: keyof FilterState) => (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {items.map((item) => (
        <div key={item.nombre} className="flex items-center space-x-2">
          <Checkbox
            id={`${filterKey}-${item.nombre}`}
            checked={filters[filterKey] === item.nombre}
            onCheckedChange={(checked) => 
              onFilterChange(filterKey, checked ? item.nombre : '')
            }
          />
          <Label htmlFor={`${filterKey}-${item.nombre}`} className="text-sm flex-1">
            {item.nombre} {item.count > 0 && <span className="text-gray-500 text-xs ml-1">({item.count})</span>}
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
            const count = tipusVehicleCounts?.[vehicleType.value] ?? null;
            return (
              <div key={vehicleType.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={vehicleType.value} id={vehicleType.value.toLowerCase()} />
                <IconComponent className="w-5 h-5 text-gray-600" />
                <Label htmlFor={vehicleType.value.toLowerCase()} className="cursor-pointer flex-1">
                  {vehicleType.label}
                  {count !== null && (
                    <span className="ml-2 text-xs text-gray-500 font-semibold">({count})</span>
                  )}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Conditional Brand and Model Filters */}
      {["COTXE", "CARAVANA", "CAMIO", "VEHICLE COMERCIAL"].includes(filters.tipusVehicle) && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="marca-cotxe">{getMarcaLabel().label}</Label>
            <Select value={filters.marcaCotxe} onValueChange={(value) => onFilterChange('marcaCotxe', value)}>
              <SelectTrigger>
                <SelectValue placeholder={getMarcaLabel().placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {marcasCotxeToShow.length > 0 ? (
                  marcasCotxeToShow.map((marca) => (
                    <SelectItem
                      key={marca.nombre}
                      value={marca.nombre}
                    >
                      {`${marca.nombre} (${marca.count})`}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-gray-500 text-center">
                    No hay marcas disponibles para este tipo de vehículo
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model-cotxe">{getModelLabel().label}</Label>
            <Select value={filters.modelCotxe} onValueChange={(value) => onFilterChange('modelCotxe', value)}>
              <SelectTrigger>
                <SelectValue placeholder={getModelLabel().placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {(() => {
                  console.log("Rendering models select - modelosToShow.length:", modelosToShow.length);
                  console.log("Rendering models select - condition result:", modelosToShow.length > 0);
                  
                  if (modelosToShow.length > 0) {
                    console.log("Rendering models items:", modelosToShow);
                    return modelosToShow.map((modelo: string | { nombre: string; count?: number }) => {
                      let key: string;
                      let value: string;
                      let displayText: string;
                      if (typeof modelo === 'string') {
                        key = value = displayText = modelo;
                      } else {
                        key = value = modelo.nombre;
                        displayText = modelo.count !== undefined ? `${modelo.nombre} (${modelo.count})` : modelo.nombre;
                      }
                      return (
                        <SelectItem key={key} value={value}>
                          {displayText}
                        </SelectItem>
                      );
                    });
                  } else {
                    console.log("Showing empty message for marcaCotxe:", filters.marcaCotxe);
                    return (
                      <div className="px-2 py-1 text-sm text-gray-500 text-center">
                        {filters.marcaCotxe ? "No hay modelos disponibles para esta marca" : "Selecciona una marca primero"}
                      </div>
                    );
                  }
                })()}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filters.tipusVehicle === "MOTO" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="marca-moto">Marca de moto</Label>
            <Select value={filters.marcaMoto} onValueChange={(value) => onFilterChange('marcaMoto', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Marca de moto" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {marcas && marcas.length > 0 ? (
                  marcas.map((marca) => (
                    <SelectItem
                      key={marca.nombre}
                      value={marca.nombre}
                    >
                      {`${marca.nombre} (${marca.count})`}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-gray-500 text-center">
                    No hay marcas disponibles
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="model-moto">Model de moto</Label>
            <Select value={filters.modelMoto} onValueChange={(value) => onFilterChange('modelMoto', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Model de moto" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {modelosToShow.length > 0 ? (
                  modelosToShow.map((modelo: string | { nombre: string; count?: number }) => {
                    const key = typeof modelo === 'string' ? modelo : modelo.nombre;
                    const value = typeof modelo === 'string' ? modelo : modelo.nombre;
                    const displayText = typeof modelo === 'string' ? 
                      modelo : 
                      (modelo.count !== undefined ? `${modelo.nombre} (${modelo.count})` : modelo.nombre);
                    
                    return (
                      <SelectItem key={key} value={value}>
                        {displayText}
                      </SelectItem>
                    );
                  })
                ) : (
                  <div className="px-2 py-1 text-sm text-gray-500 text-center">
                    {filters.marcaMoto ? "No hay modelos disponibles para esta marca" : "Selecciona una marca primero"}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Fuel Type with Checkboxes in 2 columns */}
      {filters.tipusVehicle && (
        <div>
          <Label className="text-sm font-medium">Tipus de combustible</Label>
          {renderCheckboxGridWithCount(getCombustiblesForVehicleType(), 'tipusCombustible')}
        </div>
      )}

      {/* Propulsion Type in 2 columns */}
      <div>
        <Label className="text-sm font-medium">Tipus de propulsor</Label>
        {renderCheckboxGridWithCount(getPropulsoresWithCount(), 'tipusPropulsor')}
      </div>

      {/* Gearbox Type in 2 columns */}
      <div>
        <Label className="text-sm font-medium">Tipus de canvi</Label>
        {renderCheckboxGridWithCount(getCambiosWithCount(), 'tipusCanvi')}
      </div>

      {/* Vehicle State */}
      <div>
        <Label htmlFor="estat-vehicle">Estado</Label>
        <Select value={filters.estatVehicle} onValueChange={(value) => onFilterChange('estatVehicle', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {estadosToShow.map((estado) => {
              const key = typeof estado === 'string' ? estado : (estado as any).value;
              const value = typeof estado === 'string' ? estado : (estado as any).value;
              const displayText = typeof estado === 'string' ? estado : ((estado as any).name || (estado as any).value);
              
              return (
                <SelectItem key={key} value={value}>
                  {displayText}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Color in 2 columns */}
      <div>
        <Label className="text-sm font-medium">Color</Label>
        {renderCheckboxGrid(coloresToShow, 'colorVehicle')}
      </div>

      {/* Featured Only */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="destacat"
          checked={filters.destacat}
          onCheckedChange={(checked) => onFilterChange('destacat', checked as boolean)}
        />
        <Label htmlFor="destacat" className="text-sm">
          Solo vehículos destacados
        </Label>
      </div>
    </div>
  );
};

export default BasicVehicleFilters;

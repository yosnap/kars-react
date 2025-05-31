
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X } from "lucide-react";

interface FilterState {
  tipusVehicle: string;
  marca: string;
  model: string;
  estatVehicle: string;
  tipusCombustible: string;
  anyMin: string;
  anyMax: string;
  preuMin: string;
  preuMax: string;
  quilometratgeMax: string;
  colorVehicle: string;
  destacats: boolean;
}

const VehicleFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    tipusVehicle: "",
    marca: "",
    model: "",
    estatVehicle: "",
    tipusCombustible: "",
    anyMin: "",
    anyMax: "",
    preuMin: "",
    preuMax: "",
    quilometratgeMax: "",
    colorVehicle: "",
    destacats: false,
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const marcas = [
    "Peugeot", "Volkswagen", "Ford", "Seat", "BMW", "Mercedes-Benz", 
    "Audi", "Toyota", "Hyundai", "Kia", "Nissan", "Honda", "Fiat"
  ];

  const colores = [
    "Blanc", "Negre", "Gris", "Plata", "Blau", "Vermell", 
    "Verd", "Groc", "Marró", "Taronja"
  ];

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    if (value && key !== 'destacats') {
      if (!activeFilters.includes(key)) {
        setActiveFilters(prev => [...prev, key]);
      }
    } else if (!value) {
      setActiveFilters(prev => prev.filter(filter => filter !== key));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      tipusVehicle: "",
      marca: "",
      model: "",
      estatVehicle: "",
      tipusCombustible: "",
      anyMin: "",
      anyMax: "",
      preuMin: "",
      preuMax: "",
      quilometratgeMax: "",
      colorVehicle: "",
      destacats: false,
    });
    setActiveFilters([]);
  };

  const removeFilter = (filterKey: string) => {
    handleFilterChange(filterKey as keyof FilterState, "");
  };

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">Filtros activos:</span>
          {activeFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="secondary" 
              className="bg-primary text-white cursor-pointer hover:bg-secondary"
              onClick={() => removeFilter(filter)}
            >
              {filter} <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllFilters}
            className="ml-2"
          >
            Limpiar todo
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle Type */}
          <div>
            <Label htmlFor="tipus-vehicle">Tipo de Vehículo</Label>
            <Select onValueChange={(value) => handleFilterChange('tipusVehicle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="COTXE">Coche</SelectItem>
                <SelectItem value="MOTO">Moto</SelectItem>
                <SelectItem value="CARAVANA">Caravana</SelectItem>
                <SelectItem value="CAMIO">Camión</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div>
            <Label htmlFor="marca">Marca</Label>
            <Select onValueChange={(value) => handleFilterChange('marca', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar marca" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {marcas.map((marca) => (
                  <SelectItem key={marca} value={marca}>
                    {marca}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div>
            <Label htmlFor="model">Modelo</Label>
            <Input
              placeholder="Introduce el modelo"
              value={filters.model}
              onChange={(e) => handleFilterChange('model', e.target.value)}
            />
          </div>

          {/* Vehicle State */}
          <div>
            <Label htmlFor="estat-vehicle">Estado</Label>
            <Select onValueChange={(value) => handleFilterChange('estatVehicle', value)}>
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

          {/* Fuel Type */}
          <div>
            <Label htmlFor="combustible">Combustible</Label>
            <Select onValueChange={(value) => handleFilterChange('tipusCombustible', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de combustible" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                <SelectItem value="Benzina">Gasolina</SelectItem>
                <SelectItem value="Gasoil">Diésel</SelectItem>
                <SelectItem value="Elèctric">Eléctrico</SelectItem>
                <SelectItem value="Híbrid">Híbrido</SelectItem>
                <SelectItem value="GLP">GLP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="any-min">Año desde</Label>
              <Input
                placeholder="2020"
                type="number"
                value={filters.anyMin}
                onChange={(e) => handleFilterChange('anyMin', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="any-max">Año hasta</Label>
              <Input
                placeholder="2024"
                type="number"
                value={filters.anyMax}
                onChange={(e) => handleFilterChange('anyMax', e.target.value)}
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preu-min">Precio desde (€)</Label>
              <Input
                placeholder="10.000"
                type="number"
                value={filters.preuMin}
                onChange={(e) => handleFilterChange('preuMin', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="preu-max">Precio hasta (€)</Label>
              <Input
                placeholder="50.000"
                type="number"
                value={filters.preuMax}
                onChange={(e) => handleFilterChange('preuMax', e.target.value)}
              />
            </div>
          </div>

          {/* Mileage */}
          <div>
            <Label htmlFor="quilometratge">Kilometraje máximo</Label>
            <Input
              placeholder="100.000"
              type="number"
              value={filters.quilometratgeMax}
              onChange={(e) => handleFilterChange('quilometratgeMax', e.target.value)}
            />
          </div>

          {/* Color */}
          <div>
            <Label htmlFor="color">Color</Label>
            <Select onValueChange={(value) => handleFilterChange('colorVehicle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar color" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {colores.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Featured Only */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="destacats"
              checked={filters.destacats}
              onCheckedChange={(checked) => handleFilterChange('destacats', checked as boolean)}
            />
            <Label htmlFor="destacats" className="text-sm">
              Solo vehículos destacados
            </Label>
          </div>

          <div className="pt-4">
            <Button className="w-full bg-primary hover:bg-secondary">
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleFilters;

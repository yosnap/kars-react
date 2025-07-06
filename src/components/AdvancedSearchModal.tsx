import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { axiosAdmin } from "../api/axiosClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import YearRangeFilter from "./filters/YearRangeFilter";
import PriceRangeFilter from "./filters/PriceRangeFilter";
import MileageFilter from "./filters/MileageFilter";
import PowerFilter from "./filters/PowerFilter";
import BasicVehicleFilters from "./filters/BasicVehicleFilters";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  facets?: Record<string, Record<string, number>>;
  onFacetsUpdate?: (facets: Record<string, Record<string, number>>) => void;
}

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
  colorTapiceria: string;
  destacat: boolean;
}

const initialFilterState: FilterState = {
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
  colorTapiceria: "",
  destacat: false,
};

const filterKeyMap: Record<string, string> = {
  tipusVehicle: "tipus-vehicle",
  marcaCotxe: "marques-cotxe",
  modelCotxe: "models-cotxe",
  marcaMoto: "marques-moto",
  modelMoto: "models-moto",
  estatVehicle: "estat-vehicle",
  tipusCombustible: "tipus-combustible",
  tipusPropulsor: "tipus-propulsor",
  tipusCanvi: "tipus-canvi",
  anyMin: "anyMin",
  anyMax: "anyMax",
  preuMin: "preuMin",
  preuMax: "preuMax",
  quilometratgeMax: "quilometratgeMax",
  potenciaMin: "potenciaMin",
  potenciaMax: "potenciaMax",
  colorVehicle: "color-vehicle",
  colorTapiceria: "color-tapiceria",
  destacat: "destacats",
};

const filterValueMap = (key: string, value: string | boolean) => {
  if (typeof value !== "string") return value;
  if (key === "tipusVehicle") {
    switch (value) {
      case "COTXE": return "cotxe";
      case "MOTO": return "moto-quad-atv";
      case "CARAVANA": return "autocaravana-camper";
      case "VEHICLE COMERCIAL": return "vehicle-comercial";
      default: return value.toLowerCase();
    }
  }
  return value;
};

const getFilterLabel = (key: string, value: string | boolean): string => {
  if (key === "tipusVehicle") {
    switch (value) {
      case "COTXE": return "Coche";
      case "MOTO": return "Moto";
      case "CARAVANA": return "Caravana";
      case "VEHICLE COMERCIAL": return "Camión";
      default: return value as string;
    }
  }
  if (key === "tipusCombustible") return `Combustible: ${value}`;
  if (key === "tipusPropulsor") return `Propulsor: ${value}`;
  if (key === "tipusCanvi") return `Cambio: ${value}`;
  if (key === "marcaCotxe" || key === "marcaMoto") return `Marca: ${value}`;
  if (key === "modelCotxe" || key === "modelMoto") return `Modelo: ${value}`;
  if (key === "estatVehicle") return `Estado: ${value}`;
  if (key === "colorVehicle") return `Color: ${value}`;
  if (key === "colorTapiceria") return `Tapicería: ${value}`;
  if (key === "destacat") return "Destacados";
  if (key === "anyMin" || key === "anyMax") return "";
  if (key === "preuMin" || key === "preuMax") return "";
  if (key === "quilometratgeMax") return "";
  if (key === "potenciaMin" || key === "potenciaMax") return "";
  return value as string;
};

function hasStringValue(obj: unknown): obj is { value: string } {
  return typeof obj === 'object' && obj !== null && 'value' in obj && typeof (obj as { value: unknown }).value === 'string';
}

const mapVehicleCounts = (raw: Record<string, number>) => ({
  COTXE: raw.COTXE || 0,
  MOTO: raw.MOTO || 0,
  CARAVANA: raw.AUTOCARAVANA || 0,
  'VEHICLE COMERCIAL': raw['VEHICLE COMERCIAL'] || 0,
});

const AdvancedSearchModal = ({ isOpen, onOpenChange, facets = {}, onFacetsUpdate }: AdvancedSearchModalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024]);
  const [mileageMax, setMileageMax] = useState<[number, number]>([0, 300000]);
  const [powerRange, setPowerRange] = useState<[number, number]>([0, 800]);
  const [modelos, setModelos] = useState<{ nombre: string; count: number }[]>([]);
  const [estados, setEstados] = useState<string[]>([]);
  const [combustibles, setCombustibles] = useState<string[]>([]);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [localFacets, setLocalFacets] = useState<Record<string, Record<string, number>>>(facets);
  const [globalFacets, setGlobalFacets] = useState<Record<string, Record<string, number>>>(facets);
  const [vehicleTypeCounts, setVehicleTypeCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  useEffect(() => {
    axiosAdmin.get("/estat-vehicle").then((res) => {
      setEstados(Array.isArray(res.data.data) ? res.data.data : []);
    }).catch(() => setEstados([]));
    axiosAdmin.get("/tipus-combustible").then((res) => {
      setCombustibles(Array.isArray(res.data.data) ? res.data.data : []);
    }).catch(() => setCombustibles([]));
  }, []);

  useEffect(() => {
    // Limpiar modelos y selecciones cuando cambia el tipo de vehículo
    setModelos([]);
    setFilters(prev => ({ ...prev, marcaCotxe: "", modelCotxe: "", marcaMoto: "", modelMoto: "" }));
  }, [filters.tipusVehicle]);

  useEffect(() => {
    let marca = "";
    let endpoint = "";
    let marcaParam = "";
    const tipusVehicleParam = filterValueMap("tipusVehicle", filters.tipusVehicle);

    if (filters.tipusVehicle === "COTXE" && filters.marcaCotxe) {
      marca = filters.marcaCotxe;
      marcaParam = "marques-cotxe";
    } else if (filters.tipusVehicle === "CARAVANA" && filters.marcaCotxe) {
      marca = filters.marcaCotxe;
      marcaParam = "marques-autocaravana";
    } else if (filters.tipusVehicle === "VEHICLE COMERCIAL" && filters.marcaCotxe) {
      marca = filters.marcaCotxe;
      marcaParam = "marques-comercial";
    } else if (filters.tipusVehicle === "MOTO" && filters.marcaMoto) {
      marca = filters.marcaMoto;
      marcaParam = "marques-moto";
    }

    if (marca && marcaParam && tipusVehicleParam) {
      endpoint = `/vehicles?anunci-actiu=true&tipus-vehicle=${tipusVehicleParam}&${marcaParam}=${encodeURIComponent(marca)}`;
      axiosAdmin.get(endpoint).then((res) => {
        let modelosFacet = {};
        if (filters.tipusVehicle === "COTXE") modelosFacet = res.data.facets["models-cotxe"] || {};
        else if (filters.tipusVehicle === "CARAVANA") modelosFacet = res.data.facets["models-autocaravana"] || {};
        else if (filters.tipusVehicle === "VEHICLE COMERCIAL") modelosFacet = res.data.facets["models-comercial"] || {};
        else if (filters.tipusVehicle === "MOTO") modelosFacet = res.data.facets["models-moto"] || {};

        const modelosData = Object.entries(modelosFacet)
          .filter(([nombre, count]) => typeof nombre === "string" && nombre.trim() !== "" && typeof count === "number" && count > 0)
          .map(([nombre, count]) => ({ nombre, count: Number(count) }));

        setModelos(modelosData);
      }).catch(() => setModelos([]));
    } else {
      setModelos([]);
    }
    // Limpiar modelo seleccionado si cambia la marca
    if (["COTXE", "CARAVANA", "VEHICLE COMERCIAL"].includes(filters.tipusVehicle)) setFilters(prev => ({ ...prev, modelCotxe: "" }));
    if (filters.tipusVehicle === "MOTO") setFilters(prev => ({ ...prev, modelMoto: "" }));
  }, [filters.tipusVehicle, filters.marcaCotxe, filters.marcaMoto]);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      preuMin: priceRange[0].toString(),
      preuMax: priceRange[1].toString(),
      anyMin: yearRange[0].toString(),
      anyMax: yearRange[1].toString(),
      quilometratgeMax: mileageMax[1].toString(),
      potenciaMin: powerRange[0].toString(),
      potenciaMax: powerRange[1].toString(),
    }));
  }, [priceRange, yearRange, mileageMax, powerRange]);

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    console.log("Filter change:", key, "=", value);
    setFilters(prev => ({ ...prev, [key]: value }));
    setDirtyFields(prev => new Set(prev).add(key));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    dirtyFields.forEach((key) => {
      const apiKey = filterKeyMap[key] || key;
      const value = filters[key as keyof FilterState];
      let apiValue = filterValueMap(key, value);
      if (hasStringValue(apiValue)) {
        apiValue = apiValue.value;
      }
      if (typeof apiValue === "boolean") {
        if (apiValue) searchParams.append(apiKey, "1");
      } else if (apiValue && apiValue !== "") {
        searchParams.append(apiKey, apiValue);
      }
    });
    const queryString = searchParams.toString();
    const resultsUrl = queryString ? `/vehicles-andorra?${queryString}` : "/vehicles-andorra";
    navigate(resultsUrl);
    onOpenChange(false);
  };

  // Leer filtros desde la URL cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const searchParams = new URLSearchParams(location.search);
      const newFilters = { ...initialFilterState };
      const newDirtyFields = new Set<string>();
      
      // Mapeo inverso de los parámetros de URL a los estados del filtro
      const reverseFilterMap: Record<string, string> = {
        "tipus-vehicle": "tipusVehicle",
        "marques-cotxe": "marcaCotxe",
        "models-cotxe": "modelCotxe",
        "marques-moto": "marcaMoto",
        "models-moto": "modelMoto",
        "estat-vehicle": "estatVehicle",
        "tipus-combustible": "tipusCombustible",
        "tipus-propulsor": "tipusPropulsor",
        "tipus-canvi": "tipusCanvi",
        "anyMin": "anyMin",
        "anyMax": "anyMax",
        "preuMin": "preuMin",
        "preuMax": "preuMax",
        "quilometratgeMax": "quilometratgeMax",
        "potenciaMin": "potenciaMin",
        "potenciaMax": "potenciaMax",
        "color-vehicle": "colorVehicle",
        "color-tapiceria": "colorTapiceria",
        "destacats": "destacat"
      };
      
      // Mapeo inverso de valores
      const reverseValueMap = (key: string, value: string): string => {
        if (key === "tipus-vehicle") {
          switch (value) {
            case "cotxe": return "COTXE";
            case "moto-quad-atv": return "MOTO";
            case "autocaravana-camper": return "CARAVANA";
            case "vehicle-comercial": return "VEHICLE COMERCIAL";
            default: return value.toUpperCase();
          }
        }
        return value;
      };
      
      // Procesar parámetros de la URL
      searchParams.forEach((value, key) => {
        const filterKey = reverseFilterMap[key];
        if (filterKey) {
          const mappedValue = reverseValueMap(key, value);
          if (filterKey === "destacat") {
            newFilters[filterKey] = value === "1";
          } else {
            newFilters[filterKey as keyof FilterState] = mappedValue;
          }
          newDirtyFields.add(filterKey);
        }
      });
      
      // Actualizar rangos si están en la URL
      if (newFilters.anyMin || newFilters.anyMax) {
        setYearRange([
          parseInt(newFilters.anyMin) || 2000,
          parseInt(newFilters.anyMax) || 2024
        ]);
      }
      if (newFilters.preuMin || newFilters.preuMax) {
        setPriceRange([
          parseInt(newFilters.preuMin) || 0,
          parseInt(newFilters.preuMax) || 100000
        ]);
      }
      if (newFilters.quilometratgeMax) {
        setMileageMax([
          0,
          parseInt(newFilters.quilometratgeMax) || 300000
        ]);
      }
      if (newFilters.potenciaMin || newFilters.potenciaMax) {
        setPowerRange([
          parseInt(newFilters.potenciaMin) || 0,
          parseInt(newFilters.potenciaMax) || 800
        ]);
      }
      
      setFilters(newFilters);
      setDirtyFields(newDirtyFields);
    }
  }, [isOpen, location.search]);

  useEffect(() => {
    if (!isOpen) {
      // No limpiar dirtyFields al cerrar para mantener los filtros
    } else if (Object.keys(vehicleTypeCounts).length === 0 && !isLoadingCounts) {
      // Solo cargar contadores de tipos de vehículo si no los tenemos
      setIsLoadingCounts(true);
      axiosAdmin.get("/vehicles", { 
        params: { 
          "anunci-actiu": true, 
          per_page: 1
        } 
      })
        .then(res => {
          const allFacets = res.data.facets || {};
          const counts = mapVehicleCounts(allFacets["tipus-vehicle"] || {});
          setVehicleTypeCounts(counts);
          setGlobalFacets(allFacets);
          setLocalFacets(allFacets);
          setIsLoadingCounts(false);
        })
        .catch(() => {
          setGlobalFacets({});
          setLocalFacets({});
          setIsLoadingCounts(false);
        });
    }
  }, [isOpen, vehicleTypeCounts, isLoadingCounts]);

  // Recargar facets cuando cambie el tipo de vehículo
  useEffect(() => {
    if (filters.tipusVehicle && isOpen) {
      const vehicleTypeParam = filterValueMap("tipusVehicle", filters.tipusVehicle);
      axiosAdmin.get("/vehicles", { 
        params: { 
          "anunci-actiu": true, 
          per_page: 1,
          "tipus-vehicle": vehicleTypeParam
        } 
      })
        .then(res => {
          const newFacets = res.data.facets || {};
          setLocalFacets(newFacets);
          if (onFacetsUpdate) {
            onFacetsUpdate(newFacets);
          }
        })
        .catch(() => setLocalFacets({}));
    }
  }, [filters.tipusVehicle, isOpen, onFacetsUpdate]);

  // Devuelve un array de objetos { nombre, count } para las marcas
  const getFilteredMarcasWithCount = () => {
    let marcas: { nombre: string; count: number }[] = [];
    if (["COTXE"].includes(filters.tipusVehicle)) {
      // Coches: leer de marques-cotxe
      const marcasCotxe = localFacets["marques-cotxe"] || {};
      marcas = Object.entries(marcasCotxe)
        .filter(([nombre, count]) =>
          typeof nombre === "string" &&
          nombre.trim() !== "" &&
          nombre !== "[object Object]" &&
          /^[a-zA-Z0-9À-ÿ .'-]+$/.test(nombre) &&
          typeof count === "number" &&
          count > 0
        )
        .map(([nombre, count]) => ({ nombre, count }));
    } else if (filters.tipusVehicle === "CARAVANA") {
      // Caravanas/autocaravanas: leer de marques-autocaravana
      const marcasAuto = localFacets["marques-autocaravana"] || {};
      marcas = Object.entries(marcasAuto)
        .filter(([nombre, count]) =>
          typeof nombre === "string" &&
          nombre.trim() !== "" &&
          nombre !== "[object Object]" &&
          /^[a-zA-Z0-9À-ÿ .'-]+$/.test(nombre) &&
          typeof count === "number" &&
          count > 0
        )
        .map(([nombre, count]) => ({ nombre, count }));
    } else if (filters.tipusVehicle === "MOTO") {
      // Motos: leer de marques-moto
      const marcasMoto = localFacets["marques-moto"] || {};
      marcas = Object.entries(marcasMoto)
        .filter(([nombre, count]) =>
          typeof nombre === "string" &&
          nombre.trim() !== "" &&
          nombre !== "[object Object]" &&
          /^[a-zA-Z0-9À-ÿ .'-]+$/.test(nombre) &&
          typeof count === "number" &&
          count > 0
        )
        .map(([nombre, count]) => ({ nombre, count }));
    } else if (filters.tipusVehicle === "VEHICLE COMERCIAL") {
      // Comerciales: leer de marques-comercial
      const marcasComercial = localFacets["marques-comercial"] || {};
      marcas = Object.entries(marcasComercial)
        .filter(([nombre, count]) =>
          typeof nombre === "string" &&
          nombre.trim() !== "" &&
          nombre !== "[object Object]" &&
          /^[a-zA-Z0-9À-ÿ .'-]+$/.test(nombre) &&
          typeof count === "number" &&
          count > 0
        )
        .map(([nombre, count]) => ({ nombre, count }));
    }
    // Elimina duplicados por nombre
    return marcas.filter((m, i, arr) => arr.findIndex(x => x.nombre === m.nombre) === i);
  };

  // Función para obtener los modelos filtrados y con count según el tipo de vehículo
  const getFilteredModelosWithCount = () => {
    // Si hay una marca seleccionada, usar los modelos cargados dinámicamente
    if ((filters.marcaCotxe || filters.marcaMoto) && modelos.length > 0) {
      return modelos;
    }
    
    // Si no hay marca seleccionada, devolver array vacío
    return [];
  };

  // Obtener filtros activos para mostrar en badges
  const getActiveFilters = () => {
    const active: { key: string; label: string }[] = [];
    
    dirtyFields.forEach((key) => {
      const value = filters[key as keyof FilterState];
      if (value && value !== "" && value !== false) {
        const label = getFilterLabel(key, value);
        if (label) {
          active.push({ key, label });
        }
      }
    });
    
    // Agregar rangos si están modificados
    if (dirtyFields.has("anyMin") || dirtyFields.has("anyMax")) {
      active.push({ key: "year", label: `Año: ${yearRange[0]}-${yearRange[1]}` });
    }
    if (dirtyFields.has("preuMin") || dirtyFields.has("preuMax")) {
      active.push({ key: "price", label: `Precio: ${priceRange[0]}€-${priceRange[1]}€` });
    }
    if (dirtyFields.has("quilometratgeMax")) {
      active.push({ key: "mileage", label: `Km máx: ${mileageMax[1]}` });
    }
    if (dirtyFields.has("potenciaMin") || dirtyFields.has("potenciaMax")) {
      active.push({ key: "power", label: `Potencia: ${powerRange[0]}-${powerRange[1]}CV` });
    }
    
    return active;
  };
  
  const handleRemoveFilter = (filterKey: string) => {
    if (filterKey === "year") {
      setYearRange([2000, 2024]);
      setDirtyFields(prev => {
        const newSet = new Set(prev);
        newSet.delete("anyMin");
        newSet.delete("anyMax");
        return newSet;
      });
    } else if (filterKey === "price") {
      setPriceRange([0, 100000]);
      setDirtyFields(prev => {
        const newSet = new Set(prev);
        newSet.delete("preuMin");
        newSet.delete("preuMax");
        return newSet;
      });
    } else if (filterKey === "mileage") {
      setMileageMax([0, 300000]);
      setDirtyFields(prev => {
        const newSet = new Set(prev);
        newSet.delete("quilometratgeMax");
        return newSet;
      });
    } else if (filterKey === "power") {
      setPowerRange([0, 800]);
      setDirtyFields(prev => {
        const newSet = new Set(prev);
        newSet.delete("potenciaMin");
        newSet.delete("potenciaMax");
        return newSet;
      });
    } else {
      setFilters(prev => ({ ...prev, [filterKey]: initialFilterState[filterKey as keyof FilterState] }));
      setDirtyFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(filterKey);
        return newSet;
      });
    }
  };
  
  const handleClearAll = () => {
    setFilters(initialFilterState);
    setPriceRange([0, 100000]);
    setYearRange([2000, 2024]);
    setMileageMax([0, 300000]);
    setPowerRange([0, 800]);
    setDirtyFields(new Set());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <div className="p-6 pb-2 space-y-4">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Búsqueda Avanzada
            </DialogTitle>
            <DialogDescription className="sr-only">
              Utiliza los filtros avanzados para encontrar el vehículo que buscas
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {/* Filtros activos */}
          {getActiveFilters().length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Filtros activos:</span>
              {getActiveFilters().map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleRemoveFilter(filter.key)}
                >
                  {filter.label}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs"
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </div>
        <form onSubmit={handleApply} className="flex-1 overflow-y-auto px-6 pb-20 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter w-5 h-5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                Filtros de Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(() => {
                const modelosWithCount = getFilteredModelosWithCount();
                return (
                  <BasicVehicleFilters
                    key={`${filters.tipusVehicle}-${filters.marcaCotxe}-${filters.marcaMoto}-${modelosWithCount.length}`}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    marcas={getFilteredMarcasWithCount()}
                    modelos={modelosWithCount}
                    estados={estados}
                    combustibles={combustibles}
                    tipusVehicleCounts={vehicleTypeCounts}
                  />
                );
              })()}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-6 pt-6">
              <YearRangeFilter yearRange={yearRange} onYearRangeChange={val => setYearRange([val[0], val[1]])} />
              <PriceRangeFilter priceRange={priceRange} onPriceRangeChange={val => setPriceRange([val[0], val[1]])} />
              <MileageFilter mileageMax={mileageMax} onMileageMaxChange={val => setMileageMax([val[0], val[1] ?? val[0]])} />
              <PowerFilter powerRange={powerRange} onPowerRangeChange={val => setPowerRange([val[0], val[1]])} />
            </CardContent>
          </Card>
        </form>
        
        {/* Botones fijos en la parte inferior */}
        <div className="absolute bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApply} variant="default">
              Aplicar filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearchModal;

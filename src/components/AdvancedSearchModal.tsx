import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialState = {
  search: "",
  tipusVehicle: "",
  marca: "",
  model: "",
  estatVehicle: "",
  tipusCombustible: "",
  tipusPropulsor: "",
  tipusCanvi: "",
  anyMin: "",
  anyMax: "",
  preuMin: "",
  preuMax: "",
  quilometratgeMin: "",
  quilometratgeMax: "",
  potenciaMin: "",
  potenciaMax: "",
  colorVehicle: "",
  colorTapiceria: "",
  destacat: false,
};

const marcasPorTipo: Record<string, string[]> = {
  cotxe: ["Audi", "BMW", "Citroën", "Ford", "Mercedes", "Peugeot", "Renault", "Seat", "Volkswagen"],
  "moto-quad-atv": ["Honda", "Yamaha", "Kawasaki", "Suzuki"],
  "autocaravana-camper": ["Fiat", "Ford", "Peugeot"],
  "vehicle-comercial": ["Iveco", "Mercedes", "Renault"],
};

const modelsPorMarca: Record<string, string[]> = {
  Audi: ["A1", "A3", "A4", "Q5"],
  BMW: ["Serie 1", "Serie 3", "X1", "X5"],
  Ford: ["Fiesta", "Focus", "Kuga"],
  Mercedes: ["Clase A", "Clase C", "GLA"],
  Peugeot: ["208", "308", "3008"],
  Renault: ["Clio", "Megane", "Captur"],
  Seat: ["Ibiza", "León", "Ateca"],
  Volkswagen: ["Golf", "Polo", "Tiguan"],
  // ...otros
};

const estados = ["Nuevo", "Seminuevo", "Ocasión", "Km0", "Clásico"];
const combustibles = ["Gasolina", "Diésel", "Eléctrico", "Híbrido", "GLP", "GNC"];
const propulsores = ["Delantera", "Trasera", "4x4"];
const cambios = ["Manual", "Automático", "CVT"];
const colores = ["Blanco", "Negro", "Gris", "Rojo", "Azul", "Verde", "Amarillo", "Marrón", "Beige", "Naranja"];
const coloresTapiceria = ["Negro", "Gris", "Beige", "Rojo", "Azul", "Marrón", "Blanco"];

const AdvancedSearchModal = ({ isOpen, onOpenChange }: AdvancedSearchModalProps) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialState);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [modelos, setModelos] = useState<string[]>([]);

  // Actualiza marcas según tipo de vehículo
  useEffect(() => {
    if (filters.tipusVehicle && marcasPorTipo[filters.tipusVehicle]) {
      setMarcas(marcasPorTipo[filters.tipusVehicle]);
    } else {
      setMarcas([]);
    }
    setFilters((prev) => ({ ...prev, marca: "", model: "" }));
    setModelos([]);
  }, [filters.tipusVehicle]);

  // Actualiza modelos según marca
  useEffect(() => {
    if (filters.marca && modelsPorMarca[filters.marca]) {
      setModelos(modelsPorMarca[filters.marca]);
    } else {
      setModelos([]);
    }
    setFilters((prev) => ({ ...prev, model: "" }));
  }, [filters.marca]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) searchParams.append(key, "1");
      } else if (value && value !== "") {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    const resultsUrl = queryString ? `/resultados?${queryString}` : "/resultados";
    navigate(resultsUrl);
    onOpenChange(false);
  };

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
        <form onSubmit={handleApply} className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Búsqueda por texto */}
          <div>
            <label className="block text-sm font-medium mb-1">Buscar</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Marca, modelo, palabra clave..."
            />
          </div>
          {/* Tipo de vehículo */}
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de vehículo</label>
            <select
              name="tipusVehicle"
              value={filters.tipusVehicle}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="cotxe">Coche</option>
              <option value="moto-quad-atv">Moto</option>
              <option value="autocaravana-camper">Autocaravana</option>
              <option value="vehicle-comercial">Vehículo comercial</option>
            </select>
          </div>
          {/* Marca */}
          <div>
            <label className="block text-sm font-medium mb-1">Marca</label>
            <select
              name="marca"
              value={filters.marca}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={!marcas.length}
            >
              <option value="">Todas</option>
              {marcas.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          {/* Modelo */}
          <div>
            <label className="block text-sm font-medium mb-1">Modelo</label>
            <select
              name="model"
              value={filters.model}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              disabled={!modelos.length}
            >
              <option value="">Todos</option>
              {modelos.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              name="estatVehicle"
              value={filters.estatVehicle}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {estados.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          {/* Tipo de combustible */}
          <div>
            <label className="block text-sm font-medium mb-1">Combustible</label>
            <select
              name="tipusCombustible"
              value={filters.tipusCombustible}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {combustibles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Tipo de propulsor */}
          <div>
            <label className="block text-sm font-medium mb-1">Propulsor</label>
            <select
              name="tipusPropulsor"
              value={filters.tipusPropulsor}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {propulsores.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          {/* Tipo de cambio */}
          <div>
            <label className="block text-sm font-medium mb-1">Cambio</label>
            <select
              name="tipusCanvi"
              value={filters.tipusCanvi}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {cambios.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Año (rango) */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Año desde</label>
              <input
                type="number"
                name="anyMin"
                value={filters.anyMin}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="1900"
                max="2100"
                placeholder="Mín"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Año hasta</label>
              <input
                type="number"
                name="anyMax"
                value={filters.anyMax}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="1900"
                max="2100"
                placeholder="Máx"
              />
            </div>
          </div>
          {/* Precio (rango) */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Precio desde (€)</label>
              <input
                type="number"
                name="preuMin"
                value={filters.preuMin}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                placeholder="Mín"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Precio hasta (€)</label>
              <input
                type="number"
                name="preuMax"
                value={filters.preuMax}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                placeholder="Máx"
              />
            </div>
          </div>
          {/* Kilómetros (rango) */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Kilómetros desde</label>
              <input
                type="number"
                name="quilometratgeMin"
                value={filters.quilometratgeMin}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                placeholder="Mín"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Kilómetros hasta</label>
              <input
                type="number"
                name="quilometratgeMax"
                value={filters.quilometratgeMax}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                placeholder="Máx"
              />
            </div>
          </div>
          {/* Potencia (rango) */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Potencia desde (CV)</label>
              <input
                type="number"
                name="potenciaMin"
                value={filters.potenciaMin}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                placeholder="Mín"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Potencia hasta (CV)</label>
              <input
                type="number"
                name="potenciaMax"
                value={filters.potenciaMax}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                placeholder="Máx"
              />
            </div>
          </div>
          {/* Color de coche */}
          <div>
            <label className="block text-sm font-medium mb-1">Color de coche</label>
            <select
              name="colorVehicle"
              value={filters.colorVehicle}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {colores.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Color de tapicería */}
          <div>
            <label className="block text-sm font-medium mb-1">Color de tapicería</label>
            <select
              name="colorTapiceria"
              value={filters.colorTapiceria}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              {coloresTapiceria.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {/* Destacados */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="destacat"
              checked={filters.destacat}
              onChange={handleChange}
              id="destacat"
            />
            <label htmlFor="destacat" className="text-sm font-medium">Solo destacados</label>
          </div>
          {/* Botones */}
          <div className="flex gap-3 pt-2 border-t mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-secondary"
            >
              Buscar Vehículos
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSearchModal;

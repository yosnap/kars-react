import React, { useEffect, useState } from "react";

// Tipos para las opciones de los selects
interface Option {
  value: string;
  label: string;
}

// Props del componente
interface VehicleFiltersProps {
  initialFilters?: Record<string, string>;
  onApply: (filters: Record<string, string>) => void;
  lockedStateValue?: string;
}

// Filtros iniciales por defecto
const defaultFilters = {
  "tipus-vehicle": "",
  "marques-cotxe": "",
  "models-cotxe": "",
  "estat-vehicle": "",
  "tipus-combustible": "",
};

const VehicleFilters: React.FC<VehicleFiltersProps> = ({ initialFilters, onApply, lockedStateValue }) => {
  // Estado de los filtros
  const [filters, setFilters] = useState<Record<string, string>>({
    ...defaultFilters,
    ...initialFilters,
    ...(initialFilters && initialFilters["tipus-vehicle"]
      ? { "tipus-vehicle": initialFilters["tipus-vehicle"].toLowerCase() }
      : {}),
    ...(lockedStateValue ? { "estat-vehicle": lockedStateValue } : {}),
  });

  // Opciones dinámicas
  const [brands, setBrands] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [fuels, setFuels] = useState<Option[]>([]);

  const marcaSeleccionada = filters["marques-cotxe"];

  // Cargar estados y combustibles solo al montar el componente
  useEffect(() => {
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      const endpointEstados = "/estat-vehicle";
      const endpointCombustibles = "/tipus-combustible";
      // Load states
      axiosAdmin.get(endpointEstados)
        .then((res) => {
          let estados = Array.isArray(res.data.data) ? res.data.data : [];
          // Si es array de strings, mapear a { value, label }
          if (estados.length > 0 && typeof estados[0] === "string") {
            estados = estados.map((e: string) => ({ value: e, label: e }));
          } else if (estados.length > 0 && typeof estados[0] === "object") {
            // Usar label, o name, o value como label visible
            estados = estados.map((e: { value: string; label?: string; name?: string }) => ({ value: e.value, label: e.label || e.name || e.value }));
          }
          setStates(estados);
        })
        .catch(() => setStates([]));
      // Load fuels
      axiosAdmin.get(endpointCombustibles)
        .then((res) => {
          let combustibles = Array.isArray(res.data.data) ? res.data.data : [];
          if (combustibles.length > 0 && typeof combustibles[0] === "string") {
            combustibles = combustibles.map((c: string) => ({ value: c, label: c }));
          } else if (combustibles.length > 0 && typeof combustibles[0] === "object") {
            combustibles = combustibles.map((c: { value: string; label?: string; name?: string }) => ({ value: c.value, label: c.label || c.name || c.value }));
          }
          setFuels(combustibles);
        })
        .catch(() => setFuels([]));
    });
  }, []);

  // Cargar marcas al montar o cambiar tipo de vehículo
  useEffect(() => {
    import("../api/axiosClient").then(({ axiosAdmin }) => {
      // Para tipos distintos de moto, usar endpoint de coches
      const endpointMarcas = filters["tipus-vehicle"] === "moto"
        ? "/marques-moto"
        : "/marques-cotxe";
      axiosAdmin.get(endpointMarcas)
        .then((res) => {
          const marcas = Array.isArray(res.data.data) ? res.data.data : [];
          setBrands(marcas);
        })
        .catch(() => setBrands([]));
    });
  }, [filters["tipus-vehicle"]]);

  // Limpiar marca y modelo al cambiar el tipo de vehículo
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      "marques-cotxe": "",
      "models-cotxe": "",
    }));
  }, [filters["tipus-vehicle"]]);

  // Cargar modelos cuando cambia la marca
  useEffect(() => {
    if (marcaSeleccionada) {
      import("../api/axiosClient").then(({ axiosAdmin }) => {
        // Para tipos distintos de moto, usar endpoint de coches
        const endpointModelos = filters["tipus-vehicle"] === "moto"
          ? "/marques-moto?marca="
          : "/marques-cotxe?marca=";
        const url = `${endpointModelos}${marcaSeleccionada}`;
        axiosAdmin.get(url)
          .then((res) => {
            setModels(Array.isArray(res.data.data) ? res.data.data : []);
          })
          .catch(() => setModels([]));
      });
    } else {
      setModels([]);
    }
  }, [marcaSeleccionada, filters["tipus-vehicle"]]);

  // Sincroniza los filtros internos con los props cuando cambian
  useEffect(() => {
    setFilters((prev) => {
      const next = { ...prev };
      Object.entries(initialFilters || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== "") {
          if (k === "tipus-vehicle") {
            // Normaliza a 'moto-quad-atv' si es moto
            const vNorm = v.toLowerCase();
            if (vNorm === "moto" || vNorm === "moto-quad-atv") {
              next[k] = "moto-quad-atv";
            } else {
              next[k] = vNorm;
            }
          } else {
            next[k] = v;
          }
        }
      });
      if (!next["marques-cotxe"]) {
        next["models-cotxe"] = "";
      }
      // Si hay valor bloqueado, forzarlo siempre
      if (lockedStateValue) {
        next["estat-vehicle"] = lockedStateValue;
      }
      return next;
    });
  }, [initialFilters, lockedStateValue]);

  // Manejar cambios en los filtros
  const handleChange = (key: string, value: string) => {
    // Si el campo es 'estat-vehicle' y está bloqueado, ignorar cambios
    if (lockedStateValue && key === "estat-vehicle") return;
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "marques-cotxe" ? { "models-cotxe": "" } : {}),
    }));
  };

  // Aplicar filtros
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    // Excluir 'anunci-actiu' del UI, pero incluirlo si está en initialFilters
    const filtersToSend = { ...filters };
    if (initialFilters && initialFilters["anunci-actiu"] !== undefined) {
      filtersToSend["anunci-actiu"] = initialFilters["anunci-actiu"];
    } else {
      delete filtersToSend["anunci-actiu"];
    }
    onApply(filtersToSend);
  };

  return (
    <form onSubmit={handleApply} className="space-y-4">
      {/* Tipo de vehículo */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipo de vehículo</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={filters["tipus-vehicle"]}
          onChange={(e) => handleChange("tipus-vehicle", e.target.value)}
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
          className="w-full border rounded px-3 py-2"
          value={filters["marques-cotxe"]}
          onChange={(e) => handleChange("marques-cotxe", e.target.value)}
        >
          <option value="">Todas</option>
          {brands.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>
      </div>
      {/* Modelo */}
      <div>
        <label className="block text-sm font-medium mb-1">Modelo</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={filters["models-cotxe"]}
          onChange={(e) => handleChange("models-cotxe", e.target.value)}
          disabled={!filters["marques-cotxe"]}
        >
          <option value="">Todos</option>
          {models.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        {!filters["marques-cotxe"] && (
          <p className="text-xs text-gray-500 mt-1">
            Selecciona una marca para elegir el modelo
          </p>
        )}
      </div>
      {/* Estado */}
      <div>
        <label className="block text-sm font-medium mb-1">Estado</label>
        <select
          className="w-full border border-gray-300 bg-white text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={lockedStateValue !== undefined ? lockedStateValue : filters["estat-vehicle"]}
          onChange={(e) => handleChange("estat-vehicle", e.target.value)}
          disabled={lockedStateValue != null}
        >
          <option value="">Todos</option>
          {states.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      {/* Combustible */}
      <div>
        <label className="block text-sm font-medium mb-1">Combustible</label>
        <select
          className="w-full border border-gray-300 bg-white text-gray-900 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={filters["tipus-combustible"]}
          onChange={(e) => handleChange("tipus-combustible", e.target.value)}
        >
          <option value="">Todos</option>
          {fuels.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>
      {/* Botón aplicar */}
      <div>
        <button
          type="submit"
          className="w-full bg-primary hover:bg-secondary text-white px-4 py-2 rounded font-semibold transition-colors"
        >
          Aplicar filtros
        </button>
      </div>
    </form>
  );
};

export default VehicleFilters;
export { defaultFilters }; 
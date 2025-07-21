import React from "react";

interface FiltersSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    "tipus-vehicle": string;
    "marques-cotxe": string;
    "models-cotxe": string;
    "estat-vehicle": string;
    "tipus-combustible": string;
  };
  onFilterChange: (key: string, value: string) => void;
  brands: { value: string; label: string }[];
  models: { value: string; label: string }[];
  states: { value: string; label: string }[];
  fuels: { value: string; label: string }[];
  onApply: () => void;
}

const FiltersSidebar = ({
  isOpen,
  onOpenChange,
  filters,
  onFilterChange,
  brands,
  models,
  states,
  fuels,
  onApply,
}: FiltersSidebarProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <aside className="relative w-[400px] sm:w-[540px] bg-[#13182B] shadow-lg h-full overflow-y-auto p-6 rounded-xl">
        <button
          className="absolute top-4 left-4 text-orange-500 bg-[#23273C] rounded p-1 hover:bg-orange-100"
          onClick={() => onOpenChange(false)}
        >
          ✖
        </button>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Cercador de vehicles</h2>
          <div className="flex justify-center mb-8">
            <button
              className={`px-6 py-2 rounded-l-full font-semibold ${filters["tipus-vehicle"] === "cotxe" ? "bg-orange-500 text-white" : "bg-white text-[#23273C]"}`}
              onClick={() => onFilterChange("tipus-vehicle", "cotxe")}
              type="button"
            >
              Coches
            </button>
            <button
              className={`px-6 py-2 font-semibold border-l border-gray-200 ${filters["tipus-vehicle"] === "moto-quad-atv" ? "bg-orange-500 text-white" : "bg-white text-[#23273C]"}`}
              onClick={() => onFilterChange("tipus-vehicle", "moto-quad-atv")}
              type="button"
            >
              Motos
            </button>
            <button
              className={`px-6 py-2 font-semibold border-l border-gray-200 ${filters["tipus-vehicle"] === "autocaravana-camper" ? "bg-orange-500 text-white" : "bg-white text-[#23273C]"}`}
              onClick={() => onFilterChange("tipus-vehicle", "autocaravana-camper")}
              type="button"
            >
              Caravanas
            </button>
            <button
              className={`px-6 py-2 rounded-r-full font-semibold border-l border-gray-200 ${filters["tipus-vehicle"] === "vehicle-comercial" ? "bg-orange-500 text-white" : "bg-white text-[#23273C]"}`}
              onClick={() => onFilterChange("tipus-vehicle", "vehicle-comercial")}
              type="button"
            >
              Comerciales
            </button>
          </div>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onApply();
          }}
          className="flex flex-col gap-4"
        >
          {/* Marca */}
          <select
            className="rounded-full px-6 py-3 text-white text-base font-medium focus:outline-none border border-gray-200 bg-[#23273C]"
            value={filters["marques-cotxe"]}
            onChange={e => onFilterChange("marques-cotxe", e.target.value)}
          >
            <option value="">Marca del cotxe</option>
            {brands.map((marca) => (
              <option key={marca.value} value={marca.value}>{marca.label}</option>
            ))}
          </select>
          {/* Modelo */}
          <select
            className="rounded-full px-6 py-3 text-white text-base font-medium focus:outline-none border border-gray-200 bg-[#23273C]"
            value={filters["models-cotxe"]}
            onChange={e => onFilterChange("models-cotxe", e.target.value)}
            disabled={!filters["marques-cotxe"]}
          >
            <option value="">Modelo del cotxe</option>
            {models.map((modelo) => (
              <option key={modelo.value} value={modelo.value}>{modelo.label}</option>
            ))}
          </select>
          {/* Estado */}
          <select
            className="rounded-full px-6 py-3 text-white text-base font-medium focus:outline-none border border-gray-200 bg-[#23273C]"
            value={filters["estat-vehicle"]}
            onChange={e => onFilterChange("estat-vehicle", e.target.value)}
          >
            <option value="">Estat</option>
            {states.map((estat) => (
              <option key={estat.value} value={estat.value}>{estat.label}</option>
            ))}
          </select>
          {/* Combustible */}
          <select
            className="rounded-full px-6 py-3 text-white text-base font-medium focus:outline-none border border-gray-200 bg-[#23273C]"
            value={filters["tipus-combustible"]}
            onChange={e => onFilterChange("tipus-combustible", e.target.value)}
          >
            <option value="">Combustible</option>
            {fuels.map((fuel) => (
              <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg py-3 px-8 transition-colors"
          >
            Cercar cotxes
          </button>
        </form>
      </aside>
    </div>
  );
};

export default FiltersSidebar; 
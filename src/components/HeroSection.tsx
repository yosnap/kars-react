import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  onSearch?: (query: { vehicleType: string; searchTerm: string }) => void;
}

const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const navigate = useNavigate();

  // Lógica de búsqueda y navegación
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onSearch) {
      onSearch({ vehicleType, searchTerm });
    } else {
      const params = new URLSearchParams();
      if (vehicleType) params.append("tipus-vehicle", vehicleType);
      if (searchTerm) params.append("search", searchTerm);
      navigate(`/vehicles-andorra?${params.toString()}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-tertiary via-gray-800 to-tertiary py-20">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        style={{
          backgroundImage:
            "url('https://mleit2tjtjbm.i.optimole.com/cb:vQTk.4fa58/w:auto/h:auto/q:mauto/id:231b75b36f569f927db6856fb5e23729/https://motoraldia.net/compra-venda-de-vehicles-a-Andorra-slider.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Encuentra tu <span className="text-primary">vehículo perfecto</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Miles de vehículos nuevos y de ocasión te esperan. Profesionales verificados y particulares con las mejores ofertas.
        </p>
        {/* Search Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <select
                  onChange={e => setVehicleType(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  value={vehicleType}
                >
                  <option value="">Tipo de vehículo</option>
                  <option value="cotxe">Coches</option>
                  <option value="moto-quad-atv">Motos</option>
                  <option value="autocaravana-camper">Caravanas</option>
                  <option value="vehicle-comercial">Vehículos comerciales</option>
                </select>
              </div>
              <div className="md:col-span-1 col-span-2">
                <input
                  placeholder="Busca por marca, modelo, año, combustible, descripción, etc."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-1">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-secondary text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {/* SVG search icon */}
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Buscar
                </button>
              </div>
            </div>
          </form>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-white">
          <div>
            <div className="text-3xl font-bold text-primary">12.500+</div>
            <div className="text-sm opacity-90">Vehículos disponibles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">850+</div>
            <div className="text-sm opacity-90">Profesionales</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">25.000+</div>
            <div className="text-sm opacity-90">Usuarios registrados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">98%</div>
            <div className="text-sm opacity-90">Satisfacción</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 
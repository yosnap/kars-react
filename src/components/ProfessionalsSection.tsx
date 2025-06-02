import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { axiosAdmin } from "../api/axiosClient";

interface Professional {
  id: number | string;
  name?: string;
  "nom-empresa"?: string;
  role?: string;
  active_vehicles?: number;
}

const ProfessionalsSection = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Estado para los logos individuales
  const [logos, setLogos] = useState<Record<string, string>>(/* id -> url */ {});
  const [loadingLogos, setLoadingLogos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    axiosAdmin.get("/sellers")
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data?.items) ? res.data.items : []);
        // Filtrar solo profesionales
        setProfessionals(data.filter((p: Professional) => p.role === "professional"));
      })
      .catch(() => setError("Error al cargar profesionales"))
      .finally(() => setLoading(false));
  }, []);

  // Carga individual de logos
  useEffect(() => {
    professionals.forEach((professional) => {
      const id = String(professional.id);
      if (logos[id] || loadingLogos[id]) return; // Ya cargado o en proceso
      setLoadingLogos(prev => ({ ...prev, [id]: true }));
      axiosAdmin.get(`/sellers?user_id=${id}`)
        .then(res => {
          let seller = null;
          if (Array.isArray(res.data?.data)) {
            seller = res.data.data.length > 0 ? res.data.data[0] : null;
          } else if (res.data?.data && typeof res.data.data === 'object') {
            seller = res.data.data;
          }
          const logo = seller?.["logo-empresa-home"] || seller?.["logo-empresa"] || "";
          if (logo) {
            setLogos(prev => ({ ...prev, [id]: logo }));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingLogos(prev => ({ ...prev, [id]: false })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionals]);

  return (
    <section className="py-12 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="bg-white/80 rounded-lg shadow p-6 border border-primary/10">
          <h2 className="text-2xl font-bold text-primary mb-2">Professionals</h2>
          <p className="text-gray-700 mb-6">Concesionarios y profesionales de confianza</p>
          {loading && <div>Cargando profesionales...</div>}
          {error && <div className="text-red-600">{error}</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {professionals.map((professional) => {
              const id = String(professional.id);
              const name = professional["nom-empresa"] || professional.name || "";
              const logo = logos[id] || "";
              const isLoadingLogo = loadingLogos[id];
              return (
                <Link
                  to={`/professional/${professional.id}`}
                  key={professional.id}
                  className="flex flex-col items-center text-center group cursor-pointer bg-white/90 border border-primary/20 rounded-2xl shadow-sm hover:shadow-lg hover:bg-primary/10 hover:border-primary transition-all p-4"
                  style={{ minHeight: 140 }}
                >
                  <Avatar className="w-16 h-16 mb-3 bg-gray-100 group-hover:bg-primary/10 border border-primary/10 group-hover:border-primary transition-colors">
                    {isLoadingLogo ? (
                      <span className="w-full h-full flex items-center justify-center animate-pulse text-xs text-gray-400">Cargando...</span>
                    ) : logo ? (
                      <AvatarImage src={logo} alt={name} className="object-contain" />
                    ) : (
                      <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    )}
                  </Avatar>
                  <h3 className="text-sm font-medium text-primary group-hover:underline transition-colors">
                    {name}
                  </h3>
                  {typeof professional.active_vehicles === 'number' && professional.active_vehicles > 0 && (
                    <span className="text-xs text-primary mt-1">{professional.active_vehicles} vehículos</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalsSection; 
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { axiosAdmin } from "../api/axiosClient";

interface Professional {
  id: number | string;
  name?: string;
  company?: string;
  role?: string;
  vehicleCount?: number;
  avatar?: string;
  logoEmpresa?: string;
  logoEmpresaHome?: string;
}

const ProfessionalsSection = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    
    axiosAdmin.get("/sellers?limit=50")
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data?.items) ? res.data.items : []);
        setProfessionals(data);
      })
      .catch(() => {
        setError("Error al cargar profesionales");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 bg-primary/5">
      <div className="container mx-auto">
        <div className="bg-white/80 rounded-lg shadow p-6 border border-primary/10">
          <h2 className="text-2xl font-bold text-primary mb-2">Professionals</h2>
          <p className="text-gray-700 mb-6">Concesionarios y profesionales de confianza</p>
          {loading && <div>Cargando profesionales...</div>}
          {error && <div className="text-red-600">{error}</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {professionals.map((professional) => {
              const name = professional.company || professional.name || "";
              const logo = professional.logoEmpresaHome || professional.logoEmpresa || professional.avatar || "";
              const vehicleCount = professional.vehicleCount || 0;
              
              return (
                <Link
                  to={`/professional/${professional.id}`}
                  key={professional.id}
                  className="flex flex-col items-center text-center group cursor-pointer bg-white/90 border border-primary/20 rounded-2xl shadow-sm hover:shadow-lg hover:bg-primary/10 hover:border-primary transition-all p-4"
                  style={{ minHeight: 140 }}
                >
                  <Avatar className="w-16 h-16 mb-3 bg-gray-100 group-hover:bg-primary/10 border border-primary/10 group-hover:border-primary transition-colors">
                    {logo ? (
                      <AvatarImage src={logo} alt={name} className="object-contain" />
                    ) : (
                      <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    )}
                  </Avatar>
                  <h3 className="text-sm font-medium text-primary group-hover:underline transition-colors">
                    {name}
                  </h3>
                  {vehicleCount > 0 && (
                    <span className="text-xs text-primary mt-1">{vehicleCount} vehículos</span>
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
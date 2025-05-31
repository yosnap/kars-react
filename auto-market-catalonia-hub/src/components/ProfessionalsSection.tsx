
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfessionalsSection = () => {
  // Mock data for professionals - en producción vendría de la API
  const professionals = [
    {
      id: "1",
      name: "123 Cotxe",
      logo: "/placeholder.svg",
      description: "Concesionario especializado"
    },
    {
      id: "2", 
      name: "123 Renting",
      logo: "/placeholder.svg",
      description: "Servicios de renting"
    },
    {
      id: "3",
      name: "41Motors",
      logo: "/placeholder.svg", 
      description: "Venta de vehículos"
    },
    {
      id: "4",
      name: "Art Automobils",
      logo: "/placeholder.svg",
      description: "Automobiles de lujo"
    },
    {
      id: "5",
      name: "Auto Centre Principal",
      logo: "/placeholder.svg",
      description: "Centro automotriz"
    },
    {
      id: "6",
      name: "Autodiesel",
      logo: "/placeholder.svg",
      description: "Especialistas en diesel"
    },
    {
      id: "7",
      name: "Automobils Maia",
      logo: "/placeholder.svg",
      description: "Concesionario oficial"
    },
    {
      id: "8",
      name: "Automobils Mercauto",
      logo: "/placeholder.svg",
      description: "Venta y servicios"
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              Professionals
            </CardTitle>
            <p className="text-gray-600">
              Concesionarios y profesionales de confianza
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {professionals.map((professional) => (
                <div 
                  key={professional.id}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 mb-3 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <img 
                      src={professional.logo} 
                      alt={professional.name}
                      className="w-12 h-12 object-contain rounded-full"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                    {professional.name}
                  </h3>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProfessionalsSection;

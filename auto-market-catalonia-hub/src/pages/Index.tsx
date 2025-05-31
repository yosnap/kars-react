import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import ProfessionalsSection from "@/components/ProfessionalsSection";
import QuickLinksSection from "@/components/QuickLinksSection";
import VehicleCard from "@/components/VehicleCard";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import FloatingFilterButton from "@/components/FloatingFilterButton";
import FiltersSidebar from "@/components/FiltersSidebar";

const Index = () => {
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Mock data for recent vehicles
  const recentVehicles = [
    {
      id: "288031",
      "titol-anunci": "Ford Focus ST",
      "descripcio-anunci": "Deportivo con bajo kilometraje",
      "marques-cotxe": "Ford",
      "models-cotxe": "Focus",
      "estat-vehicle": "Ocasión",
      "any": "2022",
      "quilometratge": "15000",
      "preu": "28000",
      "color-vehicle": "Gris",
      "tipus-combustible": "Gasolina",
      "anunci-destacat": "false",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    },
    {
      id: "288032",
      "titol-anunci": "Toyota Corolla Hybrid",
      "descripcio-anunci": "Eficiencia y fiabilidad",
      "marques-cotxe": "Toyota",
      "models-cotxe": "Corolla",
      "estat-vehicle": "Ocasión",
      "any": "2021",
      "quilometratge": "25000",
      "preu": "22000",
      "color-vehicle": "Blanco",
      "tipus-combustible": "Híbrido",
      "anunci-destacat": "false",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    },
    {
      id: "288033",
      "titol-anunci": "Hyundai Tucson",
      "descripcio-anunci": "SUV familiar espacioso",
      "marques-cotxe": "Hyundai",
      "models-cotxe": "Tucson",
      "estat-vehicle": "Km 0",
      "any": "2023",
      "quilometratge": "8000",
      "preu": "32000",
      "color-vehicle": "Negro",
      "tipus-combustible": "Híbrido",
      "anunci-destacat": "true",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      
      {/* Top Ad Banner */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner size="small" position="header" />
      </div>

      <FeaturedVehicles />

      {/* Recent Vehicles Section - moved before Professionals */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Últimos Vehículos Añadidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>

        {/* Load More Button */}
        <div className="text-center mb-8">
          <button className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Ver Más Vehículos
          </button>
        </div>
      </div>

      {/* Professionals Section - moved after Recent Vehicles */}
      <ProfessionalsSection />

      {/* Quick Links Section */}
      <QuickLinksSection />

      {/* Content Ad Banner */}
      <div className="container mx-auto px-4 py-6">
        <AdBanner size="small" position="content" />
      </div>

      {/* Floating Filter Button */}
      <FloatingFilterButton onClick={() => setIsFilterSidebarOpen(true)} />
      
      {/* Filters Sidebar */}
      <FiltersSidebar 
        isOpen={isFilterSidebarOpen} 
        onOpenChange={setIsFilterSidebarOpen} 
      />

      <Footer />
    </div>
  );
};

export default Index;

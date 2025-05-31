
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeroSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [brand, setBrand] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", { searchTerm, vehicleType, brand });
  };

  return (
    <section className="relative bg-gradient-to-r from-tertiary via-gray-800 to-tertiary py-20">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Encuentra tu <span className="text-primary">vehículo perfecto</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Miles de vehículos nuevos y de ocasión te esperan. 
          Profesionales verificados y particulares con las mejores ofertas.
        </p>

        {/* Search Card */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <Select onValueChange={setVehicleType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo de vehículo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="COTXE">Coches</SelectItem>
                    <SelectItem value="MOTO">Motos</SelectItem>
                    <SelectItem value="CARAVANA">Caravanas</SelectItem>
                    <SelectItem value="CAMIO">Camiones</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-1">
                <Select onValueChange={setBrand}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Marca" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="Peugeot">Peugeot</SelectItem>
                    <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                    <SelectItem value="Ford">Ford</SelectItem>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-1">
                <Input
                  placeholder="Modelo, año, ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="md:col-span-1">
                <Button 
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-secondary"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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

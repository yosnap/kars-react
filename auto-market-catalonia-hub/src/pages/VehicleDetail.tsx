
import { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import VehicleCard from "@/components/VehicleCard";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Calendar, 
  Gauge, 
  Fuel, 
  Palette,
  Crown,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const VehicleDetail = () => {
  const { id } = useParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Mock data - en una aplicación real vendría de una API
  const vehicle = {
    id: "288031",
    "titol-anunci": "Dethleffs Pulse I GT 7051 DBL",
    "descripcio-anunci": "Autocaravana integral premium con todas las comodidades. Perfecto estado de conservación.",
    "marques-cotxe": "Dethleffs",
    "models-cotxe": "Pulse I",
    "estat-vehicle": "A consultar",
    "any": "2019",
    "quilometratge": "45000",
    "preu": "89900",
    "color-vehicle": "Blanco",
    "tipus-combustible": "Diésel",
    "anunci-destacat": "true",
    "imatge-destacada-url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80",
    "galeria-vehicle-urls": [
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80"
    ]
  };

  const specs = {
    "Tracció": "Davant",
    "Cilindrada": "2.998 CC",
    "Potència": "160 CV",
    "Emissions": "Euro 6",
    "Transmissió": "Manual"
  };

  const features = {
    "Plazas": "4",
    "Puertas": "3",
    "Caja Dormitorio": "190x160",
    "Color Tapicerías": "Beige",
    "Climatización": "Sí"
  };

  const extras = [
    "Aire Acondicionado", "Airbag Conductor", "Airbag Passatger", "Central Electrónica",
    "GPS Navegador", "Detector de Zona", "Radio CD", "Sistema Multimedia",
    "Toldo Caravaning", "Velux Múltiple", "Antena TV"
  ];

  const extrasHabitacle = [
    "Aigües Corrents", "Congelador", "Cuina", "Frigorífic", "Microones", "WiFi", "Nevera"
  ];

  const similarVehicles = [
    {
      id: "288032",
      "titol-anunci": "Frankia Platin 8400 QD",
      "descripcio-anunci": "Autocaravana de lujo",
      "marques-cotxe": "Frankia",
      "models-cotxe": "Platin",
      "estat-vehicle": "A consultar",
      "any": "2018",
      "quilometratge": "30000",
      "preu": "120000",
      "color-vehicle": "Gris",
      "tipus-combustible": "Diésel",
      "anunci-destacat": "false",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    },
    {
      id: "288033",
      "titol-anunci": "Mobilivetta Kea I 90",
      "descripcio-anunci": "Compacta y funcional",
      "marques-cotxe": "Mobilivetta",
      "models-cotxe": "Kea",
      "estat-vehicle": "Ocasión",
      "any": "2020",
      "quilometratge": "25000",
      "preu": "75500",
      "color-vehicle": "Blanco",
      "tipus-combustible": "Diésel",
      "anunci-destacat": "false",
      "imatge-destacada-url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80",
      "galeria-vehicle-urls": []
    }
  ];

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(parseInt(price));
  };

  const formatKilometers = (km: string) => {
    return new Intl.NumberFormat('es-ES').format(parseInt(km)) + ' km';
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === vehicle["galeria-vehicle-urls"].length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? vehicle["galeria-vehicle-urls"].length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de Imágenes */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={vehicle["galeria-vehicle-urls"][selectedImageIndex]}
                      alt={vehicle["titol-anunci"]}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Controles de navegación */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Miniaturas */}
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {vehicle["galeria-vehicle-urls"].map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 ${
                          selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Vista ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Descripció</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {vehicle["descripcio-anunci"]}
                </p>
              </CardContent>
            </Card>

            {/* Ficha Técnica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Fitxa tècnica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Características */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Característiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(features).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extras Inclusos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Extres inclosos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {extras.map((extra, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{extra}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extras Habitacle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Extres Habitacle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {extrasHabitacle.map((extra, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span className="text-sm">{extra}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Vehículo */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {vehicle["anunci-destacat"] === "true" && (
                    <Badge variant="secondary" className="bg-tertiary text-white">
                      <Crown className="w-4 h-4 mr-1" />
                      Anunci destacat
                    </Badge>
                  )}
                  
                  <h1 className="text-2xl font-bold">{vehicle["titol-anunci"]}</h1>
                  
                  <Badge variant="outline" className="text-sm">
                    {vehicle["estat-vehicle"]}
                  </Badge>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>Marca:</span>
                      <span className="font-medium">{vehicle["marques-cotxe"]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Model:</span>
                      <span className="font-medium">{vehicle["models-cotxe"]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{vehicle["any"]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      <span>{formatKilometers(vehicle["quilometratge"])}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="w-4 h-4" />
                      <span>{vehicle["tipus-combustible"]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      <span>{vehicle["color-vehicle"]}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(vehicle["preu"])}
                    </p>
                  </div>
                  
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Anar a concurs
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WE-CAMPER</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    <span>962579 362769</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>629475 695892550</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Valencia</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    Utilitzar WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full">
                    Perfil vendedor
                  </Button>
                  <Button variant="outline" className="w-full">
                    Vehícles en Stock
                  </Button>
                  <Button variant="outline" className="w-full">
                    Vehícles venuts
                  </Button>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    Finançament perfecte
                  </Button>
                </div>
                
                <div className="pt-4 border-t text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Anunci creat:</span>
                    <span>31/01/2023</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ref:</span>
                    <span>288031</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alegria el fitxer:</span>
                    <span>6</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Favoritos */}
            <Card>
              <CardContent className="p-6">
                <Button variant="outline" className="w-full">
                  <Star className="w-4 h-4 mr-2" />
                  Afegir a favorits
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vehículos Similares */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-orange-500">També et pot interessar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VehicleDetail;

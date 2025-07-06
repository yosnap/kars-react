import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserCheck } from "lucide-react";

const Taxacions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Title Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-700">
          Taxació de vehicles
        </h1>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          
          {/* Existing Users Section */}
          <Card className="p-8 text-center">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800">
                Ja ets usuari de Motoraldia?
              </h2>
              
              <p className="text-gray-600 leading-relaxed">
                <strong>Si ja ets usuari de Motoraldia i ja tens un vehicle penjat</strong> com a particular al sistema, només cal que entris a la fitxa del teu vehicle, que facis clic al botó TAXA'M i que demanis la valoració al professional que més et convingui. La rebràs directament al teu correu.
              </p>
              
              <Button 
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <a href="/compte/">
                  El meu compte
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* New Users Section */}
          <Card className="p-8 text-center bg-gray-100">
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCheck className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800">
                No ets usuari?
              </h2>
              
              <p className="text-gray-600 leading-relaxed">
                Si encara no ets usuari inscrit de Motoraldia, per poder poder taxar el teu vehicle <strong>caldrà que et donis d'alta (gratuït) i que l'introdueixis a la web (gratuït).</strong> Un cop fet, ja podràs solicitar la valoració als professionals del sector que prefereixis. La rebràs directament al teu correu.
              </p>
              
              <Button 
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <a href="/crear-compte/">
                  Registra't
                </a>
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Taxacions;

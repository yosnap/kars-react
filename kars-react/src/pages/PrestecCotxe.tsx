import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrestecCotxe = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-700">
          Necessites un prèstec?
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-gray-600 mb-16">
          CALCULA LA TEVA QUOTA
        </h2>
      </div>

      {/* Banks Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          
          {/* Creand Bank */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img 
                src="https://mlpgcme0lfbq.i.optimole.com/w:auto/h:auto/q:mauto/process:181726/id:c9b92fe1bf38f55aa59e0b839e2a0dba/https://motoraldia.net/logo.png"
                alt="Logo Creand"
                className="h-16 object-contain"
                loading="lazy"
              />
            </div>
            <div className="py-8"></div>
            <Button 
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <a 
                href="https://creand.ad/persones/hipoteques-i-prestecs/prestec-cotxe/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Prèstec vehicle amb Creand
              </a>
            </Button>
          </div>

          {/* Morabanc Bank */}
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <img 
                src="https://mlpgcme0lfbq.i.optimole.com/w:auto/h:auto/q:mauto/process:181727/id:d758ceca09ca6167c0c161c1fdaed42e/https://motoraldia.net/logo-300x47-1.png"
                alt="Logo Morabanc"
                className="h-16 object-contain"
                loading="lazy"
              />
            </div>
            <div className="py-8"></div>
            <Button 
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <a 
                href="https://www.morabanc.ad/ca/prestecs/prestec-cotxe/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Prèstec vehicle amb Morabanc
              </a>
            </Button>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrestecCotxe;
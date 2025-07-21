import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

export default function Serveis() {
  const breadcrumbs = [
    { 
      label: { 
        ca: "Serveis", 
        es: "Servicios", 
        en: "Services", 
        fr: "Services" 
      }, 
      href: "/serveis" 
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <PageBreadcrumbs items={breadcrumbs} />
        </div>
        
        {/* Contenedor principal con grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna de servicios */}
          <div className="space-y-6">
            {/* Título principal */}
            <h1 className="text-5xl font-bold text-red-500 mb-8">Serveis</h1>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  <strong>Servei multi-idioma:</strong> A Kars us podem atendre de forma personalitzada en 6 idiomes: català, francès, castellà, anglès, italià i portuguès.
                </span>
              </li>
              
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  Servei integral d'importació i exportació de vehicles.
                </span>
              </li>
              
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  Servei de represa de vehicles (inclou dipòsits venda)
                </span>
              </li>
              
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  Servei de compra instantània de vehicles (sempre després d'un exhaustiu control)
                </span>
              </li>
              
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  Accés a productes exclusius i edicions limitades
                </span>
              </li>
            </ul>
            
            {/* Botón de contacto */}
            <div className="mt-12">
              <Link 
                to="/contacta"
                className="inline-block bg-red-500 text-white px-8 py-4 font-bold text-lg uppercase hover:bg-red-600 transition-colors rounded-lg"
              >
                CONTACTA AMB NOSALTRES
              </Link>
            </div>
          </div>
          
          {/* Columna de imagen */}
          <div>
            <img 
              src="/media/2025/01/serveis-kars.jpeg" 
              alt="KARS Serveis - Entrega de claus"
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
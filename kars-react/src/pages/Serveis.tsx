import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { useLanguage } from "../context/LanguageContext";
import { staticPageTranslations } from "../translations/static-pages";

export default function Serveis() {
  const { currentLanguage } = useLanguage();
  const t = staticPageTranslations.services[currentLanguage];
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
      <div className="container mx-auto py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <PageBreadcrumbs items={breadcrumbs} />
        </div>
        
        {/* Contenedor principal con grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna de servicios */}
          <div className="space-y-6">
            {/* Título principal */}
            <h1 className="text-5xl font-bold text-red-500 mb-8">{t.title}</h1>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  <strong>{t.service1.split(':')[0]}:</strong> {t.service1.split(':')[1]}
                </span>
              </li>
              
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  {t.service2}
                </span>
              </li>
              
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  {t.service3}
                </span>
              </li>
              
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  {t.service4}
                </span>
              </li>
              
              <li className="flex items-start">
                <CheckCircle className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-white text-lg">
                  {t.service5}
                </span>
              </li>
            </ul>
            
            {/* Botón de contacto */}
            <div className="mt-12">
              <Link 
                to="/contacta"
                className="inline-block bg-red-500 text-white px-8 py-4 font-bold text-lg uppercase hover:bg-red-600 transition-colors rounded-lg"
              >
                {t.contact}
              </Link>
            </div>
          </div>
          
          {/* Columna de imagen */}
          <div>
            <img 
              src="/media/2025/01/serveis-kars.jpeg" 
              alt="KARS Serveis - Entrega de claus"
              className="w-full h-auto md:h-[400px] lg:h-auto rounded-lg shadow-2xl object-cover"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
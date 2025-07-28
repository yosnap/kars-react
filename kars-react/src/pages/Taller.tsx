import { CheckCircle } from "lucide-react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { useLanguage } from "../context/LanguageContext";
import { staticPageTranslations } from "../translations/static-pages";

export default function Taller() {
  const { currentLanguage } = useLanguage();
  const t = staticPageTranslations.workshop[currentLanguage];
  const breadcrumbs = [
    { 
      label: { 
        ca: "Taller", 
        es: "Taller", 
        en: "Workshop", 
        fr: "Atelier" 
      }, 
      href: "/taller" 
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <PageBreadcrumbs items={breadcrumbs} />
        </div>

        {/* Título principal */}
        <h1 className="text-5xl font-bold text-red-500 mb-8 text-center">{t.title}</h1>
        
        {/* Contenedor principal con grid para texto e imagen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Columna de texto */}
          <div className="space-y-6">
            <p className="text-white text-lg leading-relaxed">
              {t.intro1}
            </p>
            
            <p className="text-white text-lg leading-relaxed">
              {t.intro2}
            </p>
            
            <p className="text-white text-lg font-medium mb-6">
              {t.intro3}
            </p>
            
            {/* Lista de servicios */}
            <ul className="space-y-3">
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">{t.service1}</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">{t.service2}</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">{t.service3}</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">{t.service4}</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">{t.service5}</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">{t.service6}</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">{t.service7}</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">{t.service8}</span>
              </li>
            </ul>
            
            <p className="text-white text-lg leading-relaxed mt-8">
              {t.distributor}
            </p>
          </div>
          
          {/* Columna de imagen */}
          <div className="flex items-center">
            <img 
              src="/media/2025/01/taller-bosch.jpg" 
              alt="KARS Taller Bosch Car Service"
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
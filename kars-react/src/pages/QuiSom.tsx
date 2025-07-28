import { CheckCircle } from "lucide-react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";
import { useLanguage } from "../context/LanguageContext";
import { staticPageTranslations } from "../translations/static-pages";

export default function QuiSom() {
  const { currentLanguage } = useLanguage();
  const t = staticPageTranslations.about[currentLanguage];
  const breadcrumbs = [
    { 
      label: { 
        ca: "Qui som", 
        es: "Quiénes somos", 
        en: "About us", 
        fr: "Qui sommes-nous" 
      }, 
      href: "/qui-som" 
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
        
        {/* Párrafos introductorios */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-white text-lg mb-6 leading-relaxed">
            {t.intro1}
          </p>
          
          <p className="text-white text-lg mb-8 leading-relaxed">
            {t.intro2}
          </p>
        </div>
        
        {/* Imagen del showroom */}
        <div className="mb-16">
          <img 
            src="/media/2025/01/kars-showroom.jpg" 
            alt="KARS Showroom"
            className="w-full max-w-5xl mx-auto rounded-lg shadow-2xl"
          />
        </div>
        
        {/* Sección: Raons de confiança */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-red-500 mr-2">›</span>
            {t.trustReasons}
          </h2>
          
          <ul className="space-y-4 text-white">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.trust1}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.trust2}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.trust3}</span>
            </li>
          </ul>
          
          <ul className="ml-12 mt-2 space-y-2 text-white">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.warrantyEu}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.warrantyComfort}</span>
            </li>
          </ul>
        </div>
        
        {/* Sección: Independència */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-red-500 mr-2">›</span>
            {t.independence}
          </h2>
          
          <p className="text-white text-lg mb-4">
            {t.independenceIntro}
          </p>
          
          <ul className="space-y-4 text-white">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.independence1}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.independence2}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.independence3}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.independence4}</span>
            </li>
          </ul>
        </div>
        
        {/* Sección: Implicació */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-red-500 mr-2">›</span>
            {t.involvement}
          </h2>
          
          <ul className="space-y-4 text-white">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.involvement1}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.involvement2}</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">{t.involvement3}</span>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
import { CheckCircle } from "lucide-react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

export default function QuiSom() {
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
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <PageBreadcrumbs items={breadcrumbs} />
        </div>

        {/* Título principal */}
        <h1 className="text-5xl font-bold text-red-500 mb-8 text-center">Qui som?</h1>
        
        {/* Párrafos introductorios */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-white text-lg mb-6 leading-relaxed">
            Que avui dia KARS estigui considerat un referent en el sector de vehicles premium multimarca, no és resultat de la casualitat. Trenta anys d'experiència i de creixement constant, tant de la nostra empresa, com del nombre de clients satisfets, són les garanties més sòlides de la qualitat del servei que oferim.
          </p>
          
          <p className="text-white text-lg mb-8 leading-relaxed">
            En tots aquests anys d'activitat hem desenvolupat una eficient, sòlida i fiable xarxa de professionals per tal de poder satisfer totes les necessitats dels nostres clients i dels seus vehicles, siguin els actuals o els futurs. En aquest sentit, més enllà de l'exposició permanent, a Kars disposem d'un servei d'importació-exportació a la carta, d'un taller Bosch Car Service a les mateixes instal·lacions, també de serveis de planxa i pintura, assegurances i lloguer de vehicles, entre altres.
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
            Raons de confiança:
          </h2>
          
          <ul className="space-y-4 text-white">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Cada vehicle es verifica sistemàticament al nostre taller, incloent el seu historial des del seu origen.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Disposem d'una important xarxa de professionals fiables, tant a Andorra com a l'extranger.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Som l'únic centre de compra i venda que dóna 12 mesos de garantia complementària incloent:</span>
            </li>
          </ul>
          
          <ul className="ml-12 mt-2 space-y-2 text-white">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
              <span className="text-lg">Garantia europea</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
              <span className="text-lg">Elements de confort (climatització, finestres o sostre obert, escapament, transmissió, caixa de canvis, suspensió ...)</span>
            </li>
          </ul>
        </div>
        
        {/* Sección: Independència */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-red-500 mr-2">›</span>
            Independència
          </h2>
          
          <p className="text-white text-lg mb-4">
            KARS no està vinculat a cap marca oficial. Això significa que:
          </p>
          
          <ul className="space-y-4 text-white">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Som sempre molt objectius, doncs no tenim interès en vendre cap marca en particular.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Gaudireu d'un assessorament basat en les millors opcions per tal de satisfer les vostres necessitats.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Podem acceptar com a part de pagament qualsevol marca, sense penalitzacions.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Estem preparats per atendre les necessitats de tota la família i això inclou qualsevol tipus de vehicle, sigui del segment que sigui, sempre incloent els serveis complementaris que oferim.</span>
            </li>
          </ul>
        </div>
        
        {/* Sección: Implicació */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-red-500 mr-2">›</span>
            Implicació
          </h2>
          
          <ul className="space-y-4 text-white">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">No hi ha èxit sense implicació humana, per això a KARS rebreu l'atenció directa dels propietaris.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Si ho necessiteu, durant el procés de selecció del vehicle idoni rebreu consells i comparatives entre diferents opcions. A més, amb l'objectiu de ser transparents i altament eficients, les negociacions es faran sense intermediaris. Un cop feta una primera selecció, estudiarem i fins i tot provarem cada vehicle seleccionat per tal de poder esvair qualsevol dubte i respondre tots els interrogants que pugui haver-hi durant el procés.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <span className="text-lg">Gràcies a l'estreta relació amb els nostres clients, fruit de molts anys de relació, a Kars coneixem els seus gustos i preferències. Aquest fet ens permet anticipar-nos a l'hora de fer o proposar un canvi, sigui per la sortida al mercat d'un nou model o simplement per fer un canvi de vehicle en funció del temps d'ús habitual.</span>
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
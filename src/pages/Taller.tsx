import { CheckCircle } from "lucide-react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

export default function Taller() {
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
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <PageBreadcrumbs items={breadcrumbs} />
        </div>

        {/* Título principal */}
        <h1 className="text-5xl font-bold text-red-500 mb-8 text-center">Bosch Car Services</h1>
        
        {/* Contenedor principal con grid para texto e imagen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Columna de texto */}
          <div className="space-y-6">
            <p className="text-white text-lg leading-relaxed">
              L'any 2013, després de més de 25 anys dedicats a la venda, a KARS Automòbils vam incorporar en les mateixes instal·lacions un taller BOSCH CAR SERVICE, complementant així l'activitat de control, avaluació, manteniment i reparació tant dels vehicles de KARS, com els dels nostres clients.
            </p>
            
            <p className="text-white text-lg leading-relaxed">
              L'equip, la tecnologia, la formació continuada i les ganes de donar un servei integral, fan del departament de taller de Kars una clara resposta a la continuïtat lògica en la relació de confiança establerta amb els nostres clients al llarg dels anys.
            </p>
            
            <p className="text-white text-lg font-medium mb-6">
              A KARS Taller - BOSCH CAR SERVICE, oferim un servei integral que inclou:
            </p>
            
            {/* Lista de servicios */}
            <ul className="space-y-3">
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">Revisions</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">Mecànica</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">Electricitat i electrònica</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">Diagnosis</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">Aliniacions</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">ITV i Pre-ITV</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">Instal·lacions</span>
              </li>
              <li className="flex items-center text-white">
                <CheckCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-lg">Pneumàtics de primeres marques al millor preu</span>
              </li>
            </ul>
            
            <p className="text-white text-lg leading-relaxed mt-8">
              A més, dins de l'àmbit del luxe i de la personalització, destacar que som distribuidors oficials a Andorra d'Akrapovic, Capristo, IPE, DTE System.
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
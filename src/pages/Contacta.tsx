import { useState } from "react";
import Footer from "../components/Footer";
import PageBreadcrumbs from "../components/PageBreadcrumbs";

export default function Contacta() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const breadcrumbs = [
    { 
      label: { 
        ca: "Contacta", 
        es: "Contacto", 
        en: "Contact", 
        fr: "Contact" 
      }, 
      href: "/contacta" 
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar envío del formulario
    console.log("Formulario enviado:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <PageBreadcrumbs items={breadcrumbs} />
        </div>

        {/* Título principal */}
        <h1 className="text-5xl font-bold text-red-500 mb-4 text-center">Contacta</h1>
        
        {/* Horario */}
        <p className="text-white text-lg text-center mb-12">
          Dilluns a dijous de 9:00 a 13:30 hores i de 15:00 a 19:00 hores - Divendres de 9:00 a 15:00 hores
        </p>
        
        {/* Grid con formulario y mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna del formulario */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom *"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Correu Electronic *"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Telèfon *"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <textarea
                  name="message"
                  placeholder="Missatge *"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-4 font-bold text-lg uppercase hover:bg-red-600 transition-colors rounded-lg"
              >
                ENVIAR
              </button>
            </form>
          </div>
          
          {/* Columna del mapa */}
          <div className="h-[500px] lg:h-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2975.8!2d1.5219!3d42.5067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a5c8f5d8f8f8f9:0x1234567890abcdef!2sBaixada%20del%20Mol%C3%AD%2C%2039%2C%20AD500%20Andorra%20la%20Vella%2C%20Andorra!5e0!3m2!1sca!2sad!4v1234567890!5m2!1sca!2sad"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '500px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="KARS Andorra Location"
              className="rounded-lg shadow-xl"
            ></iframe>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="mt-12 text-center">
          <p className="text-white text-lg">
            <strong>KARS Automòbils</strong><br />
            Baixada del Molí, 39<br />
            C/ Prada Motxilla, 2 Baixos<br />
            AD500 Andorra la Vella
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
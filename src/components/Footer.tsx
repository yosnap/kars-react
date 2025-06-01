const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white">
      {/* Ad Banner */}
      <div className="container mx-auto px-4 py-8">
        {/* Puedes usar <AdBanner size="medium" position="footer" /> si ya está importado */}
      </div>
      <div className="border-t border-blue-800" />
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">Motor al Día</h3>
            <p className="text-gray-300 mb-4">
              La plataforma líder en compra-venta de vehículos. 
              Conectamos profesionales y particulares con compradores 
              en toda España.
            </p>
            <div className="flex space-x-4">
              <button className="text-white hover:text-blue-400">📱 iOS</button>
              <button className="text-white hover:text-blue-400">🤖 Android</button>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/coches" className="hover:text-blue-400">Coches</a></li>
              <li><a href="/motos" className="hover:text-blue-400">Motos</a></li>
              <li><a href="/profesionales" className="hover:text-blue-400">Profesionales</a></li>
              <li><a href="/ofertas" className="hover:text-blue-400">Ofertas</a></li>
              <li><a href="/valoracion" className="hover:text-blue-400">Tasación Gratuita</a></li>
            </ul>
          </div>
          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/publicar" className="hover:text-blue-400">Publicar Anuncio</a></li>
              <li><a href="/financiacion" className="hover:text-blue-400">Financiación</a></li>
              <li><a href="/seguros" className="hover:text-blue-400">Seguros</a></li>
              <li><a href="/garantia" className="hover:text-blue-400">Garantía</a></li>
              <li><a href="/soporte" className="hover:text-blue-400">Soporte</a></li>
            </ul>
          </div>
          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-300 mb-4">
              Recibe las mejores ofertas y novedades directamente en tu email.
            </p>
            <div className="flex space-x-2">
              <input
                placeholder="Tu email"
                className="bg-blue-800 border-blue-700 text-white rounded px-3 py-2"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">Enviar</button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-blue-800" />
      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 Motor al Día. Todos los derechos reservados.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <a href="/privacidad" className="hover:text-blue-400">Política de Privacidad</a>
            <a href="/terminos" className="hover:text-blue-400">Términos de Uso</a>
            <a href="/cookies" className="hover:text-blue-400">Cookies</a>
            <a href="/contacto" className="hover:text-blue-400">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
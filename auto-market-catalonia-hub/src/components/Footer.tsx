
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AdBanner from "./AdBanner";

const Footer = () => {
  return (
    <footer className="bg-tertiary text-white">
      {/* Ad Banner */}
      <div className="container mx-auto px-4 py-8">
        <AdBanner size="medium" position="footer" />
      </div>

      <Separator className="bg-gray-600" />

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Motor al Día</h3>
            <p className="text-gray-300 mb-4">
              La plataforma líder en compra-venta de vehículos. 
              Conectamos profesionales y particulares con compradores 
              en toda España.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:text-primary">
                📱 iOS
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:text-primary">
                🤖 Android
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/coches" className="hover:text-primary">Coches</a></li>
              <li><a href="/motos" className="hover:text-primary">Motos</a></li>
              <li><a href="/profesionales" className="hover:text-primary">Profesionales</a></li>
              <li><a href="/ofertas" className="hover:text-primary">Ofertas</a></li>
              <li><a href="/valoracion" className="hover:text-primary">Tasación Gratuita</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/publicar" className="hover:text-primary">Publicar Anuncio</a></li>
              <li><a href="/financiacion" className="hover:text-primary">Financiación</a></li>
              <li><a href="/seguros" className="hover:text-primary">Seguros</a></li>
              <li><a href="/garantia" className="hover:text-primary">Garantía</a></li>
              <li><a href="/soporte" className="hover:text-primary">Soporte</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-300 mb-4">
              Recibe las mejores ofertas y novedades directamente en tu email.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Tu email"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button className="bg-primary hover:bg-secondary">
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-600" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 Motor al Día. Todos los derechos reservados.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <a href="/privacidad" className="hover:text-primary">Política de Privacidad</a>
            <a href="/terminos" className="hover:text-primary">Términos de Uso</a>
            <a href="/cookies" className="hover:text-primary">Cookies</a>
            <a href="/contacto" className="hover:text-primary">Contacto</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

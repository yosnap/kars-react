import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
// Logo moved to public/media folder

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <img
                src="/media/kars-logo.png"
                alt="Kars.ad Logo"
                className="h-16 w-auto mb-4"
              />
            </Link>
          </div>

          {/* Nosaltres */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Nosaltres</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/qui-som" className="hover:text-primary transition-colors">
                  Qui som
                </Link>
              </li>
              <li>
                <Link to="/taller" className="hover:text-primary transition-colors">
                  Taller
                </Link>
              </li>
              <li>
                <Link to="/contacta" className="hover:text-primary transition-colors">
                  Contacta
                </Link>
              </li>
            </ul>
          </div>

          {/* Vehicles */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Vehicles</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/admin" className="hover:text-primary transition-colors">
                  Accés professional
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="hover:text-primary transition-colors">
                  Vehicles disponibles
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a href="/avis-legal" className="hover:text-primary transition-colors">
                  Avís legal
                </a>
              </li>
              <li>
                <a href="/politica-galetes" className="hover:text-primary transition-colors">
                  Política de galetes
                </a>
              </li>
            </ul>
          </div>

          {/* Segueix-nos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Segueix-nos</h4>
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-primary p-3 rounded-lg transition-all hover:scale-105"
                title="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-primary p-3 rounded-lg transition-all hover:scale-105"
                title="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="mailto:info@kars.ad" 
                className="bg-gray-800 hover:bg-primary p-3 rounded-lg transition-all hover:scale-105"
                title="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a 
                href="tel:+376000000" 
                className="bg-gray-800 hover:bg-primary p-3 rounded-lg transition-all hover:scale-105"
                title="Telèfon"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div>
              © {new Date().getFullYear()} Kars.ad. Tots els drets reservats.
            </div>
            <div className="mt-4 md:mt-0">
              <span>Andorra la Vella, Principat d'Andorra</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
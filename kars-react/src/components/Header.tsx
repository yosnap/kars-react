import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Star, LogOut, User } from "lucide-react";
// Logo moved to public/media folder
import { useFavorites } from "../hooks/useFavorites";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useLocalizedNavigation } from "../hooks/useLocalizedNavigation";
import LanguageSelector from "./LanguageSelector";

interface HeaderProps {
  onSearch?: (params: { vehicleType?: string; searchTerm?: string }) => void;
  onOpenAdvancedSearch?: () => void;
}

export default function Header({ onSearch, onOpenAdvancedSearch }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { favorites } = useFavorites();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { getLocalizedHref } = useLocalizedNavigation();
  const navigate = useNavigate();

  // Función para determinar si una ruta está activa
  const isActiveRoute = (routePath: string): boolean => {
    const currentPath = location.pathname;
    
    // Remover prefijos de idioma para comparar
    const cleanPath = currentPath.replace(/^\/(ca|es|en|fr)/, '') || '/';
    
    
    // Mapeo de rutas base con todas sus traducciones
    const routeTranslations: Record<string, string[]> = {
      '/': ['/'],
      '/vehicles': ['/vehicles', '/vehiculos', '/vehicules'],
      '/ultimes-vendes': ['/ultimes-vendes', '/ultimas-ventas', '/latest-sales', '/dernieres-ventes'],
      '/qui-som': ['/qui-som', '/quienes-somos', '/about-us', '/qui-sommes-nous'],
      '/taller': ['/taller', '/workshop', '/atelier'],
      '/serveis': ['/serveis', '/servicios', '/services'],
      '/contacta': ['/contacta', '/contacto', '/contact']
    };
    
    // Casos especiales para rutas anidadas
    if (routePath === '/vehicles') {
      const vehicleRoutes = routeTranslations['/vehicles'];
      // También incluir rutas de detalle de vehículo (/vehicle/slug)
      const vehicleDetailRoutes = ['/vehicle', '/vehiculo', '/vehicule'];
      return vehicleRoutes.some(route => 
        cleanPath === route || cleanPath.startsWith(route + '/')
      ) || vehicleDetailRoutes.some(route => 
        cleanPath.startsWith(route + '/')
      );
    }
    
    if (routePath === '/ultimes-vendes') {
      const salesRoutes = routeTranslations['/ultimes-vendes'];
      return salesRoutes.some(route => 
        cleanPath === route || cleanPath.startsWith(route + '/')
      );
    }
    
    // Para home, ser más específico
    if (routePath === '/') {
      return cleanPath === '/';
    }
    
    // Para otras rutas, verificar todas las traducciones
    const translations = routeTranslations[routePath] || [routePath];
    const result = translations.some(route => 
      cleanPath === route || cleanPath === route + '/'
    );
    
    return result;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFavoritesClick = () => {
    navigate('/favorits');
  };

  return (
    <header className="w-full bg-black shadow-md relative z-10">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={getLocalizedHref("/")}>
              <img
                src="/media/kars-logo.png"
                alt="Kars.ad Logo"
                className="h-[60px] w-auto"
              />
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to={getLocalizedHref("/")} 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${isActiveRoute('/') ? '!text-primary' : ''}`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to={getLocalizedHref("/qui-som")} 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${isActiveRoute('/qui-som') ? '!text-primary' : ''}`}
            >
              {t('nav.about')}
            </Link>
            <Link 
              to={getLocalizedHref("/taller")} 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${isActiveRoute('/taller') ? '!text-primary' : ''}`}
            >
              {t('nav.workshop')}
            </Link>
            <Link 
              to={getLocalizedHref("/serveis")} 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${isActiveRoute('/serveis') ? '!text-primary' : ''}`}
            >
              {t('nav.services')}
            </Link>
            <Link 
              to={getLocalizedHref("/vehicles")} 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${isActiveRoute('/vehicles') ? '!text-primary' : ''}`}
            >
              {t('nav.vehicles')}
            </Link>
            <Link 
              to={getLocalizedHref("/ultimes-vendes")} 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${isActiveRoute('/ultimes-vendes') ? '!text-primary' : ''}`}
            >
              {t('nav.latest_sales')}
            </Link>
            <Link 
              to={getLocalizedHref("/contacta")} 
              className={`text-white hover:text-primary transition-colors text-sm font-medium ${isActiveRoute('/contacta') ? '!text-primary' : ''}`}
            >
              {t('nav.contact')}
            </Link>
            
            {/* Auth Section */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/admin" 
                    className="bg-blue-600 text-white px-4 py-2 text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                    title="Admin"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('nav.admin')}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 text-xs font-medium rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                    title={t('nav.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('nav.logout')}</span>
                  </button>
                </div>
              ) : (
                <Link 
                  to="/admin" 
                  className="bg-primary text-white px-4 py-2 text-xs font-medium rounded-lg hover:bg-black hover:border-white border border-transparent transition-all flex items-center gap-2"
                  title={t('nav.professional_area')}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('nav.professional_area')}</span>
                </Link>
              )}
              
              {/* Favorites Button */}
              <button 
                onClick={handleFavoritesClick}
                className="relative text-white hover:text-yellow-400 transition-colors"
                title={t('nav.favorites')}
              >
                <Star className="w-6 h-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {favorites.length}
                  </span>
                )}
              </button>

              {/* Language Selector */}
              <LanguageSelector />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to={getLocalizedHref("/")} className={`block px-3 py-2 text-white hover:text-primary ${isActiveRoute('/') ? '!text-primary bg-gray-800' : ''}`}>{t('nav.home')}</Link>
            <Link to={getLocalizedHref("/qui-som")} className={`block px-3 py-2 text-white hover:text-primary ${isActiveRoute('/qui-som') ? '!text-primary bg-gray-800' : ''}`}>{t('nav.about')}</Link>
            <Link to={getLocalizedHref("/taller")} className={`block px-3 py-2 text-white hover:text-primary ${isActiveRoute('/taller') ? '!text-primary bg-gray-800' : ''}`}>{t('nav.workshop')}</Link>
            <Link to={getLocalizedHref("/serveis")} className={`block px-3 py-2 text-white hover:text-primary ${isActiveRoute('/serveis') ? '!text-primary bg-gray-800' : ''}`}>{t('nav.services')}</Link>
            <Link to={getLocalizedHref("/vehicles")} className={`block px-3 py-2 text-white hover:text-primary ${isActiveRoute('/vehicles') ? '!text-primary bg-gray-800' : ''}`}>{t('nav.vehicles')}</Link>
            <Link to={getLocalizedHref("/ultimes-vendes")} className={`block px-3 py-2 text-white hover:text-primary ${isActiveRoute('/ultimes-vendes') ? '!text-primary bg-gray-800' : ''}`}>{t('nav.latest_sales')}</Link>
            <Link to={getLocalizedHref("/contacta")} className={`block px-3 py-2 text-white hover:text-primary ${isActiveRoute('/contacta') ? '!text-primary bg-gray-800' : ''}`}>{t('nav.contact')}</Link>
            {/* Mobile Auth Section */}
            <div className="px-3 py-2 space-y-2">
              {user ? (
                <div className="space-y-2">
                  <Link 
                    to="/admin" 
                    className="block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t('nav.admin')}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <Link 
                  to="/admin" 
                  className="flex px-3 py-2 bg-primary text-white rounded-lg hover:bg-black hover:border-white border border-transparent transition-all items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {t('nav.professional_area')}
                </Link>
              )}
              <button 
                onClick={handleFavoritesClick}
                className="block px-3 py-2 text-white hover:text-yellow-400 flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                {t('nav.favorites')} {favorites.length > 0 && `(${favorites.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
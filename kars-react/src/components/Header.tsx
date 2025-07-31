import React, { useState, useEffect } from "react";
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
    setMobileMenuOpen(false); // Cerrar menú al navegar
  };

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false); // Cerrar menú al hacer clic en cualquier enlace
  };

  // Prevenir scroll del body cuando el sidebar está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      // Asegurar que el menú móvil esté por encima de todo
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('mobile-menu-open');
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [mobileMenuOpen]);

  return (
    <header className="w-full bg-black shadow-md relative z-10">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          {/* Logo - Always left */}
          <div className="flex items-center">
            <Link to={getLocalizedHref("/")}>
              <img
                src="/media/kars-logo.png"
                alt="Kars.ad Logo"
                className="h-[60px] w-auto"
              />
            </Link>
          </div>

          {/* DESKTOP: Center - Navigation + Auth + Favorites */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <nav className="flex items-center space-x-6">
              <Link
                to={getLocalizedHref("/")}
                className={`text-white hover:text-primary transition-colors text-base font-normal ${isActiveRoute('/') ? '!text-primary' : ''}`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to={getLocalizedHref("/qui-som")}
                className={`text-white hover:text-primary transition-colors text-base font-normal ${isActiveRoute('/qui-som') ? '!text-primary' : ''}`}
              >
                {t('nav.about')}
              </Link>
              <Link
                to={getLocalizedHref("/taller")}
                className={`text-white hover:text-primary transition-colors text-base font-normal ${isActiveRoute('/taller') ? '!text-primary' : ''}`}
              >
                {t('nav.workshop')}
              </Link>
              <Link
                to={getLocalizedHref("/serveis")}
                className={`text-white hover:text-primary transition-colors text-base font-normal ${isActiveRoute('/serveis') ? '!text-primary' : ''}`}
              >
                {t('nav.services')}
              </Link>
              <Link
                to={getLocalizedHref("/vehicles")}
                className={`text-white hover:text-primary transition-colors text-base font-normal ${isActiveRoute('/vehicles') ? '!text-primary' : ''}`}
              >
                {t('nav.vehicles')}
              </Link>
              <Link
                to={getLocalizedHref("/ultimes-vendes")}
                className={`text-white hover:text-primary transition-colors text-base font-normal ${isActiveRoute('/ultimes-vendes') ? '!text-primary' : ''}`}
              >
                {t('nav.latest_sales')}
              </Link>
              <Link
                to={getLocalizedHref("/contacta")}
                className={`text-white hover:text-primary transition-colors text-base font-normal ${isActiveRoute('/contacta') ? '!text-primary' : ''}`}
              >
                {t('nav.contact')}
              </Link>

              {/* Separator */}
              <div className="w-px h-6 bg-gray-600 mx-3"></div>

              {/* Auth Section */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/admin"
                    className="bg-blue-600 text-white px-3 py-2 text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                    title="Admin"
                  >
                    <User className="w-4 h-4" />
                    <span>{t('nav.admin')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-3 py-2 text-xs font-medium rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                    title={t('nav.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin"
                  className="bg-primary text-white px-3 py-2 text-xs font-medium rounded-lg hover:bg-black hover:border-white border border-transparent transition-all flex items-center gap-2"
                  title={t('nav.professional_area')}
                >
                  <User className="w-4 h-4" />
                  <span>{t('nav.professional_area')}</span>
                </Link>
              )}

              {/* Favorites Button */}
              <button
                onClick={handleFavoritesClick}
                className="relative text-white hover:text-yellow-400 transition-colors ml-2"
                title={t('nav.favorites')}
              >
                <Star className="w-6 h-6" />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* CENTER SECTION */}
          <div className="flex-1 flex justify-center items-center lg:hidden">
            {/* TABLETS: Language Flags */}
            <div className="hidden md:flex lg:hidden">
              <LanguageSelector variant="header" />
            </div>

            {/* MOBILE: Language Flags Carousel */}
            <div className="md:hidden">
              <LanguageSelector variant="mobile-carousel" />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center">
            {/* DESKTOP: Language Selector - Right with proper spacing */}
            <div className="hidden lg:flex items-center ml-8">
              <LanguageSelector variant="header" />
            </div>

            {/* MOBILE: Favorites + Auth Icons */}
            <div className="flex md:hidden items-center space-x-3">
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

              {/* Auth Button */}
              {user ? (
                <Link
                  to="/admin"
                  className="text-white hover:text-primary transition-colors"
                  title="Admin"
                >
                  <User className="w-6 h-6" />
                </Link>
              ) : (
                <Link
                  to="/admin"
                  className="text-white hover:text-primary transition-colors"
                  title={t('nav.professional_area')}
                >
                  <User className="w-6 h-6" />
                </Link>
              )}
            </div>

            {/* TABLETS: Favorites + Auth + Hamburger */}
            <div className="hidden md:flex lg:hidden items-center space-x-3">
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

              {/* Auth Button */}
              {user ? (
                <Link
                  to="/admin"
                  className="text-white hover:text-primary transition-colors"
                  title="Admin"
                >
                  <User className="w-6 h-6" />
                </Link>
              ) : (
                <Link
                  to="/admin"
                  className="text-white hover:text-primary transition-colors"
                  title={t('nav.professional_area')}
                >
                  <User className="w-6 h-6" />
                </Link>
              )}
            </div>

            {/* Hamburger Menu Button - Always right, larger on tablets */}
            <button
              className="lg:hidden text-white p-2 z-50 relative"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[60] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar - Improved transitions following best practices */}
      <div className={`mobile-sidebar fixed inset-0 bg-black z-[70] transform transition-all duration-300 ease-in-out lg:hidden ${
        mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex flex-col h-full pt-20">
          {/* Navigation Links - Start below header */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-6 space-y-4">
              <Link
                to={getLocalizedHref("/")}
                onClick={handleMobileNavClick}
                className={`block px-4 py-3 text-lg font-medium text-white hover:text-primary hover:bg-gray-900 rounded-lg transition-all ${isActiveRoute('/') ? '!text-primary bg-gray-800' : ''}`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to={getLocalizedHref("/qui-som")}
                onClick={handleMobileNavClick}
                className={`block px-4 py-3 text-lg font-medium text-white hover:text-primary hover:bg-gray-900 rounded-lg transition-all ${isActiveRoute('/qui-som') ? '!text-primary bg-gray-800' : ''}`}
              >
                {t('nav.about')}
              </Link>
              <Link
                to={getLocalizedHref("/taller")}
                onClick={handleMobileNavClick}
                className={`block px-4 py-3 text-lg font-medium text-white hover:text-primary hover:bg-gray-900 rounded-lg transition-all ${isActiveRoute('/taller') ? '!text-primary bg-gray-800' : ''}`}
              >
                {t('nav.workshop')}
              </Link>
              <Link
                to={getLocalizedHref("/serveis")}
                onClick={handleMobileNavClick}
                className={`block px-4 py-3 text-lg font-medium text-white hover:text-primary hover:bg-gray-900 rounded-lg transition-all ${isActiveRoute('/serveis') ? '!text-primary bg-gray-800' : ''}`}
              >
                {t('nav.services')}
              </Link>
              <Link
                to={getLocalizedHref("/vehicles")}
                onClick={handleMobileNavClick}
                className={`block px-4 py-3 text-lg font-medium text-white hover:text-primary hover:bg-gray-900 rounded-lg transition-all ${isActiveRoute('/vehicles') ? '!text-primary bg-gray-800' : ''}`}
              >
                {t('nav.vehicles')}
              </Link>
              <Link
                to={getLocalizedHref("/ultimes-vendes")}
                onClick={handleMobileNavClick}
                className={`block px-4 py-3 text-lg font-medium text-white hover:text-primary hover:bg-gray-900 rounded-lg transition-all ${isActiveRoute('/ultimes-vendes') ? '!text-primary bg-gray-800' : ''}`}
              >
                {t('nav.latest_sales')}
              </Link>
              <Link
                to={getLocalizedHref("/contacta")}
                onClick={handleMobileNavClick}
                className={`block px-4 py-3 text-lg font-medium text-white hover:text-primary hover:bg-gray-900 rounded-lg transition-all ${isActiveRoute('/contacta') ? '!text-primary bg-gray-800' : ''}`}
              >
                {t('nav.contact')}
              </Link>
            </nav>
          </div>

        </div>
      </div>
    </header>
  );
}

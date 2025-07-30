import { useState, useEffect } from 'react';
import { X, Cookie, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage, getLocalizedPath } from '../context/LanguageContext';
import { useCookieManager, CookiePreferences } from '../hooks/useCookieManager';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  const { detectedCookies, preferences, getCookiesByCategory, getAvailableCategories, applyPreferences } = useCookieManager();

  // Detectar si estamos en rutas de admin
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [tempPreferences, setTempPreferences] = useState<CookiePreferences>(preferences);

  // Detectar si el menú móvil está abierto observando el DOM
  useEffect(() => {
    const checkMobileMenu = () => {
      // El menú móvil añade overflow:hidden al body cuando está abierto
      const isOpen = document.body.style.overflow === 'hidden' && window.innerWidth < 1024;
      setIsMobileMenuOpen(isOpen);
    };

    // Observar cambios en el style del body
    const observer = new MutationObserver(checkMobileMenu);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });

    // También escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkMobileMenu);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkMobileMenu);
    };
  }, []);

  useEffect(() => {
    // No mostrar en admin o si estamos en modo desarrollo y no hay cookies configuradas
    if (isAdminRoute) {
      setIsVisible(false);
      return;
    }

    // Verificar si el usuario ya aceptó las cookies
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      // Mostrar el banner después de 2 segundos
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      // Si ya aceptó, mostrar minimizado
      setIsVisible(true);
      setIsMinimized(true);
    }
  }, [isAdminRoute]);

  // Sincronizar preferencias temporales cuando cambien las reales
  useEffect(() => {
    setTempPreferences(preferences);
  }, [preferences]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    applyPreferences(allAccepted);
    localStorage.setItem('cookiesAccepted', 'true');
    setIsMinimized(true);
    setShowSettings(false);
    setShowDetails(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    applyPreferences(onlyNecessary);
    localStorage.setItem('cookiesAccepted', 'false');
    setIsMinimized(true);
    setShowSettings(false);
    setShowDetails(false);
  };

  const handleSavePreferences = () => {
    applyPreferences(tempPreferences);
    localStorage.setItem('cookiesAccepted', 'custom');
    setIsMinimized(true);
    setShowSettings(false);
    setShowDetails(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleExpand = () => {
    setIsMinimized(false);
    setShowSettings(false);
    setShowDetails(false);
  };

  const handleCategoryToggle = (category: keyof CookiePreferences) => {
    if (category === 'necessary') return; // No se puede desactivar
    
    setTempPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getTexts = () => {
    switch (currentLanguage) {
      case 'es':
        return {
          title: 'Configuración de Cookies',
          message: 'Utilizamos cookies para mejorar tu experiencia. Puedes aceptar todas las cookies o configurar tus preferencias. Las cookies necesarias siempre están activas.',
          acceptAll: 'Aceptar todas',
          rejectAll: 'Solo necesarias',
          savePreferences: 'Guardar preferencias',
          settings: 'Configurar',
          policy: 'Política de Cookies',
          showDetails: 'Ver cookies detectadas',
          hideDetails: 'Ocultar detalles',
          minimizedTitle: 'Cookies',
          changeSettings: 'Cambiar configuración',
          detected: 'detectadas',
          categories: {
            necessary: 'Estrictamente Necesarias',
            functional: 'Funcionales', 
            analytics: 'Analíticas',
            marketing: 'Marketing y Publicidad'
          },
          descriptions: {
            necessary: 'Técnicamente necesarias para el funcionamiento básico del sitio web',
            functional: 'Mejoran la funcionalidad recordando tus preferencias',
            analytics: 'Nos ayudan a analizar el uso del sitio para mejorarlo',
            marketing: 'Se utilizan para mostrarte publicidad personalizada'
          }
        };
      case 'en':
        return {
          title: 'Cookie Settings',
          message: 'We use cookies to improve your experience. You can accept all cookies or configure your preferences. Necessary cookies are always active.',
          acceptAll: 'Accept all',
          rejectAll: 'Only necessary',
          savePreferences: 'Save preferences',
          settings: 'Settings',
          policy: 'Cookies Policy',
          showDetails: 'View detected cookies',
          hideDetails: 'Hide details',
          minimizedTitle: 'Cookies',
          changeSettings: 'Change settings',
          detected: 'detected',
          categories: {
            necessary: 'Strictly Necessary',
            functional: 'Functional',
            analytics: 'Analytics', 
            marketing: 'Marketing & Advertising'
          },
          descriptions: {
            necessary: 'Technically necessary for basic website functionality',
            functional: 'Enhance functionality by remembering your preferences',
            analytics: 'Help us analyze site usage to improve it',
            marketing: 'Used to show you personalized advertising'
          }
        };
      case 'fr':
        return {
          title: 'Paramètres des Cookies',
          message: 'Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez accepter tous les cookies ou configurer vos préférences. Les cookies nécessaires sont toujours actifs.',
          acceptAll: 'Accepter tout',
          rejectAll: 'Seulement nécessaires',
          savePreferences: 'Sauvegarder les préférences',
          settings: 'Paramètres',
          policy: 'Politique des Cookies',
          showDetails: 'Voir les cookies détectés',
          hideDetails: 'Masquer les détails',
          minimizedTitle: 'Cookies',
          changeSettings: 'Modifier les paramètres',
          detected: 'détectés',
          categories: {
            necessary: 'Strictement Nécessaires',
            functional: 'Fonctionnels',
            analytics: 'Analytiques',
            marketing: 'Marketing et Publicité'
          },
          descriptions: {
            necessary: 'Techniquement nécessaires pour le fonctionnement de base du site',
            functional: 'Améliorent la fonctionnalité en mémorisant vos préférences',
            analytics: 'Nous aident à analyser l\'utilisation du site pour l\'améliorer',
            marketing: 'Utilisés pour vous montrer de la publicité personnalisée'
          }
        };
      default: // ca
        return {
          title: 'Configuració de Galetes',
          message: 'Utilitzem galetes per millorar la vostra experiència. Podeu acceptar totes les galetes o configurar les vostres preferències. Les galetes necessàries sempre estan actives.',
          acceptAll: 'Acceptar totes',
          rejectAll: 'Només necessàries',
          savePreferences: 'Guardar preferències',
          settings: 'Configurar',
          policy: 'Política de Galetes',
          showDetails: 'Veure galetes detectades',
          hideDetails: 'Amagar detalls',
          minimizedTitle: 'Galetes',
          changeSettings: 'Canviar configuració',
          detected: 'detectades',
          categories: {
            necessary: 'Estrictament Necessàries',
            functional: 'Funcionals',
            analytics: 'Analítiques',
            marketing: 'Màrqueting i Publicitat'
          },
          descriptions: {
            necessary: 'Tècnicament necessàries pel funcionament bàsic del lloc web',
            functional: 'Milloren la funcionalitat recordant les vostres preferències',
            analytics: 'Ens ajuden a analitzar l\'ús del lloc per millorar-lo',
            marketing: 'S\'utilitzen per mostrar-vos publicitat personalitzada'
          }
        };
    }
  };

  // No mostrar si no es visible, si estamos en admin, o si el menú móvil está abierto
  if (!isVisible || isAdminRoute || isMobileMenuOpen) return null;

  const texts = getTexts();

  // Vista minimizada
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={handleExpand}
          className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-700 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Cookie className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium">{texts.minimizedTitle}</span>
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 shadow-lg max-h-[80vh] overflow-y-auto">
      <div className="container mx-auto p-4">
        {/* Header principal */}
        <div className="flex items-start gap-3 mb-4">
          <Cookie className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-2">
              {texts.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              {texts.message}{' '}
              <Link 
                to={getLocalizedPath('/politica-galetes', currentLanguage)}
                className="text-red-500 hover:text-red-400 underline"
              >
                {texts.policy}
              </Link>
            </p>
            
            {/* Botón para mostrar/ocultar detalles */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm"
            >
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showDetails ? texts.hideDetails : texts.showDetails}
            </button>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detalles de cookies detectadas */}
        {showDetails && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-white font-medium mb-3">Cookies detectadas por categoría:</h4>
            
            {getAvailableCategories().map(category => {
              const cookiesInCategory = getCookiesByCategory(category);
              
              return (
                <div key={category} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">
                      {texts.categories[category]} ({cookiesInCategory.length})
                    </span>
                    <span className="text-xs text-gray-400">
                      {texts.descriptions[category]}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {cookiesInCategory.map(cookie => (
                      <div key={cookie.name} className="bg-gray-700 p-2 rounded text-xs">
                        <div className="text-white font-mono">{cookie.name}</div>
                        <div className="text-gray-400 truncate">{cookie.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Panel de configuración */}
        {showSettings && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg">
            <h4 className="text-white font-medium mb-3">Configurar cookies por categoría:</h4>
            
            {getAvailableCategories().map(category => {
              const cookiesInCategory = getCookiesByCategory(category);
              const isDisabled = category === 'necessary';
              
              return (
                <div key={category} className="flex items-center justify-between mb-3 last:mb-0">
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {texts.categories[category]} ({cookiesInCategory.length})
                      {isDisabled && <span className="text-xs text-gray-400 ml-2">(siempre activas)</span>}
                    </div>
                    <div className="text-xs text-gray-400">
                      {texts.descriptions[category]}
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempPreferences[category]}
                      onChange={() => handleCategoryToggle(category)}
                      disabled={isDisabled}
                      className="sr-only peer"
                    />
                    <div className={`relative w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${
                      isDisabled 
                        ? 'bg-green-600 cursor-not-allowed' 
                        : tempPreferences[category] 
                          ? 'bg-red-500' 
                          : 'bg-gray-600'
                    }`}></div>
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleRejectAll}
            className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-sm"
          >
            {texts.rejectAll}
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            {texts.settings}
          </button>
          
          {showSettings && (
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              {texts.savePreferences}
            </button>
          )}
          
          <button
            onClick={handleAcceptAll}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
          >
            {texts.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
import { useState, useEffect } from 'react';

export interface CookieInfo {
  name: string;
  value: string;
  domain: string;
  category: 'necessary' | 'functional' | 'analytics' | 'marketing';
  description: string;
  expires?: string;
}

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

// Definición de cookies conocidas y su categorización
const KNOWN_COOKIES: Record<string, Omit<CookieInfo, 'value' | 'expires'>> = {
  // Cookies estrictamente necesarias (técnicas) - GDPR permite sin consentimiento
  'JSESSIONID': {
    name: 'JSESSIONID',
    domain: window.location.hostname,
    category: 'necessary',
    description: 'Sesión del servidor para mantener el estado de la aplicación'
  },
  'PHPSESSID': {
    name: 'PHPSESSID', 
    domain: window.location.hostname,
    category: 'necessary',
    description: 'Identificador de sesión PHP para el funcionamiento del sitio'
  },
  'csrf_token': {
    name: 'csrf_token',
    domain: window.location.hostname,
    category: 'necessary',
    description: 'Token de seguridad para prevenir ataques CSRF'
  },
  
  // Cookies funcionales - requieren consentimiento según GDPR
  'selectedLanguage': {
    name: 'selectedLanguage',
    domain: window.location.hostname,
    category: 'functional',
    description: 'Guarda el idioma seleccionado por el usuario'
  },
  'cookiesAccepted': {
    name: 'cookiesAccepted',
    domain: window.location.hostname,
    category: 'functional',
    description: 'Recuerda la decisión sobre cookies del usuario'
  },
  'cookiePreferences': {
    name: 'cookiePreferences',
    domain: window.location.hostname,
    category: 'functional',
    description: 'Guarda las preferencias de cookies del usuario'
  },
  'favorites': {
    name: 'favorites',
    domain: window.location.hostname,
    category: 'functional',
    description: 'Almacena los vehículos marcados como favoritos'
  },
  'searchFilters': {
    name: 'searchFilters',
    domain: window.location.hostname,
    category: 'functional',
    description: 'Recuerda los filtros de búsqueda aplicados'
  },
  'userPreferences': {
    name: 'userPreferences',
    domain: window.location.hostname,
    category: 'functional',
    description: 'Configuraciones personalizadas del usuario'
  },
  
  // Cookies de Google Analytics
  '_ga': {
    name: '_ga',
    domain: '.google-analytics.com',
    category: 'analytics',
    description: 'Distingue usuarios únicos para Google Analytics'
  },
  '_ga_': {
    name: '_ga_',
    domain: '.google-analytics.com', 
    category: 'analytics',
    description: 'Almacena estado de sesión para Google Analytics 4'
  },
  '_gid': {
    name: '_gid',
    domain: '.google-analytics.com',
    category: 'analytics',
    description: 'Distingue usuarios únicos en 24 horas'
  },
  '_gat': {
    name: '_gat',
    domain: '.google-analytics.com',
    category: 'analytics',
    description: 'Limita la velocidad de peticiones de Google Analytics'
  },
  
  // Cookies de marketing/publicidad
  '_fbp': {
    name: '_fbp',
    domain: '.facebook.com',
    category: 'marketing',
    description: 'Pixel de Facebook para seguimiento de conversiones'
  },
  '_gcl_au': {
    name: '_gcl_au',
    domain: '.google.com',
    category: 'marketing',
    description: 'Google AdSense para publicidad personalizada'
  }
};

export const useCookieManager = () => {
  const [detectedCookies, setDetectedCookies] = useState<CookieInfo[]>([]);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Siempre activadas - no requieren consentimiento
    functional: false,
    analytics: false,
    marketing: false
  });

  // Función para obtener todas las cookies del navegador
  const getAllCookies = (): CookieInfo[] => {
    const cookies: CookieInfo[] = [];
    const cookieString = document.cookie;
    
    if (!cookieString) return cookies;
    
    const cookiePairs = cookieString.split(';');
    
    cookiePairs.forEach(pair => {
      const [name, value] = pair.trim().split('=');
      if (name && value) {
        const knownCookie = KNOWN_COOKIES[name];
        if (knownCookie) {
          cookies.push({
            ...knownCookie,
            value: decodeURIComponent(value),
          });
        } else {
          // Cookie desconocida - categorizar como funcional por defecto
          cookies.push({
            name,
            value: decodeURIComponent(value),
            domain: window.location.hostname,
            category: 'functional',
            description: 'Cookie personalizada del sitio web'
          });
        }
      }
    });
    
    return cookies;
  };

  // Función para obtener cookies por categoría
  const getCookiesByCategory = (category: keyof CookiePreferences): CookieInfo[] => {
    return detectedCookies.filter(cookie => cookie.category === category);
  };

  // Función para verificar qué categorías tienen cookies detectadas
  const getAvailableCategories = (): (keyof CookiePreferences)[] => {
    const categories: (keyof CookiePreferences)[] = [];
    
    (['necessary', 'functional', 'analytics', 'marketing'] as const).forEach(category => {
      const cookiesInCategory = getCookiesByCategory(category);
      if (cookiesInCategory.length > 0) {
        categories.push(category);
      }
    });
    
    return categories;
  };

  // Función para eliminar cookies por categoría
  const removeCookiesByCategory = (category: keyof CookiePreferences) => {
    const cookiesToRemove = getCookiesByCategory(category);
    
    cookiesToRemove.forEach(cookie => {
      // Eliminar cookie estableciendo fecha de expiración en el pasado
      document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${cookie.domain}`;
      document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    });
  };

  // Función para aplicar preferencias de cookies
  const applyPreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences));
    
    // Eliminar cookies de categorías desactivadas
    Object.entries(newPreferences).forEach(([category, enabled]) => {
      if (!enabled && category !== 'necessary') {
        removeCookiesByCategory(category as keyof CookiePreferences);
      }
    });
  };

  // Función para verificar si una categoría está permitida
  const isCategoryAllowed = (category: keyof CookiePreferences): boolean => {
    return preferences[category];
  };

  // Función para establecer una cookie solo si está permitida
  const setCookieWithConsent = (
    name: string, 
    value: string, 
    category: keyof CookiePreferences,
    options?: { expires?: Date; path?: string; domain?: string }
  ) => {
    if (!isCategoryAllowed(category)) {
      console.warn(`Cookie ${name} no establecida: categoría ${category} no permitida`);
      return false;
    }
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    if (options?.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    if (options?.path) {
      cookieString += `; path=${options.path}`;
    }
    if (options?.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    document.cookie = cookieString;
    return true;
  };

  // Cargar preferencias guardadas
  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  // Detectar cookies al cargar
  useEffect(() => {
    const interval = setInterval(() => {
      const cookies = getAllCookies();
      setDetectedCookies(cookies);
    }, 1000); // Actualizar cada segundo

    // Detectar inmediatamente
    setDetectedCookies(getAllCookies());

    return () => clearInterval(interval);
  }, []);

  return {
    detectedCookies,
    preferences,
    getCookiesByCategory,
    getAvailableCategories,
    applyPreferences,
    isCategoryAllowed,
    setCookieWithConsent,
    getAllCookies
  };
};
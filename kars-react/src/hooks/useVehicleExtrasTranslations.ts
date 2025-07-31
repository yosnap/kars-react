import { useState, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';

// Cache para las traducciones de extras
let extrasTranslationsCache: Record<string, Record<Language, string>> = {};
let isLoading = false;
let hasLoaded = false;

export const useVehicleExtrasTranslations = () => {
  const { currentLanguage } = useLanguage();
  const [isReady, setIsReady] = useState(false);

  // Cargar traducciones de extras una sola vez
  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      loadExtrasTranslations();
    }
  }, []);

  const loadExtrasTranslations = async () => {
    if (isLoading || hasLoaded) return;
    
    isLoading = true;
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/admin/vehicle-translations`, {
          headers: {
            'Authorization': 'Basic ' + btoa(`${import.meta.env.VITE_API_ADMIN_USER || 'admin'}:${import.meta.env.VITE_API_ADMIN_PASS || 'admin123'}`)
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Convertir array de traducciones a objeto cache
          data.translations?.forEach((translation: any) => {
            extrasTranslationsCache[translation.key] = {
              ca: translation.ca,
              es: translation.es,
              en: translation.en,
              fr: translation.fr
            };
          });
          
          hasLoaded = true;
          setIsReady(true);
        }
      }
    } catch (error) {
      console.warn('No se pudieron cargar las traducciones de extras del servidor:', error);
      hasLoaded = true;
      setIsReady(true);
    } finally {
      isLoading = false;
    }
  };

  // Función para obtener una traducción específica de extras
  const getExtrasTranslation = (key: string): string => {
    // Buscar en cache de extras
    if (extrasTranslationsCache[key] && extrasTranslationsCache[key][currentLanguage]) {
      return extrasTranslationsCache[key][currentLanguage];
    }
    
    // Si no está en cache, devolver la clave como fallback
    return key;
  };

  return {
    getExtrasTranslation,
    isReady,
    currentLanguage
  };
};

export default useVehicleExtrasTranslations;
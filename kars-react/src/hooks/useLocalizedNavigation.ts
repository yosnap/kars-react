import { useNavigate } from 'react-router-dom';
import { useLanguage, getLocalizedPath, type Language } from '../context/LanguageContext';

export const useLocalizedNavigation = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  // Navegación que preserva el idioma actual
  const localizedNavigate = (path: string, options?: { replace?: boolean }) => {
    const localizedPath = getLocalizedPath(path, currentLanguage);
    navigate(localizedPath, options);
  };

  // Generar URL localizada para Link components
  const getLocalizedHref = (path: string, language?: Language) => {
    return getLocalizedPath(path, language || currentLanguage);
  };

  return {
    navigate: localizedNavigate,
    getLocalizedHref,
    currentLanguage
  };
};
import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ca' as Language, name: 'Català', flag: '/flags/ca.png' },
    { code: 'es' as Language, name: 'Español', flag: '/flags/es.svg' },
    { code: 'en' as Language, name: 'English', flag: '/flags/en.svg' },
    { code: 'fr' as Language, name: 'Français', flag: '/flags/fr.svg' }
  ];

  const currentLangInfo = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="flex items-center gap-2 text-sm font-medium">
          <img src={currentLangInfo?.flag} alt={currentLangInfo?.name} className="w-4 h-4 rounded-sm" />
          {currentLangInfo?.name}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentLanguage === language.code 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <img src={language.flag} alt={language.name} className="w-5 h-5 rounded-sm" />
                  <span className="text-sm font-medium">{language.name}</span>
                  {currentLanguage === language.code && (
                    <span className="ml-auto text-red-600 dark:text-red-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
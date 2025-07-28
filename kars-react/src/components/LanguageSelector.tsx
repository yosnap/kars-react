import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'header' | 'sidebar' | 'mobile-carousel';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'header' }) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'ca' as Language, name: 'Català', flag: '/flags/ca.svg' },
    { code: 'es' as Language, name: 'Español', flag: '/flags/es.svg' },
    { code: 'en' as Language, name: 'English', flag: '/flags/en.svg' },
    { code: 'fr' as Language, name: 'Français', flag: '/flags/fr.svg' }
  ];

  const currentLangInfo = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  // Desktop: mostrar todas las banderas directamente
  if (variant === 'header') {
    return (
      <>
        {/* Desktop version */}
        <div className="hidden md:flex items-center gap-2">
          {languages
            .filter(language => language.code !== currentLanguage)
            .map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="p-1.5 rounded-md transition-all hover:bg-gray-800"
                title={language.name}
              >
                <img 
                  src={language.flag} 
                  alt={language.name} 
                  className="w-5 h-5 rounded-sm" 
                />
              </button>
            ))}
        </div>
        
        {/* Mobile version */}
        <div className="relative md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2"
          >
            <img 
              src={currentLangInfo?.flag} 
              alt={currentLangInfo?.name} 
              className="w-5 h-5 rounded-sm" 
            />
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <div className="p-2 grid grid-cols-2 gap-2">
                  {languages
                    .filter(language => language.code !== currentLanguage)
                    .map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors justify-center rounded-md"
                      >
                        <img src={language.flag} alt={language.name} className="w-5 h-5 rounded-sm" />
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // Mobile select version
  if (variant === 'mobile-carousel') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-md transition-all hover:bg-gray-800"
        >
          <img 
            src={currentLangInfo?.flag} 
            alt={currentLangInfo?.name} 
            className="w-5 h-5 rounded-sm" 
          />
          <ChevronDown className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20 min-w-[120px]">
              <div className="p-2">
                {languages
                  .filter(language => language.code !== currentLanguage)
                  .map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-700 transition-colors rounded-md text-white"
                    >
                      <img src={language.flag} alt={language.name} className="w-5 h-5 rounded-sm" />
                      <span className="text-sm font-medium">{language.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Sidebar version
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-4 py-3 text-white hover:text-primary hover:bg-gray-900 rounded-lg transition-all"
      >
        <Globe className="w-5 h-5" />
        <span className="flex items-center gap-2 text-lg font-medium">
          <img src={currentLangInfo?.flag} alt={currentLangInfo?.name} className="w-5 h-5 rounded-sm" />
          {currentLangInfo?.name}
        </span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-50" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute left-0 mt-2 w-full bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-60">
            <div className="py-2">
              {languages
                .filter(language => language.code !== currentLanguage)
                .map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors w-full text-white"
                  >
                    <img src={language.flag} alt={language.name} className="w-5 h-5 rounded-sm" />
                    <span className="text-sm font-medium text-white">{language.name}</span>
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
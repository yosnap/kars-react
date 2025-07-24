import React, { useState } from 'react';
import WysiwygEditor from '../WysiwygEditor';

interface DescriptionsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const DescriptionsStep: React.FC<DescriptionsStepProps> = ({ formData, updateFormData }) => {
  const [activeTab, setActiveTab] = useState('ca');
  
  const languages = [
    { code: 'ca', name: 'Català', flag: '/flags/es_ca.png', required: true },
    { code: 'es', name: 'Español', flag: '/flags/es.svg', required: false },
    { code: 'en', name: 'English', flag: '/flags/en.svg', required: false },
    { code: 'fr', name: 'Français', flag: '/flags/fr.svg', required: false }
  ];

  // Component to render flag (image or emoji)
  const FlagDisplay: React.FC<{ flag: string; alt: string; className?: string }> = ({ flag, alt, className = "w-6 h-4" }) => {
    if (flag.startsWith('/') || flag.startsWith('http')) {
      return (
        <img 
          src={flag} 
          alt={alt} 
          className={`${className} object-cover rounded-sm border border-gray-200 dark:border-gray-600`}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'inline';
          }}
        />
      );
    }
    return <span className="text-lg">{flag}</span>;
  };

  const getFieldName = (code: string) => {
    const mapping: Record<string, string> = {
      'ca': 'descripcioAnunciCA',
      'es': 'descripcioAnunciES', 
      'en': 'descripcioAnunciEN',
      'fr': 'descripcioAnunciFR'
    };
    return mapping[code];
  };

  const getPlaceholder = (code: string) => {
    const placeholders: Record<string, string> = {
      'ca': 'Descripció detallada del vehicle en català...',
      'es': 'Descripción detallada del vehículo en español...',
      'en': 'Detailed vehicle description in English...',
      'fr': 'Description détaillée du véhicule en français...'
    };
    return placeholders[code];
  };

  const handleEditorChange = (langCode: string, content: string) => {
    const fieldName = getFieldName(langCode);
    updateFormData({ [fieldName]: content });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Descripcions en diferents idiomes
      </h3>
      
      {/* Language Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {languages.map((lang) => {
            const fieldName = getFieldName(lang.code);
            const hasContent = formData[fieldName] && formData[fieldName].trim().length > 0;
            
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveTab(lang.code)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === lang.code
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FlagDisplay flag={lang.flag} alt={`${lang.name} flag`} />
                <span>{lang.name}</span>
                {lang.required && <span className="text-red-500">*</span>}
                {hasContent && (
                  <span className="inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {languages.map((lang) => {
          if (activeTab !== lang.code) return null;
          
          const fieldName = getFieldName(lang.code);
          
          return (
            <div key={lang.code} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FlagDisplay flag={lang.flag} alt={`${lang.name} flag`} className="w-8 h-6" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {lang.name}
                  {lang.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
              </div>
              
              {/* WYSIWYG Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text enriquit
                </label>
                <WysiwygEditor
                  content={formData[fieldName] || ''}
                  onChange={(content) => handleEditorChange(lang.code, content)}
                  placeholder={getPlaceholder(lang.code)}
                  id={`editor-${lang.code}`}
                />
                
                {/* Character count */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {(formData[fieldName] || '').replace(/<[^>]*>/g, '').length} caràcters (sense etiquetes HTML)
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Notes Section */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm p-6 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
            <span className="text-amber-600 dark:text-amber-400 text-lg">📝</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              Notes Internes
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Informació interna per al seguiment del vehicle (no es mostra públicament)
            </p>
          </div>
        </div>
        
        <WysiwygEditor
          content={formData.notesInternes || ''}
          onChange={(content) => updateFormData({ notesInternes: content })}
          placeholder="Escriu notes internes sobre el vehicle, seguiment de tasques, etc..."
          id="notes-internes"
          showDateButton={true}
        />
      </div>
    </div>
  );
};

export default DescriptionsStep;
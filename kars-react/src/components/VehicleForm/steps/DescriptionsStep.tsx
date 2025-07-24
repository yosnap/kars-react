import React, { useState } from 'react';

interface DescriptionsStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const DescriptionsStep: React.FC<DescriptionsStepProps> = ({ formData, updateFormData }) => {
  const [activeTab, setActiveTab] = useState('ca');
  
  const languages = [
    { code: 'ca', name: 'Català', flag: '🏴󠁣󠁯󠁣󠁡󠁿', required: true },
    { code: 'es', name: 'Español', flag: '🇪🇸', required: false },
    { code: 'en', name: 'English', flag: '🇬🇧', required: false },
    { code: 'fr', name: 'Français', flag: '🇫🇷', required: false }
  ];

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

  const handleToolbarAction = (action: string, langCode: string) => {
    const textarea = document.getElementById(`textarea-${langCode}`) as HTMLTextAreaElement;
    const fieldName = getFieldName(langCode);
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      let newText = '';
      
      switch (action) {
        case 'bold':
          newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
          break;
        case 'italic':
          newText = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end);
          break;
        case 'list':
          newText = textarea.value.substring(0, start) + `\n- ${selectedText}` + textarea.value.substring(end);
          break;
        default:
          return;
      }
      
      updateFormData({ [fieldName]: newText });
      
      // Restore focus and cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
      }, 0);
    }
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
                <span>{lang.flag}</span>
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
                <span className="text-2xl">{lang.flag}</span>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {lang.name}
                  {lang.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
              </div>
              
              {/* Rich Text Editor Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text enriquit
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  {/* Simple toolbar */}
                  <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => handleToolbarAction('bold', lang.code)}
                      className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToolbarAction('italic', lang.code)}
                      className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToolbarAction('list', lang.code)}
                      className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <span>Lista</span>
                    </button>
                  </div>
                  
                  {/* Text area */}
                  <textarea
                    id={`textarea-${lang.code}`}
                    rows={8}
                    value={formData[fieldName] || ''}
                    onChange={(e) => updateFormData({ [fieldName]: e.target.value })}
                    placeholder={getPlaceholder(lang.code)}
                    className="w-full p-3 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                {/* Character count */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {(formData[fieldName] || '').length} caràcters
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DescriptionsStep;
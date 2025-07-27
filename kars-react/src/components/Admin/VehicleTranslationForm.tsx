import React, { useState, useEffect } from 'react';
import { X, Save, Type, Tag, Info } from 'lucide-react';

interface VehicleTranslation {
  id: string;
  key: string;
  category: 'technical' | 'features' | 'commercial' | 'general';
  ca: string;
  es: string;
  en: string;
  fr: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface VehicleTranslationCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface VehicleTranslationFormProps {
  translation: VehicleTranslation | null;
  categories: VehicleTranslationCategory[];
  onSave: (translation: Omit<VehicleTranslation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function VehicleTranslationForm({ 
  translation, 
  categories, 
  onSave, 
  onCancel 
}: VehicleTranslationFormProps) {
  const [formData, setFormData] = useState<{
    key: string;
    category: 'technical' | 'features' | 'commercial' | 'general';
    ca: string;
    es: string;
    en: string;
    fr: string;
    description: string;
  }>({
    key: '',
    category: 'general',
    ca: '',
    es: '',
    en: '',
    fr: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (translation) {
      setFormData({
        key: translation.key,
        category: translation.category,
        ca: translation.ca,
        es: translation.es,
        en: translation.en,
        fr: translation.fr,
        description: translation.description || ''
      });
    }
  }, [translation]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.key.trim()) {
      newErrors.key = 'La clau és obligatòria';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.key)) {
      newErrors.key = 'La clau només pot contenir lletres, números, punts, guions i guions baixos';
    }

    if (!formData.ca.trim()) {
      newErrors.ca = 'La traducció en català és obligatòria';
    }

    if (!formData.es.trim()) {
      newErrors.es = 'La traducció en espanyol és obligatòria';
    }

    if (!formData.en.trim()) {
      newErrors.en = 'La traducció en anglès és obligatòria';
    }

    if (!formData.fr.trim()) {
      newErrors.fr = 'La traducció en francès és obligatòria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving translation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Type className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {translation ? 'Editar Traducció' : 'Afegir Nova Traducció'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestiona les traduccions per a les fitxes de vehicles
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Key and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                  <Tag className="w-4 h-4" />
                  Clau de traducció *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => handleChange('key', e.target.value)}
                  placeholder="vehicle.engine"
                  className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono ${
                    errors.key ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.key && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.key}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Utilitza punts per jerarquia (ex: vehicle.technical.engine)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Categoria
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {categories.find(c => c.id === formData.category)?.description}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                <Info className="w-4 h-4" />
                Descripció (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripció del propòsit d'aquesta traducció..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              />
            </div>

            {/* Translations */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Traduccions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Catalan */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <span className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                      <span className="text-xs text-white font-bold">CA</span>
                    </span>
                    Català *
                  </label>
                  <textarea
                    value={formData.ca}
                    onChange={(e) => handleChange('ca', e.target.value)}
                    placeholder="Text en català..."
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                      errors.ca ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.ca && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ca}</p>
                  )}
                </div>

                {/* Spanish */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <span className="w-6 h-4 bg-yellow-500 rounded-sm flex items-center justify-center">
                      <span className="text-xs text-white font-bold">ES</span>
                    </span>
                    Espanyol *
                  </label>
                  <textarea
                    value={formData.es}
                    onChange={(e) => handleChange('es', e.target.value)}
                    placeholder="Texto en español..."
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                      errors.es ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.es && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.es}</p>
                  )}
                </div>

                {/* English */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <span className="w-6 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                      <span className="text-xs text-white font-bold">EN</span>
                    </span>
                    Anglès *
                  </label>
                  <textarea
                    value={formData.en}
                    onChange={(e) => handleChange('en', e.target.value)}
                    placeholder="Text in English..."
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                      errors.en ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.en && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.en}</p>
                  )}
                </div>

                {/* French */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                    <span className="w-6 h-4 bg-purple-500 rounded-sm flex items-center justify-center">
                      <span className="text-xs text-white font-bold">FR</span>
                    </span>
                    Francès *
                  </label>
                  <textarea
                    value={formData.fr}
                    onChange={(e) => handleChange('fr', e.target.value)}
                    placeholder="Texte en français..."
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none ${
                      errors.fr ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.fr && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fr}</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel·lar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardant...' : (translation ? 'Actualitzar' : 'Crear')}
          </button>
        </div>
      </div>
    </div>
  );
}
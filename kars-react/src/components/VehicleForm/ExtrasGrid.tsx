import React from 'react';
import ExtraButton from './ExtraButton';

interface Extra {
  id: string;
  name: string;
  slug: string;
}

interface ExtrasGridProps {
  extras: Extra[];
  selectedExtras: string[];
  onToggleExtra: (extra: Extra) => void;
  title: string;
}

// Mapeo de slugs antiguos a nuevos para mantener compatibilidad
const mapOldSlugToNew = (oldSlug: string): string => {
  const slugMapping: Record<string, string> = {
    // Airbags
    'airbag-passatger': 'airbag-copilot',
    'airbags-cortina': 'airbag-cortina',
    'airbags-laterals': 'airbag-lateral',
    
    // Detección y sensores
    'avis-angle-mort': 'detector-d-angle-mort',
    'camara-visio-posterior': 'camera-de-visio-trasera',
    'sensors-anti-colisio': 'sistema-de-frenada-d-emergencia',
    'sensors-llums': 'llums-automatics',
    'sensors-pluja': 'sensors-de-parquing-davant', // usar sensor diferente
    
    // Conectividad (usar extras diferentes para cada uno)
    'connexio-internet': 'connexio-usb',
    'connexio-mp3-ipod': 'android-auto', // usar Android Auto
    'connexio-telefon': 'apple-carplay', // usar Apple CarPlay
    
    // Asistencia
    'assist-per-canvi-carril': 'assistencia-de-manteniment-de-carril',
    'avisador-sortida-carril': 'avisador-sortida-carril', // ya existe igual
    
    // Control (usar extras diferentes para cada uno)
    'control-descens': 'descens-controlat',
    'control-estabilitat': 'esp',
    'control-traccio': 'sistema-antiarrossegament', // usar sistema antiarrastre
    'cruise-control': 'control-de-creuer-adaptatiu',
    
    // Mecánica
    'direccio-assistida': 'volant-ajustable-electricament',
    'llandes-aliatge': 'jantes-d-aliatge',
    
    // Iluminación (usar extras diferentes para cada uno)
    'llums-adaptatives': 'llums-adaptatius',
    'llums-antiboira': 'llums-led-darrera', // usar luces LED traseras
    'llums-de-dia': 'llums-de-dia-led',
    'fars-led': 'llums-led-davant', // usar luces LED delanteras
    
    // Tecnología
    'gps': 'sistema-de-navegacio-gps',
    'ordinador-de-bord': 'pantalla-tactil',
    
    // Otros (usar extras diferentes para cada uno)
    'pintura-metalitzada': 'tapisseria-de-cuir', // usar tapicería de cuero
    'radio-cd': 'sistema-de-so-premium', // mantener sistema de sonido premium
    'retrovisors-electrics': 'retols-electrics',
    'sostre-obert': 'sostre-convertible',
    'tanca-centralitzada': 'entrada-sense-clau',
    'vidres-tintats': 'finestres-electriques-darrera', // usar ventanas traseras
    'vidres-electrics': 'finestres-electriques-davant' // usar ventanas delanteras
  };
  
  return slugMapping[oldSlug] || oldSlug;
};

// Función para categorizar extras
const categorizeExtras = (extras: Extra[]) => {
  const categories = {
    safety: [] as Extra[],
    comfort: [] as Extra[],
    technology: [] as Extra[],
    audio: [] as Extra[],
    lighting: [] as Extra[],
    assistance: [] as Extra[],
    mechanical: [] as Extra[],
    habitacle: [] as Extra[],
    motorcycle: [] as Extra[],
    others: [] as Extra[]
  };

  extras.forEach(extra => {
    const slug = extra.slug.toLowerCase();
    
    // Seguridad
    if (slug.includes('abs') || slug.includes('esp') || slug.includes('airbag') || 
        slug.includes('alarma') || slug.includes('immobilitzador') || 
        slug.includes('control-estabilitat') || slug.includes('control-traccio')) {
      categories.safety.push(extra);
    }
    // Confort y climatización
    else if (slug.includes('aire') || slug.includes('climatitzador') || 
             slug.includes('calefaccio') || slug.includes('sostre')) {
      categories.comfort.push(extra);
    }
    // Tecnología y conectividad
    else if (slug.includes('bluetooth') || slug.includes('wifi') || slug.includes('gps') || 
             slug.includes('navegador') || slug.includes('ordinador') || slug.includes('pantalla') || 
             slug.includes('usb') || slug.includes('conexio')) {
      categories.technology.push(extra);
    }
    // Audio y entretenimiento
    else if (slug.includes('radio') || slug.includes('cd') || slug.includes('mp3') || 
             slug.includes('audio') || slug.includes('altaveus') || slug.includes('handfree')) {
      categories.audio.push(extra);
    }
    // Iluminación
    else if (slug.includes('faros') || slug.includes('llums') || slug.includes('led') || 
             slug.includes('xenon') || slug.includes('adapatius')) {
      categories.lighting.push(extra);
    }
    // Asistencia al conductor
    else if (slug.includes('control-creuer') || slug.includes('sensor') || 
             slug.includes('camera') || slug.includes('assistencia') || slug.includes('aparcament')) {
      categories.assistance.push(extra);
    }
    // Mecánica
    else if (slug.includes('direccio') || slug.includes('turbo') || slug.includes('llantes') || 
             slug.includes('suspensio') || slug.includes('elevador') || slug.includes('retrovisors') || 
             slug.includes('seients')) {
      categories.mechanical.push(extra);
    }
    // Habitáculo (autocaravanas)
    else if (slug.includes('cuina') || slug.includes('nevera') || slug.includes('dutxa') || 
             slug.includes('wc') || slug.includes('tv') || slug.includes('llit') || 
             slug.includes('cafetera') || slug.includes('aigua')) {
      categories.habitacle.push(extra);
    }
    // Motos específicos
    else if (slug.includes('maletes') || slug.includes('pantalla-vent') || 
             slug.includes('windshield') || slug.includes('puny')) {
      categories.motorcycle.push(extra);
    }
    // Otros
    else {
      categories.others.push(extra);
    }
  });

  return categories;
};


const ExtrasGrid: React.FC<ExtrasGridProps> = ({ extras, selectedExtras, onToggleExtra, title }) => {
  const categories = categorizeExtras(extras);
  
  // Filtrar valores inválidos una sola vez para reutilizar
  const validSelectedExtras = selectedExtras.filter(e => e && e !== 'on');
  
  // Función para verificar si un extra está seleccionado
  const isExtraSelected = (extra: Extra): boolean => {
    // Comparar directamente por slug
    const isDirectMatch = validSelectedExtras.includes(extra.slug);
    
    // Si no hay coincidencia directa, buscar por mapeo inverso
    // (buscar si algún slug antiguo mapea al slug actual)
    const isReverseMatch = validSelectedExtras.some(oldSlug => 
      mapOldSlugToNew(oldSlug) === extra.slug
    );
    
    return isDirectMatch || isReverseMatch;
  };



  // Configuración de categorías con nombres en catalán
  const categoryConfig = [
    { key: 'safety', name: 'Seguretat', icon: '🛡️', items: categories.safety },
    { key: 'comfort', name: 'Confort', icon: '❄️', items: categories.comfort },
    { key: 'technology', name: 'Tecnologia', icon: '📱', items: categories.technology },
    { key: 'audio', name: 'Audio i Entreteniment', icon: '🎵', items: categories.audio },
    { key: 'lighting', name: 'Il·luminació', icon: '💡', items: categories.lighting },
    { key: 'assistance', name: 'Assistència', icon: '🚗', items: categories.assistance },
    { key: 'mechanical', name: 'Mecànica', icon: '⚙️', items: categories.mechanical },
    { key: 'habitacle', name: 'Habitacle', icon: '🏠', items: categories.habitacle },
    { key: 'motorcycle', name: 'Moto Específics', icon: '🏍️', items: categories.motorcycle },
    { key: 'others', name: 'Altres', icon: '⭐', items: categories.others }
  ].filter(category => category.items.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {validSelectedExtras.length > 0 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {validSelectedExtras.length} seleccionats
          </span>
        )}
      </div>

      {categoryConfig.map(category => (
        <div key={category.key} className="space-y-4">
          <h4 className="flex items-center gap-2 text-lg font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
            <span>{category.icon}</span>
            {category.name}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({category.items.length})
            </span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {category.items.map(extra => (
              <div key={extra.id} className="relative">
                <ExtraButton
                  extra={extra}
                  isSelected={isExtraSelected(extra)}
                  onToggle={() => onToggleExtra(extra)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Resumen de extras seleccionados */}
      {validSelectedExtras.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
            Resum d'extras seleccionats
          </h4>
          <div className="flex flex-wrap gap-2">
            {validSelectedExtras.map((extraSlug, index) => {
              const extraData = extras.find(e => e.slug === extraSlug);
              return (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                >
                  {extraData ? extraData.name : extraSlug}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtrasGrid;
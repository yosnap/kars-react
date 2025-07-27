/**
 * SISTEMA DE MAPEO DE VALORES PARA VEHÍCULOS
 * 
 * Este archivo contiene todos los mapeos de valores de base de datos a traducciones.
 * 
 * DIFERENCIA ENTRE CLAVES Y VALORES:
 * - CLAVES (labels): Son etiquetas como "Marca", "Modelo", "Tipo" → Se traducen en useVehicleTranslations
 * - VALORES (data): Son datos como "cotxe", "moto", "benzina" → Se traducen aquí
 * 
 * IMPORTANTE: Los valores de la base de datos NO deben cambiarse ya que se usan para:
 * - Filtros de búsqueda
 * - Lógica del sistema  
 * - Consistencia de datos
 * 
 * Solo se traduce la PRESENTACIÓN al usuario, no los datos internos.
 */

import { Language } from '../context/LanguageContext';

export interface ValueMapping {
  ca: string;
  es: string;
  en: string;
  fr: string;
}

export type ValueMappings = Record<string, ValueMapping>;

/**
 * TIPOS DE VEHÍCULO
 * Valores de BD: cotxe, moto, autocaravana-camper, comercial
 */
export const vehicleTypeValues: ValueMappings = {
  'cotxe': {
    ca: 'Cotxe',
    es: 'Coche',
    en: 'Car',
    fr: 'Voiture'
  },
  'moto': {
    ca: 'Moto',
    es: 'Moto',
    en: 'Motorcycle',
    fr: 'Moto'
  },
  'moto-quad-atv': {
    ca: 'Moto/Quad/ATV',
    es: 'Moto/Quad/ATV',
    en: 'Motorcycle/Quad/ATV',
    fr: 'Moto/Quad/ATV'
  },
  'autocaravana-camper': {
    ca: 'Autocaravana/Camper',
    es: 'Autocaravana/Camper',
    en: 'Motorhome/Camper',
    fr: 'Camping-car'
  },
  'comercial': {
    ca: 'Comercial',
    es: 'Comercial',
    en: 'Commercial',
    fr: 'Utilitaire'
  }
};

/**
 * TIPOS DE COMBUSTIBLE
 * Valores de BD: benzina, diesel, electric, hibrid, etc.
 */
export const fuelTypeValues: ValueMappings = {
  'benzina': {
    ca: 'Benzina',
    es: 'Gasolina',
    en: 'Gasoline',
    fr: 'Essence'
  },
  'diesel': {
    ca: 'Dièsel',
    es: 'Diésel',
    en: 'Diesel',
    fr: 'Diesel'
  },
  'electric': {
    ca: 'Elèctric',
    es: 'Eléctrico',
    en: 'Electric',
    fr: 'Électrique'
  },
  'hibrid': {
    ca: 'Híbrid',
    es: 'Híbrido',
    en: 'Hybrid',
    fr: 'Hybride'
  },
  'hibrid-endollable': {
    ca: 'Híbrid endollable',
    es: 'Híbrido enchufable',
    en: 'Plug-in hybrid',
    fr: 'Hybride rechargeable'
  },
  'gas-natural': {
    ca: 'Gas natural',
    es: 'Gas natural',
    en: 'Natural gas',
    fr: 'Gaz naturel'
  },
  'glp': {
    ca: 'GLP',
    es: 'GLP',
    en: 'LPG',
    fr: 'GPL'
  }
};

/**
 * TIPOS DE TRANSMISIÓN
 * Valores de BD: manual, automatic, auto-sequencial, etc.
 */
export const transmissionTypeValues: ValueMappings = {
  'manual': {
    ca: 'Manual',
    es: 'Manual',
    en: 'Manual',
    fr: 'Manuelle'
  },
  'automatic': {
    ca: 'Automàtic',
    es: 'Automático',
    en: 'Automatic',
    fr: 'Automatique'
  },
  'auto-sequencial': {
    ca: 'Auto-Seqüencial',
    es: 'Auto-Secuencial',
    en: 'Auto-Sequential',
    fr: 'Auto-Séquentiel'
  },
  'cvt': {
    ca: 'CVT',
    es: 'CVT',
    en: 'CVT',
    fr: 'CVT'
  }
};

/**
 * ESTADOS DEL VEHÍCULO
 * Valores de BD: nou, ocasio, km0-gerencia, etc.
 */
export const vehicleStateValues: ValueMappings = {
  'nou': {
    ca: 'Nou',
    es: 'Nuevo',
    en: 'New',
    fr: 'Neuf'
  },
  'ocasio': {
    ca: 'Ocasió',
    es: 'Ocasión',
    en: 'Used',
    fr: 'Occasion'
  },
  'km0': {
    ca: 'Km 0',
    es: 'Km 0',
    en: 'Km 0',
    fr: 'Km 0'
  },
  'km0-gerencia': {
    ca: 'Km 0 (Gerència)',
    es: 'Km 0 (Gerencia)',
    en: 'Km 0 (Management)',
    fr: 'Km 0 (Direction)'
  },
  'demo': {
    ca: 'Demostració',
    es: 'Demostración',
    en: 'Demo',
    fr: 'Démonstration'
  },
  'seminnou': {
    ca: 'Seminnou',
    es: 'Seminuevo',
    en: 'Pre-owned',
    fr: 'Quasi-neuf'
  },
  'seminou': {
    ca: 'Seminnou',
    es: 'Seminuevo',
    en: 'Pre-owned',
    fr: 'Quasi-neuf'
  }
};

/**
 * TIPOS DE TRACCIÓN
 * Valores de BD: delantera, trasera, integral, etc.
 */
export const tractionTypeValues: ValueMappings = {
  'delantera': {
    ca: 'Delantera',
    es: 'Delantera',
    en: 'Front-wheel drive',
    fr: 'Traction avant'
  },
  'trasera': {
    ca: 'Trasera',
    es: 'Trasera',
    en: 'Rear-wheel drive',
    fr: 'Propulsion arrière'
  },
  'darrere': {
    ca: 'Darrere',
    es: 'Trasera',
    en: 'Rear-wheel drive',
    fr: 'Propulsion arrière'
  },
  'integral': {
    ca: 'Integral',
    es: 'Integral',
    en: 'All-wheel drive',
    fr: 'Transmission intégrale'
  },
  '4x4': {
    ca: '4x4',
    es: '4x4',
    en: '4x4',
    fr: '4x4'
  }
};

/**
 * VALORES BOOLEANOS COMUNES
 * Para campos como climatització, vehicle-fumador, etc.
 */
export const booleanValues: ValueMappings = {
  'true': {
    ca: 'Sí',
    es: 'Sí',
    en: 'Yes',
    fr: 'Oui'
  },
  'false': {
    ca: 'No',
    es: 'No',
    en: 'No',
    fr: 'Non'
  }
};

/**
 * TIPOS DE CARROCERÍA Y ESPECÍFICOS
 * Para valores como carrocería, colores, etc.
 */
export const bodyworkValues: ValueMappings = {
  'familiar': {
    ca: 'Familiar',
    es: 'Familiar',
    en: 'Estate',
    fr: 'Break'
  },
  'sedan': {
    ca: 'Sedán',
    es: 'Sedán',
    en: 'Sedan',
    fr: 'Berline'
  },
  'suv': {
    ca: 'SUV',
    es: 'SUV',
    en: 'SUV',
    fr: 'SUV'
  },
  'coupe': {
    ca: 'Cupè',
    es: 'Coupé',
    en: 'Coupe',
    fr: 'Coupé'
  },
  'berlina': {
    ca: 'Berlina',
    es: 'Berlina',
    en: 'Sedan',
    fr: 'Berline'
  }
};

/**
 * COLORES COMUNES
 */
export const colorValues: ValueMappings = {
  'blanc': {
    ca: 'Blanc',
    es: 'Blanco',
    en: 'White',
    fr: 'Blanc'
  },
  'negre': {
    ca: 'Negre',
    es: 'Negro',
    en: 'Black',
    fr: 'Noir'
  },
  'blau': {
    ca: 'Blau',
    es: 'Azul',
    en: 'Blue',
    fr: 'Bleu'
  },
  'vermell': {
    ca: 'Vermell',
    es: 'Rojo',
    en: 'Red',
    fr: 'Rouge'
  },
  'gris': {
    ca: 'Gris',
    es: 'Gris',
    en: 'Gray',
    fr: 'Gris'
  },
  'plata': {
    ca: 'Plata',
    es: 'Plata',
    en: 'Silver',
    fr: 'Argent'
  },
  'platejat': {
    ca: 'Platejat',
    es: 'Plateado',
    en: 'Silver',
    fr: 'Argenté'
  },
  'groc': {
    ca: 'Groc',
    es: 'Amarillo',
    en: 'Yellow',
    fr: 'Jaune'
  },
  'verd': {
    ca: 'Verd',
    es: 'Verde',
    en: 'Green',
    fr: 'Vert'
  },
  'taronja': {
    ca: 'Taronja',
    es: 'Naranja',
    en: 'Orange',
    fr: 'Orange'
  },
  'violeta': {
    ca: 'Violeta',
    es: 'Violeta',
    en: 'Purple',
    fr: 'Violet'
  },
  'marró': {
    ca: 'Marró',
    es: 'Marrón',
    en: 'Brown',
    fr: 'Marron'
  },
  'beix': {
    ca: 'Beix',
    es: 'Beige',
    en: 'Beige',
    fr: 'Beige'
  },
  'or': {
    ca: 'Or',
    es: 'Dorado',
    en: 'Gold',
    fr: 'Or'
  }
};

/**
 * VALORES ESPECÍFICOS DE VEHÍCULOS
 * Para valores como "Accepta", origen, etc.
 */
export const specificValues: ValueMappings = {
  'accepta': {
    ca: 'Accepta',
    es: 'Acepta',
    en: 'Accepts',
    fr: 'Accepte'
  },
  'espanya': {
    ca: 'Espanya',
    es: 'España',
    en: 'Spain',
    fr: 'Espagne'
  },
  'frança': {
    ca: 'França',
    es: 'Francia',
    en: 'France',
    fr: 'France'
  },
  'alemanya': {
    ca: 'Alemanya',
    es: 'Alemania',
    en: 'Germany',
    fr: 'Allemagne'
  },
  'italia': {
    ca: 'Itàlia',
    es: 'Italia',
    en: 'Italy',
    fr: 'Italie'
  },
  'andorra': {
    ca: 'Andorra',
    es: 'Andorra',
    en: 'Andorra',
    fr: 'Andorre'
  }
};

/**
 * FUNCIÓN PRINCIPAL PARA TRADUCIR VALORES
 * 
 * @param value - Valor de la base de datos (ej: "cotxe", "benzina")
 * @param category - Categoría del valor (ej: "vehicleType", "fuelType")
 * @param language - Idioma objetivo
 * @returns Valor traducido o valor original si no se encuentra traducción
 */
export const translateValue = (
  value: string, 
  category: keyof typeof valueMappingCategories, 
  language: Language
): string => {
  if (!value) return '';
  
  const categoryMappings = valueMappingCategories[category];
  if (!categoryMappings) return value;
  
  const mapping = categoryMappings[value.toLowerCase()];
  if (!mapping) return value;
  
  return mapping[language] || value;
};

/**
 * REGISTRO DE TODAS LAS CATEGORÍAS
 * Facilita el acceso programático a todos los mapeos
 */
export const valueMappingCategories = {
  vehicleType: vehicleTypeValues,
  fuelType: fuelTypeValues,
  transmission: transmissionTypeValues,
  vehicleState: vehicleStateValues,
  traction: tractionTypeValues,
  bodywork: bodyworkValues,
  color: colorValues,
  boolean: booleanValues,
  specific: specificValues
} as const;

/**
 * FUNCIÓN HELPER PARA TRADUCIR VALORES BOOLEANOS
 * Convierte "true"/"false" o true/false a texto traducido
 */
export const translateBoolean = (value: string | boolean, language: Language): string => {
  const boolStr = String(value).toLowerCase();
  return translateValue(boolStr, 'boolean', language);
};

/**
 * TIPOS DISPONIBLES PARA TYPESCRIPT
 */
export type ValueCategory = keyof typeof valueMappingCategories;

/**
 * DOCUMENTACIÓN DE USO:
 * 
 * // Ejemplos de uso:
 * translateValue('cotxe', 'vehicleType', 'es') // → "Coche"
 * translateValue('benzina', 'fuelType', 'en') // → "Gasoline" 
 * translateBoolean(true, 'fr') // → "Oui"
 * 
 * // En componentes:
 * const vehicleTypeText = translateValue(vehicle.tipusVehicle, 'vehicleType', currentLanguage);
 */
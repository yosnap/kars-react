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
 * DATOS SINCRONIZADOS CON EL INSTALLER
 */
export const fuelTypeValues: ValueMappings = {
  'altres': {
    ca: 'Altres',
    es: 'Otros',
    en: 'Others',
    fr: 'Autres'
  },
  'benzina': {
    ca: 'Benzina',
    es: 'Gasolina',
    en: 'Gasoline',
    fr: 'Essence'
  },
  'biocombustible': {
    ca: 'Biocombustible',
    es: 'Biocombustible',
    en: 'Biofuel',
    fr: 'Biocarburant'
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
  'electric-combustible': {
    ca: 'Elèctric + Combustible',
    es: 'Eléctrico + Combustible',
    en: 'Electric + Fuel',
    fr: 'Électrique + Carburant'
  },
  'gas-natural-gnc': {
    ca: 'Gas Natural',
    es: 'Gas Natural',
    en: 'Natural Gas',
    fr: 'Gaz Naturel'
  },
  'gas-natural': {
    ca: 'Gas natural',
    es: 'Gas natural',
    en: 'Natural gas',
    fr: 'Gaz naturel'
  },
  'gas-liquat-glp': {
    ca: 'GLP',
    es: 'GLP',
    en: 'LPG',
    fr: 'GPL'
  },
  'glp': {
    ca: 'GLP',
    es: 'GLP',
    en: 'LPG',
    fr: 'GPL'
  },
  'hibrid': {
    ca: 'Híbrid',
    es: 'Híbrido',
    en: 'Hybrid',
    fr: 'Hybride'
  },
  'hibrid-endollable': {
    ca: 'Híbrid Endollable',
    es: 'Híbrido Enchufable',
    en: 'Plug-in Hybrid',
    fr: 'Hybride Rechargeable'
  },
  'hidrogen': {
    ca: 'Hidrògen',
    es: 'Hidrógeno',
    en: 'Hydrogen',
    fr: 'Hydrogène'
  },
  'solar': {
    ca: 'Solar',
    es: 'Solar',
    en: 'Solar',
    fr: 'Solaire'
  },
  'solar-hibrid': {
    ca: 'Solar + Combustible',
    es: 'Solar + Combustible',
    en: 'Solar + Fuel',
    fr: 'Solaire + Carburant'
  }
};

/**
 * TIPOS DE TRANSMISIÓN
 * Valores de BD: manual, automatic, auto-sequencial, etc.
 * DATOS SINCRONIZADOS CON EL INSTALLER
 */
export const transmissionTypeValues: ValueMappings = {
  'auto-sequencial': {
    ca: 'Auto-Seqüencial',
    es: 'Auto-Secuencial',
    en: 'Auto-Sequential',
    fr: 'Auto-Séquentielle'
  },
  'automatic': {
    ca: 'Automàtic',
    es: 'Automático',
    en: 'Automatic',
    fr: 'Automatique'
  },
  'automatica': {
    ca: 'Automàtica',
    es: 'Automática',
    en: 'Automatic',
    fr: 'Automatique'
  },
  'geartronic': {
    ca: 'Geartronic',
    es: 'Geartronic',
    en: 'Geartronic',
    fr: 'Geartronic'
  },
  'manual': {
    ca: 'Manual',
    es: 'Manual',
    en: 'Manual',
    fr: 'Manuel'
  },
  'semi-automatic': {
    ca: 'Semi-Automàtic',
    es: 'Semi-Automático',
    en: 'Semi-Automatic',
    fr: 'Semi-Automatique'
  },
  'semiautomatica': {
    ca: 'Semiautomàtica',
    es: 'Semiautomática',
    en: 'Semi-automatic',
    fr: 'Semi-automatique'
  },
  'sequencial': {
    ca: 'Seqüencial',
    es: 'Secuencial',
    en: 'Sequential',
    fr: 'Séquentielle'
  },
  'cvt': {
    ca: 'CVT',
    es: 'CVT',
    en: 'CVT',
    fr: 'CVT'
  },
  'tiptronic': {
    ca: 'Tiptronic',
    es: 'Tiptronic',
    en: 'Tiptronic',
    fr: 'Tiptronic'
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
 * TIPOS DE CARROCERÍA PARA COCHES
 * DATOS SINCRONIZADOS CON EL INSTALLER
 */
export const bodyworkValues: ValueMappings = {
  'utilitari-petit': {
    ca: 'Utilitari Petit',
    es: 'Utilitario Pequeño',
    en: 'Small City Car',
    fr: 'Petite Citadine'
  },
  'turisme-mig': {
    ca: 'Turisme Mig',
    es: 'Turismo Medio',
    en: 'Mid-size Car',
    fr: 'Berline Compacte'
  },
  'sedan': {
    ca: 'Sedan-Berlina',
    es: 'Sedán-Berlina',
    en: 'Sedan',
    fr: 'Berline'
  },
  'berlina': {
    ca: 'Sedan-Berlina',
    es: 'Sedán-Berlina',
    en: 'Sedan',
    fr: 'Berline'
  },
  'coupe': {
    ca: 'Coupé',
    es: 'Coupé',
    en: 'Coupe',
    fr: 'Coupé'
  },
  'gran-turisme': {
    ca: 'Gran Turisme',
    es: 'Gran Turismo',
    en: 'Grand Tourer',
    fr: 'Grand Tourisme'
  },
  'familiar': {
    ca: 'Familiar',
    es: 'Familiar',
    en: 'Station Wagon',
    fr: 'Break'
  },
  'suv': {
    ca: 'SUV',
    es: 'SUV',
    en: 'SUV',
    fr: 'SUV'
  },
  '4x4': {
    ca: '4x4 Tot Terreny',
    es: '4x4 Todo Terreno',
    en: '4x4 Off-Road',
    fr: '4x4 Tout-Terrain'
  },
  'monovolum': {
    ca: 'Monovolum',
    es: 'Monovolumen',
    en: 'MPV',
    fr: 'Monospace'
  },
  'furgo-passatgers': {
    ca: 'Furgoneta passatgers',
    es: 'Furgoneta de pasajeros',
    en: 'Passenger Van',
    fr: 'Fourgonnette passagers'
  },
  'cabrio-descapotable': {
    ca: 'Cabrio',
    es: 'Descapotable',
    en: 'Convertible',
    fr: 'Cabriolet'
  },
  'pickup': {
    ca: 'Pick up',
    es: 'Pick up',
    en: 'Pickup Truck',
    fr: 'Pick-up'
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
/**
 * TIPOS DE PROPULSOR
 * NUEVA CATEGORÍA - DATOS DEL INSTALLER
 */
export const propulsionTypeValues: ValueMappings = {
  'combustio': {
    ca: 'Combustió',
    es: 'Combustión',
    en: 'Combustion',
    fr: 'Combustion'
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
    ca: 'Hibrid Endollable',
    es: 'Híbrido Enchufable',
    en: 'Plug-in Hybrid',
    fr: 'Hybride Rechargeable'
  }
};

export const valueMappingCategories = {
  vehicleType: vehicleTypeValues,
  fuelType: fuelTypeValues,
  transmission: transmissionTypeValues,
  vehicleState: vehicleStateValues,
  traction: tractionTypeValues,
  bodywork: bodyworkValues,
  color: colorValues,
  boolean: booleanValues,
  specific: specificValues,
  propulsion: propulsionTypeValues
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
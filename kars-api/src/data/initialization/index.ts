// Script principal de inicialización de datos
import carExtras from './car-extras.js';
import motorhomeExtras from './motorhome-extras.js';
import motorcycleExtras from './motorcycle-extras.js';
import { vehicleStates } from './vehicle-states';
import { exteriorColors } from './exterior-colors';
import { fuelTypes } from './fuel-types';
import { batteryTypes } from './battery-types';
import { chargingCables } from './charging-cables';
import { electricConnectors } from './electric-connectors';
import { chargingSpeeds } from './charging-speeds';
import { emissionTypes } from './emission-types';

export interface ExtraTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
}

export interface VehicleStateTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export interface InitializationData {
  carExtras: ExtraTranslation[];
  motorhomeExtras: ExtraTranslation[];
  motorcycleExtras: ExtraTranslation[];
  vehicleStates: VehicleStateTranslation[];
  exteriorColors: any[];
  fuelTypes: any[];
  batteryTypes: any[];
  chargingCables: any[];
  electricConnectors: any[];
  chargingSpeeds: any[];
  emissionTypes: any[];
}

// Función para obtener todos los datos de inicialización
export const getInitializationData = (): InitializationData => {
  return {
    carExtras,
    motorhomeExtras,
    motorcycleExtras,
    vehicleStates,
    exteriorColors,
    fuelTypes,
    batteryTypes,
    chargingCables,
    electricConnectors,
    chargingSpeeds,
    emissionTypes
  };
};

// Función para obtener extras por tipo de vehículo
export const getExtrasByVehicleType = (vehicleType: string): ExtraTranslation[] => {
  const data = getInitializationData();
  
  switch (vehicleType.toLowerCase()) {
    case 'cotxe':
    case 'car':
    case 'coche':
      return data.carExtras;
    
    case 'moto':
    case 'motorcycle':
    case 'motocicleta':
      return data.motorcycleExtras;
    
    case 'autocaravana':
    case 'camper':
    case 'autocaravana-camper':
      return data.motorhomeExtras;
    
    default:
      return [];
  }
};

// Función para obtener todas las traducciones de un extra específico
export const getExtraTranslations = (extraName: string, vehicleType: string): ExtraTranslation | null => {
  const extras = getExtrasByVehicleType(vehicleType);
  
  // Buscar por cualquiera de los idiomas
  const extra = extras.find(e => 
    e.catalan.toLowerCase() === extraName.toLowerCase() ||
    e.spanish.toLowerCase() === extraName.toLowerCase() ||
    e.french.toLowerCase() === extraName.toLowerCase() ||
    e.english.toLowerCase() === extraName.toLowerCase()
  );
  
  return extra || null;
};

// Función para normalizar nombre de extra (útil para comparaciones)
export const normalizeExtraName = (extraName: string): string => {
  return extraName
    .toLowerCase()
    .replace(/\s+/g, '-')  // Reemplazar espacios con guiones
    .replace(/\./g, '')    // Eliminar puntos
    .normalize("NFD")      // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, ""); // Eliminar diacríticos
};

// Función para obtener el nombre en un idioma específico
export const getExtraNameInLanguage = (
  extraName: string, 
  vehicleType: string, 
  language: 'catalan' | 'spanish' | 'french' | 'english' = 'catalan'
): string => {
  const extra = getExtraTranslations(extraName, vehicleType);
  return extra ? extra[language] : extraName;
};

// Mapeo condicional para valores de BD que no coinciden exactamente con el instalador
const EXTRA_VALUE_MAPPING: Record<string, Record<string, string>> = {
  'cotxe': {
    'gps': 'navegador-gps',
    'llandes-alliatge': 'kit-carrosseria', // Temporal hasta tener llandes en instalador
    'llums-led': 'fars-xeno', // Temporal hasta tener LED en instalador  
    'pintura-metallitzada': 'garantia-fabricant' // Temporal hasta tener pintura en instalador
  }
};

// Función para obtener el label de un extra desde la BD
export const getExtraLabelFromDB = (
  dbValue: string, 
  vehicleType: string, 
  language: 'catalan' | 'spanish' | 'french' | 'english' = 'catalan'
): string => {
  const extras = getExtrasByVehicleType(vehicleType);
  const mapping = EXTRA_VALUE_MAPPING[vehicleType.toLowerCase()] || {};
  
  // Intentar mapear el valor
  const mappedValue = mapping[dbValue] || dbValue;
  
  // Buscar en el instalador
  const extra = extras.find((e: any) => e.value === mappedValue);
  
  if (extra) {
    return extra[language];
  }
  
  // Si no se encuentra, devolver el valor original formateado
  return dbValue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default {
  getInitializationData,
  getExtrasByVehicleType,
  getExtraTranslations,
  normalizeExtraName,
  getExtraNameInLanguage,
  getExtraLabelFromDB
};
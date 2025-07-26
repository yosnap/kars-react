import { useState, useEffect } from 'react';
import { carExtras } from '../../../kars-api/src/data/initialization/car-extras';
import { motorcycleExtras } from '../../../kars-api/src/data/initialization/motorcycle-extras';
import { motorhomeExtras } from '../../../kars-api/src/data/initialization/motorhome-extras';

export type VehicleType = 'cotxe' | 'moto' | 'autocaravana' | 'vehicle-comercial' | '';

export interface VehicleExtra {
  value: string;
  name: string;
  catalan: string;
  spanish: string;
  french: string;
  english: string;
}

export const useVehicleExtras = (vehicleType: VehicleType) => {
  const [extras, setExtras] = useState<VehicleExtra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    let selectedExtras: VehicleExtra[] = [];
    
    switch (vehicleType) {
      case 'cotxe':
      case 'vehicle-comercial': // Los vehículos comerciales usan los extras de coches
        selectedExtras = carExtras;
        break;
      case 'moto':
        selectedExtras = motorcycleExtras;
        break;
      case 'autocaravana':
        selectedExtras = motorhomeExtras;
        break;
      default:
        selectedExtras = [];
    }
    
    setExtras(selectedExtras);
    setLoading(false);
  }, [vehicleType]);

  // Función para obtener el nombre del extra en el idioma especificado
  const getExtraName = (value: string, language: 'catalan' | 'spanish' | 'french' | 'english' = 'catalan'): string => {
    const extra = extras.find(e => e.value === value);
    return extra ? extra[language] : value;
  };

  // Función para buscar extras
  const searchExtras = (query: string): VehicleExtra[] => {
    if (!query.trim()) return extras;
    
    const normalizedQuery = query.toLowerCase().trim();
    return extras.filter(extra => 
      extra.catalan.toLowerCase().includes(normalizedQuery) ||
      extra.spanish.toLowerCase().includes(normalizedQuery) ||
      extra.french.toLowerCase().includes(normalizedQuery) ||
      extra.english.toLowerCase().includes(normalizedQuery) ||
      extra.value.toLowerCase().includes(normalizedQuery)
    );
  };

  // Función para obtener múltiples extras por sus values
  const getExtrasByValues = (values: string[]): VehicleExtra[] => {
    return values.map(value => extras.find(e => e.value === value)).filter(Boolean) as VehicleExtra[];
  };

  return {
    extras,
    loading,
    getExtraName,
    searchExtras,
    getExtrasByValues
  };
};
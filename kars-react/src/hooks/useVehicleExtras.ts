import { useState, useEffect } from 'react';
import { axiosAdmin } from '../api/axiosClient';

export type VehicleType = 'cotxe' | 'moto' | 'autocaravana-camper' | 'vehicle-comercial' | 'habitacle' | null;

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
    if (!vehicleType) {
      setExtras([]);
      setLoading(false);
      return;
    }

    const fetchExtras = async () => {
      setLoading(true);
      
      try {
        let endpoint = '';
        
        switch (vehicleType) {
          case 'cotxe':
          case 'vehicle-comercial': // Los vehículos comerciales usan los extras de coches
            endpoint = '/car-extras';
            break;
          case 'moto':
            endpoint = '/motorcycle-extras';
            break;
          case 'autocaravana-camper':
            endpoint = '/caravan-extras';
            break;
          case 'habitacle':
            endpoint = '/habitacle-extras';
            break;
          default:
            setExtras([]);
            setLoading(false);
            return;
        }
        
        const response = await axiosAdmin.get(endpoint);
        
        
        // La API devuelve directamente {data: Array} sin field success
        if (response.data?.data && Array.isArray(response.data.data)) {
          // Transformar los datos de la API al formato esperado
          const transformedExtras: VehicleExtra[] = response.data.data.map((extra: any) => ({
            value: extra.slug || extra.value,
            name: extra.name,
            catalan: extra.catalan || extra.name,
            spanish: extra.spanish || extra.name,
            french: extra.french || extra.name,
            english: extra.english || extra.name
          }));
          
          setExtras(transformedExtras);
        } else {
          console.error(`No extras found for ${vehicleType}:`, response.data);
          setExtras([]);
        }
      } catch (error) {
        console.error(`Error fetching extras for ${vehicleType}:`, error);
        setExtras([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExtras();
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
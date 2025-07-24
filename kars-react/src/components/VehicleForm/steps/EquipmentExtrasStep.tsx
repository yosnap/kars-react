import React, { useState, useEffect } from 'react';
import { axiosAdmin } from '../../../api/axiosClient';
import ExtrasGrid from '../ExtrasGrid';

interface EquipmentExtrasStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

interface Extra {
  id: string;
  name: string;
  slug: string;
}

const EquipmentExtrasStep: React.FC<EquipmentExtrasStepProps> = ({ formData, updateFormData }) => {
  const [carExtras, setCarExtras] = useState<Extra[]>([]);
  const [motorcycleExtras, setMotorcycleExtras] = useState<Extra[]>([]);
  const [caravanExtras, setCaravanExtras] = useState<Extra[]>([]);
  const [habitacleExtras, setHabitacleExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar extras desde la API
  useEffect(() => {
    const loadExtras = async () => {
      setLoading(true);
      try {
        const [carResponse, motorcycleResponse, caravanResponse, habitacleResponse] = await Promise.all([
          axiosAdmin.get('/car-extras'),
          axiosAdmin.get('/motorcycle-extras'),
          axiosAdmin.get('/caravan-extras'),
          axiosAdmin.get('/habitacle-extras')
        ]);

        if (carResponse.data?.data) {
          setCarExtras(carResponse.data.data);
        }
        if (motorcycleResponse.data?.data) {
          setMotorcycleExtras(motorcycleResponse.data.data);
        }
        if (caravanResponse.data?.data) {
          setCaravanExtras(caravanResponse.data.data);
        }
        if (habitacleResponse.data?.data) {
          setHabitacleExtras(habitacleResponse.data.data);
        }
      } catch (error) {
        console.error('Error cargando extras:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExtras();
  }, []);

  // Función para normalizar strings para comparación
  const normalizeExtra = (extra: string): string => {
    return extra.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[àáâãä]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/ñ/g, 'n');
  };

  // Función para obtener la configuración de extras según el tipo de vehículo
  const getExtrasConfig = () => {
    let extras: Extra[];
    let currentField: string;
    let rawExtras: string[];
    
    switch (formData.tipusVehicle) {
      case 'MOTO':
        extras = motorcycleExtras;
        currentField = 'extresMoto';
        rawExtras = formData.extresMoto || [];
        break;
      case 'AUTOCARAVANA':
        // Para autocaravanas, usar tanto caravana como habitáculo
        extras = [...caravanExtras, ...habitacleExtras];
        currentField = 'extresAutocaravana';
        rawExtras = formData.extresAutocaravana || [];
        break;
      case 'VEHICLE_COMERCIAL':
        extras = carExtras; // Los comerciales usan extras de coches
        currentField = 'extresCotxe';
        rawExtras = formData.extresCotxe || [];
        break;
      default:
        extras = carExtras;
        currentField = 'extresCotxe';
        rawExtras = formData.extresCotxe || [];
    }
    
    // Normalizar los extras guardados para comparación
    const normalizedExtras = rawExtras.map(extra => normalizeExtra(extra));
    
    return {
      extras,
      currentField,
      currentExtras: rawExtras,
      normalizedExtras
    };
  };

  const extrasConfig = getExtrasConfig();

  const toggleExtra = (extra: Extra) => {
    const currentExtras = extrasConfig.currentExtras;
    const normalizedNew = normalizeExtra(extra.slug);
    
    // Buscar si existe un extra con el mismo valor normalizado
    const existingIndex = currentExtras.findIndex(
      (item: string) => normalizeExtra(item) === normalizedNew
    );
    
    let updatedExtras: string[];
    if (existingIndex >= 0) {
      // Si existe, lo quitamos
      updatedExtras = currentExtras.filter((_: string, index: number) => index !== existingIndex);
    } else {
      // Si no existe, lo agregamos con el slug original
      updatedExtras = [...currentExtras, extra.slug];
    }
    
    updateFormData({ [extrasConfig.currentField]: updatedExtras });
  };

  // Obtener el título según el tipo de vehículo
  const getTitle = () => {
    switch (formData.tipusVehicle) {
      case 'MOTO':
        return 'Equipament i extras de la moto';
      case 'AUTOCARAVANA':
        return 'Equipament i extras de l\'autocaravana';
      case 'VEHICLE_COMERCIAL':
        return 'Equipament i extras del vehicle comercial';
      default:
        return 'Equipament i extras del cotxe';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Carregant extras...</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Preparant la selecció d'equipament</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ExtrasGrid
      extras={extrasConfig.extras}
      selectedExtras={extrasConfig.currentExtras}
      onToggleExtra={toggleExtra}
      title={getTitle()}
    />
  );
};

export default EquipmentExtrasStep;
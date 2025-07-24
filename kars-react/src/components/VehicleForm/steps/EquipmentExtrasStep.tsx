import React, { useState, useEffect } from 'react';
import { axiosAdmin } from '../../../api/axiosClient';
import ExtrasGrid from '../ExtrasGrid';
import { Switch } from '../../ui/switch';

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
      case 'moto':
        extras = motorcycleExtras;
        currentField = 'extresMoto';
        rawExtras = formData.extresMoto || [];
        break;
      case 'autocaravana':
        // Para autocaravanas, usar tanto caravana como habitáculo
        extras = [...caravanExtras, ...habitacleExtras];
        currentField = 'extresAutocaravana';
        rawExtras = formData.extresAutocaravana || [];
        break;
      case 'vehicle-comercial':
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
    
    // Ahora que usamos slugs, la comparación es directa
    const existingIndex = currentExtras.findIndex((item: string) => item === extra.slug);
    
    let updatedExtras: string[];
    if (existingIndex >= 0) {
      // Si existe, lo quitamos
      updatedExtras = currentExtras.filter((_: string, index: number) => index !== existingIndex);
    } else {
      // Si no existe, lo agregamos con el slug
      updatedExtras = [...currentExtras, extra.slug];
    }
    
    updateFormData({ [extrasConfig.currentField]: updatedExtras });
  };

  // Obtener el título según el tipo de vehículo
  const getTitle = () => {
    switch (formData.tipusVehicle) {
      case 'moto':
        return 'Equipament i extras de la moto';
      case 'autocaravana':
        return 'Equipament i extras de l\'autocaravana';
      case 'vehicle-comercial':
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
    <div className="space-y-8">
      {/* Características básicas del vehículo */}
      {(formData.tipusVehicle === 'cotxe' || formData.tipusVehicle === 'autocaravana' || formData.tipusVehicle === 'vehicle-comercial') && (
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            🌡️ Características de Confort
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Aire Acondicionat */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Aire Acondicionat
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sistema d'aire acondicionat
                </p>
              </div>
              <div className="scale-75">
                <Switch
                  checked={formData.aireAcondicionat === 'true' || formData.aireAcondicionat === true}
                  onCheckedChange={(checked) => updateFormData({ aireAcondicionat: checked ? 'true' : 'false' })}
                  className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </div>

            {/* Climatització */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Climatització
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sistema de climatització automàtic
                </p>
              </div>
              <div className="scale-75">
                <Switch
                  checked={formData.climatitzacio === true}
                  onCheckedChange={(checked) => updateFormData({ climatitzacio: checked })}
                  className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </div>

            {/* Vehicle Fumador */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vehicle Fumador
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Utilitzat per fumadors
                </p>
              </div>
              <div className="scale-75">
                <Switch
                  checked={formData.vehicleFumador === true}
                  onCheckedChange={(checked) => updateFormData({ vehicleFumador: checked })}
                  className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Extras específicos del vehículo */}
      <ExtrasGrid
        extras={extrasConfig.extras}
        selectedExtras={extrasConfig.currentExtras}
        onToggleExtra={toggleExtra}
        title={getTitle()}
      />
    </div>
  );
};

export default EquipmentExtrasStep;
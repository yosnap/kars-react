import React, { useState, useEffect } from 'react';
import { useVehicleExtras } from '../../../hooks/useVehicleExtras';
import ExtrasGrid from '../ExtrasGrid';
import { Switch } from '../../ui/switch';

interface EquipmentExtrasStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const EquipmentExtrasStep: React.FC<EquipmentExtrasStepProps> = ({ formData, updateFormData }) => {
  // Usar el hook para obtener extras según el tipo de vehículo
  const { 
    extras: rawExtras, 
    loading,
    getExtraName 
  } = useVehicleExtras(formData.tipusVehicle);

  // Para autocaravanas, también obtener extras de habitáculo
  const { 
    extras: rawHabitacleExtras, 
    loading: loadingHabitacle
  } = useVehicleExtras(formData.tipusVehicle === 'autocaravana-camper' ? 'habitacle' : null);

  // Convertir los extras principales al formato esperado por ExtrasGrid
  const vehicleExtras = rawExtras.map(extra => ({
    id: extra.value,
    name: extra.catalan, // Usar el nombre en catalán
    slug: extra.value
  }));

  // Convertir los extras de habitáculo al formato esperado por ExtrasGrid
  const habitacleExtras = rawHabitacleExtras.map(extra => ({
    id: extra.value,
    name: extra.catalan, // Usar el nombre en catalán
    slug: extra.value
  }));

  // Función para obtener el campo de extras según el tipo de vehículo
  const getExtrasField = () => {
    switch (formData.tipusVehicle) {
      case 'moto':
        return 'extresMoto';
      case 'autocaravana-camper':
        return 'extresAutocaravana';
      case 'vehicle-comercial':
        return 'extresCotxe';
      default:
        return 'extresCotxe';
    }
  };

  // Función para obtener los extras seleccionados de autocaravana
  const getSelectedAutocaravanaExtras = (): string[] => {
    return formData.extresAutocaravana || [];
  };

  // Función para obtener los extras seleccionados de habitáculo
  const getSelectedHabitacleExtras = (): string[] => {
    return formData.extresHabitacle || [];
  };

  // Función para obtener los extras seleccionados (otros vehículos)
  const getSelectedExtras = (): string[] => {
    const field = getExtrasField();
    return formData[field] || [];
  };

  // Función para alternar extra de autocaravana
  const toggleAutocaravanaExtra = (extra: any) => {
    const extraValue = extra.value || extra.slug;
    const currentExtras = formData.extresAutocaravana || [];
    
    let updatedExtras: string[];
    if (currentExtras.includes(extraValue)) {
      updatedExtras = currentExtras.filter(e => e !== extraValue);
    } else {
      updatedExtras = [...currentExtras, extraValue];
    }
    
    updateFormData({ extresAutocaravana: updatedExtras });
  };

  // Función para alternar extra de habitáculo
  const toggleHabitacleExtra = (extra: any) => {
    const extraValue = extra.value || extra.slug;
    const currentExtras = formData.extresHabitacle || [];
    
    let updatedExtras: string[];
    if (currentExtras.includes(extraValue)) {
      updatedExtras = currentExtras.filter(e => e !== extraValue);
    } else {
      updatedExtras = [...currentExtras, extraValue];
    }
    
    updateFormData({ extresHabitacle: updatedExtras });
  };

  // Función para alternar extra (otros vehículos)
  const toggleExtra = (extra: any) => {
    const extraValue = extra.value || extra.slug;
    const field = getExtrasField();
    const currentExtras = formData[field] || [];
    
    let updatedExtras: string[];
    if (currentExtras.includes(extraValue)) {
      updatedExtras = currentExtras.filter(e => e !== extraValue);
    } else {
      updatedExtras = [...currentExtras, extraValue];
    }
    
    updateFormData({ [field]: updatedExtras });
  };

  // Función para seleccionar múltiples extras de autocaravana
  const selectMultipleAutocaravanaExtras = (extrasToAdd: string[]) => {
    const currentExtras = formData.extresAutocaravana || [];
    const uniqueExtras = [...new Set([...currentExtras, ...extrasToAdd])];
    updateFormData({ extresAutocaravana: uniqueExtras });
  };

  // Función para deseleccionar múltiples extras de autocaravana
  const deselectMultipleAutocaravanaExtras = (extrasToRemove: string[]) => {
    const currentExtras = formData.extresAutocaravana || [];
    const updatedExtras = currentExtras.filter(extra => !extrasToRemove.includes(extra));
    updateFormData({ extresAutocaravana: updatedExtras });
  };

  // Función para seleccionar múltiples extras de habitáculo
  const selectMultipleHabitacleExtras = (extrasToAdd: string[]) => {
    const currentExtras = formData.extresHabitacle || [];
    const uniqueExtras = [...new Set([...currentExtras, ...extrasToAdd])];
    updateFormData({ extresHabitacle: uniqueExtras });
  };

  // Función para deseleccionar múltiples extras de habitáculo
  const deselectMultipleHabitacleExtras = (extrasToRemove: string[]) => {
    const currentExtras = formData.extresHabitacle || [];
    const updatedExtras = currentExtras.filter(extra => !extrasToRemove.includes(extra));
    updateFormData({ extresHabitacle: updatedExtras });
  };

  // Función para seleccionar múltiples extras (otros vehículos)
  const selectMultipleExtras = (extrasToAdd: string[]) => {
    const field = getExtrasField();
    const currentExtras = formData[field] || [];
    const uniqueExtras = [...new Set([...currentExtras, ...extrasToAdd])];
    updateFormData({ [field]: uniqueExtras });
  };

  // Función para deseleccionar múltiples extras (otros vehículos)
  const deselectMultipleExtras = (extrasToRemove: string[]) => {
    const field = getExtrasField();
    const currentExtras = formData[field] || [];
    const updatedExtras = currentExtras.filter(extra => !extrasToRemove.includes(extra));
    updateFormData({ [field]: updatedExtras });
  };

  // Obtener el título según el tipo de vehículo
  const getTitle = () => {
    switch (formData.tipusVehicle) {
      case 'moto':
        return 'Equipament i extras de la moto';
      case 'autocaravana-camper':
        return 'Equipament i extras de l\'autocaravana';
      case 'vehicle-comercial':
        return 'Equipament i extras del vehicle comercial';
      default:
        return 'Equipament i extras del cotxe';
    }
  };

  if (loading || (formData.tipusVehicle === 'autocaravana-camper' && loadingHabitacle)) {
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
      {(formData.tipusVehicle === 'cotxe' || formData.tipusVehicle === 'autocaravana-camper' || formData.tipusVehicle === 'vehicle-comercial') && (
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
                  checked={formData.aireAcondicionat === 'true' || formData.aireAcondicionat === true || formData.aireAcondicionat === 'si'}
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
      {formData.tipusVehicle === 'autocaravana-camper' ? (
        <div className="space-y-8">
          {/* Extras de Autocaravana */}
          <ExtrasGrid
            extras={vehicleExtras}
            selectedExtras={getSelectedAutocaravanaExtras()}
            onToggleExtra={toggleAutocaravanaExtra}
            onSelectMultiple={selectMultipleAutocaravanaExtras}
            onDeselectMultiple={deselectMultipleAutocaravanaExtras}
            title="Equipament i extras de l'autocaravana"
          />
          
          {/* Extras de Habitáculo */}
          <ExtrasGrid
            extras={habitacleExtras}
            selectedExtras={getSelectedHabitacleExtras()}
            onToggleExtra={toggleHabitacleExtra}
            onSelectMultiple={selectMultipleHabitacleExtras}
            onDeselectMultiple={deselectMultipleHabitacleExtras}
            title="Equipament del habitáculo"
          />
        </div>
      ) : (
        <ExtrasGrid
          extras={vehicleExtras}
          selectedExtras={getSelectedExtras()}
          onToggleExtra={toggleExtra}
          onSelectMultiple={selectMultipleExtras}
          onDeselectMultiple={deselectMultipleExtras}
          title={getTitle()}
        />
      )}
    </div>
  );
};

export default EquipmentExtrasStep;
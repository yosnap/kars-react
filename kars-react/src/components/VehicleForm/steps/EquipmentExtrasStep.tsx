import React from 'react';

interface EquipmentExtrasStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const EquipmentExtrasStep: React.FC<EquipmentExtrasStepProps> = ({ formData, updateFormData }) => {
  // Definir extras por tipo de vehículo
  const carExtras = [
    'aire-acondicionat', 'abs', 'airbag-frontal', 'airbag-lateral', 'alarma',
    'bluetooth', 'cd-player', 'climatitzador', 'control-creuer', 'direccio-assistida',
    'elevador-cristalls-electric', 'esp', 'faros-xenon', 'gps', 'llantes-aleacio',
    'mp3-player', 'navegador', 'ordinador-bord', 'radio', 'retrovisors-electrics',
    'sistema-handfree', 'sostre-solar', 'tapisseria-cuir', 'usb'
  ];

  const motorcycleExtras = [
    'abs', 'alarma', 'bluetooth', 'control-traccio', 'faros-led', 'gps',
    'handfree', 'maletes', 'pantalla-vent', 'sistema-navegacio', 'usb',
    'windshield'
  ];

  const comercialExtras = [
    'abs', 'aire-acondicionat', 'alarma', 'bluetooth', 'cd-player', 'climatitzador',
    'direccio-assistida', 'esp', 'gps', 'handfree', 'radio', 'usb'
  ];

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
    let extras: string[];
    let currentField: string;
    let rawExtras: string[];
    
    switch (formData.tipusVehicle) {
      case 'MOTO':
        extras = motorcycleExtras;
        currentField = 'extresMoto';
        rawExtras = formData.extresMoto || [];
        break;
      case 'AUTOCARAVANA':
      case 'VEHICLE_COMERCIAL':
        extras = comercialExtras;
        currentField = 'extresHabitacle';
        rawExtras = formData.extresHabitacle || [];
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

  const toggleExtra = (extra: string) => {
    const currentExtras = extrasConfig.currentExtras;
    const normalizedNew = normalizeExtra(extra);
    
    // Buscar si existe un extra con el mismo valor normalizado
    const existingIndex = currentExtras.findIndex(
      (item: string) => normalizeExtra(item) === normalizedNew
    );
    
    let updatedExtras: string[];
    if (existingIndex >= 0) {
      // Si existe, lo quitamos
      updatedExtras = currentExtras.filter((_: string, index: number) => index !== existingIndex);
    } else {
      // Si no existe, lo agregamos con formato capitalizado
      const capitalizedExtra = extra
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      updatedExtras = [...currentExtras, capitalizedExtra];
    }
    
    updateFormData({ [extrasConfig.currentField]: updatedExtras });
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Equipament i extras del vehicle
      </h3>
      
      {/* Equipment Checkboxes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Equipament disponible (selecciona tots els que corresponguin)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {extrasConfig.extras.map((extra) => {
            // Comparar usando valores normalizados
            const normalizedCheckboxValue = normalizeExtra(extra);
            const isSelected = extrasConfig.normalizedExtras.includes(normalizedCheckboxValue);
            
            return (
              <div key={extra} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={extra}
                  checked={isSelected}
                  onChange={() => toggleExtra(extra)}
                  className="rounded"
                />
                <label 
                  htmlFor={extra} 
                  className="text-sm text-gray-700 dark:text-gray-300 capitalize cursor-pointer"
                >
                  {extra.replace(/-/g, ' ')}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EquipmentExtrasStep;
import React from 'react';
import { Car, Bike, Truck, Home } from 'lucide-react';

interface VehicleTypeStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const VehicleTypeStep: React.FC<VehicleTypeStepProps> = ({ formData, updateFormData }) => {
  const vehicleTypes = [
    { value: 'cotxe', label: 'Cotxe', icon: Car, description: 'Vehicles de turisme' },
    { value: 'moto', label: 'Motocicleta', icon: Bike, description: 'Motos i ciclomotors' },
    { value: 'autocaravana-camper', label: 'Autocaravana', icon: Home, description: 'Autocaravanes i campers' },
    { value: 'vehicle-comercial', label: 'Vehicle Comercial', icon: Truck, description: 'Furgonetes i camions' }
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Selecciona el tipus de vehicle
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicleTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                // Limpiar campos específicos cuando cambia el tipo de vehículo
                updateFormData({ 
                  tipusVehicle: type.value,
                  // Limpiar marcas y modelos para evitar inconsistencias
                  marcaCotxe: '',
                  marcaMoto: '',
                  marquesComercial: '',
                  modelsCotxe: '',
                  modelsMoto: '',
                  modelsComercial: '',
                  versio: ''
                });
              }}
              className={`p-6 border-2 rounded-lg text-left transition-all ${
                formData.tipusVehicle === type.value
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <IconComponent className={`h-8 w-8 ${
                  formData.tipusVehicle === type.value 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {type.label}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VehicleTypeStep;
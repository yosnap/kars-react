import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Car, Zap, Truck, Home } from 'lucide-react';

// Types
interface VehicleFormData {
  // Step 1: Vehicle Type
  tipusVehicle: 'COTXE' | 'MOTO' | 'AUTOCARAVANA' | 'VEHICLE_COMERCIAL' | '';
  
  // Step 2: Basic Info
  marcaCotxe?: string;
  marcaMoto?: string;
  marquesAutocaravana?: string;
  modelsCotxe?: string;
  modelsMoto?: string;
  modelsAutocaravana?: string;
  versio?: string;
  any?: string;
  preu: string;
  quilometratge?: string;
  
  // Auto-generated title
  titolAnunci: string;
  
  // Step 3: Technical Specs
  tipusCombustible?: string;
  tipusCanvi?: string;
  tipusPropulsor?: string;
  potenciaCv?: string;
  potenciaKw?: string;
  cilindrada?: string;
  colorVehicle?: string;
  portesCotxe?: string;
  placesCotxe?: string;
  estatVehicle?: string;
  
  // Step 4: Multilingual Descriptions
  descripcioAnunciCA?: string; // Catalan (primary)
  descripcioAnunciEN?: string; // English
  descripcioAnunciFR?: string; // French
  descripcioAnunciES?: string; // Spanish
  
  // Step 5: Images and Status
  imatgeDestacadaUrl?: string;
  galeriaVehicleUrls: string[];
  anunciActiu: boolean;
  anunciDestacat: number;
  venut: boolean;
}

interface MultiStepVehicleFormProps {
  vehicle?: VehicleFormData; // For editing existing vehicle
  onSave: (vehicleData: VehicleFormData) => Promise<void>;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: 'Tipus de Vehicle', description: 'Selecciona el tipus de vehicle' },
  { id: 2, title: 'Dades Bàsiques', description: 'Marca, model i informació general' },
  { id: 3, title: 'Especificacions', description: 'Detalls tècnics del vehicle' },
  { id: 4, title: 'Descripcions', description: 'Textos en diferents idiomes' },
  { id: 5, title: 'Imatges i Estat', description: 'Fotos i configuració final' }
];

export default function MultiStepVehicleForm({ 
  vehicle, 
  onSave, 
  onCancel 
}: MultiStepVehicleFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>({
    tipusVehicle: '',
    preu: '',
    titolAnunci: '',
    galeriaVehicleUrls: [],
    anunciActiu: true,
    anunciDestacat: 0,
    venut: false,
    ...vehicle // Load existing vehicle data if editing
  });

  // Auto-generate title when marca, model, or version changes
  useEffect(() => {
    generateTitle();
  }, [
    formData.marcaCotxe, 
    formData.marcaMoto, 
    formData.marquesAutocaravana,
    formData.modelsCotxe, 
    formData.modelsMoto, 
    formData.modelsAutocaravana,
    formData.versio,
    formData.tipusVehicle
  ]);

  const generateTitle = () => {
    let marca = '';
    let modelo = '';
    
    switch (formData.tipusVehicle) {
      case 'COTXE':
        marca = formData.marcaCotxe || '';
        modelo = formData.modelsCotxe || '';
        break;
      case 'MOTO':
        marca = formData.marcaMoto || '';
        modelo = formData.modelsMoto || '';
        break;
      case 'AUTOCARAVANA':
        marca = formData.marquesAutocaravana || '';
        modelo = formData.modelsAutocaravana || '';
        break;
      default:
        marca = '';
        modelo = '';
    }
    
    const version = formData.versio || '';
    const titleParts = [marca, modelo, version].filter(part => part.trim() !== '');
    const newTitle = titleParts.join(' ').trim() || 'Vehicle sense títol';
    
    setFormData(prev => ({ ...prev, titolAnunci: newTitle }));
  };

  const updateFormData = (updates: Partial<VehicleFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving vehicle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.tipusVehicle !== '';
      case 2:
        const hasBrand = formData.marcaCotxe || formData.marcaMoto || formData.marquesAutocaravana;
        const hasModel = formData.modelsCotxe || formData.modelsMoto || formData.modelsAutocaravana;
        return !!(hasBrand && hasModel && formData.preu);
      case 3:
        return true; // Technical specs are optional
      case 4:
        return !!formData.descripcioAnunciCA; // At least Catalan description required
      case 5:
        return true; // Images are optional
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header with Steps */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {vehicle ? 'Editar Vehicle' : 'Afegir Nou Vehicle'}
        </h2>
        
        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              <div className="ml-2 hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-4 hidden md:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 py-6">
        {/* Auto-generated title preview */}
        {formData.titolAnunci && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
              Títol generat automàticament:
            </h3>
            <p className="text-blue-800 dark:text-blue-200 font-semibold">
              {formData.titolAnunci}
            </p>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && (
          <VehicleTypeStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )}
        
        {currentStep === 2 && (
          <BasicInfoStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )}
        
        {currentStep === 3 && (
          <TechnicalSpecsStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )}
        
        {currentStep === 4 && (
          <MultilingualDescriptionsStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )}
        
        {currentStep === 5 && (
          <ImagesAndStatusStep 
            formData={formData} 
            updateFormData={updateFormData} 
          />
        )}
      </div>

      {/* Footer with Navigation */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Cancel·lar
          </button>
          
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Següent
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!canProceed || isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Guardant...' : 'Guardar Vehicle'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components (to be implemented)
function VehicleTypeStep({ formData, updateFormData }: any) {
  const vehicleTypes = [
    { value: 'COTXE', label: 'Cotxe', icon: Car, description: 'Vehicles de turisme' },
    { value: 'MOTO', label: 'Motocicleta', icon: Zap, description: 'Motos i ciclomotors' },
    { value: 'AUTOCARAVANA', label: 'Autocaravana', icon: Home, description: 'Autocaravanes i campers' },
    { value: 'VEHICLE_COMERCIAL', label: 'Vehicle Comercial', icon: Truck, description: 'Furgonetes i camions' }
  ];

  return (
    <div className="space-y-6">
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
              onClick={() => updateFormData({ tipusVehicle: type.value })}
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
}

function BasicInfoStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Dades bàsiques del vehicle
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Field - Dynamic based on vehicle type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Marca *
          </label>
          <input
            type="text"
            value={
              formData.tipusVehicle === 'COTXE' ? formData.marcaCotxe || '' :
              formData.tipusVehicle === 'MOTO' ? formData.marcaMoto || '' :
              formData.tipusVehicle === 'AUTOCARAVANA' ? formData.marquesAutocaravana || '' :
              ''
            }
            onChange={(e) => {
              const fieldName = 
                formData.tipusVehicle === 'COTXE' ? 'marcaCotxe' :
                formData.tipusVehicle === 'MOTO' ? 'marcaMoto' :
                formData.tipusVehicle === 'AUTOCARAVANA' ? 'marquesAutocaravana' :
                '';
              if (fieldName) {
                updateFormData({ [fieldName]: e.target.value });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ex: BMW, Audi, Honda..."
          />
        </div>

        {/* Model Field - Dynamic based on vehicle type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Model *
          </label>
          <input
            type="text"
            value={
              formData.tipusVehicle === 'COTXE' ? formData.modelsCotxe || '' :
              formData.tipusVehicle === 'MOTO' ? formData.modelsMoto || '' :
              formData.tipusVehicle === 'AUTOCARAVANA' ? formData.modelsAutocaravana || '' :
              ''
            }
            onChange={(e) => {
              const fieldName = 
                formData.tipusVehicle === 'COTXE' ? 'modelsCotxe' :
                formData.tipusVehicle === 'MOTO' ? 'modelsMoto' :
                formData.tipusVehicle === 'AUTOCARAVANA' ? 'modelsAutocaravana' :
                '';
              if (fieldName) {
                updateFormData({ [fieldName]: e.target.value });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ex: Serie 3, A4, CBR600..."
          />
        </div>

        {/* Version */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Versió
          </label>
          <input
            type="text"
            value={formData.versio || ''}
            onChange={(e) => updateFormData({ versio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ex: 320d, 2.0 TDI, Sport..."
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Any
          </label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.any || ''}
            onChange={(e) => updateFormData({ any: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="2024"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preu (€) *
          </label>
          <input
            type="number"
            min="0"
            value={formData.preu}
            onChange={(e) => updateFormData({ preu: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="25000"
          />
        </div>

        {/* Mileage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quilometratge (km)
          </label>
          <input
            type="number"
            min="0"
            value={formData.quilometratge || ''}
            onChange={(e) => updateFormData({ quilometratge: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="50000"
          />
        </div>
      </div>
    </div>
  );
}

// Step 3: Technical Specifications
function TechnicalSpecsStep({ formData, updateFormData }: any) {
  const fuelTypes = [
    { value: 'benzina', label: 'Benzina' },
    { value: 'diesel', label: 'Dièsel' },
    { value: 'electric', label: 'Elèctric' },
    { value: 'hibrid', label: 'Híbrid' },
    { value: 'hibrid-endollable', label: 'Híbrid Endollable' },
    { value: 'gnc', label: 'GNC' },
    { value: 'glp', label: 'GLP' }
  ];

  const transmissionTypes = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automàtic' },
    { value: 'auto-sequencial', label: 'Auto-Seqüencial' },
    { value: 'cvt', label: 'CVT' }
  ];

  const vehicleStates = [
    { value: 'nou', label: 'Nou' },
    { value: 'ocasio', label: 'Ocasió' },
    { value: 'km0-gerencia', label: 'Km0 / Gerència' },
    { value: 'seminou', label: 'Seminous' }
  ];

  const colors = [
    { value: 'blanc', label: 'Blanc' },
    { value: 'negre', label: 'Negre' },
    { value: 'gris', label: 'Gris' },
    { value: 'plata', label: 'Plata' },
    { value: 'vermell', label: 'Vermell' },
    { value: 'blau', label: 'Blau' },
    { value: 'verd', label: 'Verd' },
    { value: 'groc', label: 'Groc' },
    { value: 'taronja', label: 'Taronja' },
    { value: 'marron', label: 'Marró' },
    { value: 'bicolor', label: 'Bicolor' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Especificacions tècniques
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipus de Combustible
          </label>
          <select
            value={formData.tipusCombustible || ''}
            onChange={(e) => updateFormData({ tipusCombustible: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona combustible</option>
            {fuelTypes.map(fuel => (
              <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
            ))}
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipus de Canvi
          </label>
          <select
            value={formData.tipusCanvi || ''}
            onChange={(e) => updateFormData({ tipusCanvi: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona canvi</option>
            {transmissionTypes.map(trans => (
              <option key={trans.value} value={trans.value}>{trans.label}</option>
            ))}
          </select>
        </div>

        {/* Vehicle State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estat del Vehicle
          </label>
          <select
            value={formData.estatVehicle || ''}
            onChange={(e) => updateFormData({ estatVehicle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona estat</option>
            {vehicleStates.map(state => (
              <option key={state.value} value={state.value}>{state.label}</option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <select
            value={formData.colorVehicle || ''}
            onChange={(e) => updateFormData({ colorVehicle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona color</option>
            {colors.map(color => (
              <option key={color.value} value={color.value}>{color.label}</option>
            ))}
          </select>
        </div>

        {/* Power (CV) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Potència (CV)
          </label>
          <input
            type="number"
            min="0"
            value={formData.potenciaCv || ''}
            onChange={(e) => updateFormData({ potenciaCv: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="150"
          />
        </div>

        {/* Power (KW) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Potència (KW)
          </label>
          <input
            type="number"
            min="0"
            value={formData.potenciaKw || ''}
            onChange={(e) => updateFormData({ potenciaKw: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="110"
          />
        </div>

        {/* Engine Displacement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cilindrada (cc)
          </label>
          <input
            type="number"
            min="0"
            value={formData.cilindrada || ''}
            onChange={(e) => updateFormData({ cilindrada: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="1995"
          />
        </div>

        {/* Doors (only for cars) */}
        {formData.tipusVehicle === 'COTXE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de Portes
            </label>
            <select
              value={formData.portesCotxe || ''}
              onChange={(e) => updateFormData({ portesCotxe: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona portes</option>
              <option value="2">2 portes</option>
              <option value="3">3 portes</option>
              <option value="4">4 portes</option>
              <option value="5">5 portes</option>
            </select>
          </div>
        )}

        {/* Seats (only for cars) */}
        {formData.tipusVehicle === 'COTXE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de Places
            </label>
            <select
              value={formData.placesCotxe || ''}
              onChange={(e) => updateFormData({ placesCotxe: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona places</option>
              <option value="2">2 places</option>
              <option value="4">4 places</option>
              <option value="5">5 places</option>
              <option value="7">7 places</option>
              <option value="8">8 places</option>
              <option value="9">9 places</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

function MultilingualDescriptionsStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Descripcions en diferents idiomes
      </h3>
      
      <div className="space-y-4">
        {/* Catalan (Primary) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripció en Català (Principal) *
          </label>
          <textarea
            rows={4}
            value={formData.descripcioAnunciCA || ''}
            onChange={(e) => updateFormData({ descripcioAnunciCA: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Descripció detallada del vehicle en català..."
          />
        </div>

        {/* English */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            English Description
          </label>
          <textarea
            rows={4}
            value={formData.descripcioAnunciEN || ''}
            onChange={(e) => updateFormData({ descripcioAnunciEN: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Detailed vehicle description in English..."
          />
        </div>

        {/* French */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description en Français
          </label>
          <textarea
            rows={4}
            value={formData.descripcioAnunciFR || ''}
            onChange={(e) => updateFormData({ descripcioAnunciFR: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Description détaillée du véhicule en français..."
          />
        </div>

        {/* Spanish */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción en Español
          </label>
          <textarea
            rows={4}
            value={formData.descripcioAnunciES || ''}
            onChange={(e) => updateFormData({ descripcioAnunciES: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Descripción detallada del vehículo en español..."
          />
        </div>
      </div>
    </div>
  );
}

function ImagesAndStatusStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Imatges i estat de l'anunci
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Imatge Principal (URL)
          </label>
          <input
            type="url"
            value={formData.imatgeDestacadaUrl || ''}
            onChange={(e) => updateFormData({ imatgeDestacadaUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Status checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anunciActiu"
              checked={formData.anunciActiu}
              onChange={(e) => updateFormData({ anunciActiu: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="anunciActiu" className="text-sm text-gray-700 dark:text-gray-300">
              Anunci actiu
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="venut"
              checked={formData.venut}
              onChange={(e) => updateFormData({ venut: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="venut" className="text-sm text-gray-700 dark:text-gray-300">
              Vehicle venut
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nivell destacat
            </label>
            <select
              value={formData.anunciDestacat}
              onChange={(e) => updateFormData({ anunciDestacat: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={0}>No destacat</option>
              <option value={1}>Destacat nivell 1</option>
              <option value={2}>Destacat nivell 2</option>
              <option value={3}>Destacat nivell 3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
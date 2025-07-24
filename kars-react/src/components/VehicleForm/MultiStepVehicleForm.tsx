import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Car, Bike, Home, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  VehicleTypeStep, 
  BasicInfoStep, 
  TechnicalSpecsStep, 
  EquipmentExtrasStep, 
  CommercialInfoStep, 
  DescriptionsStep, 
  ImagesAndStatusStep 
} from './steps';

interface VehicleFormData {
  // Step 1: Vehicle Type
  tipusVehicle: 'cotxe' | 'moto' | 'autocaravana' | 'vehicle-comercial' | '';
  
  // Step 2: Basic Info
  marcaCotxe?: string;
  marcaMoto?: string;
  marquesAutocaravana?: string;
  marquesComercial?: string;
  modelsCotxe?: string;
  modelsMoto?: string;
  modelsAutocaravana?: string;
  modelsComercial?: string;
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
  
  // Additional technical fields from payload
  emissionsVehicle?: string;
  consumUrba?: string;
  consumCarretera?: string;
  consumMixt?: string;
  emissionsCo2?: string;
  categoriaEcologica?: string;
  tipusTapisseria?: string;
  
  // Step 4: Equipment and Extras
  extresCotxe?: string[]; // Array of extras for cars
  extresMoto?: string[]; // Array of extras for motorcycles  
  extresAutocaravana?: string[]; // Array of extras for motorhomes
  extresHabitacle?: string[]; // Array of habitacle extras
  // Note: seguretat, confort, multimedia fields removed - not in Prisma schema
  
  // Step 5: Commercial Information
  garantia?: string;
  vehicleAccidentat?: string;
  origen?: string;
  iva?: string;
  finacament?: string;
  
  // Step 6: Multilingual Descriptions
  descripcioAnunciCA?: string; // Catalan (primary)
  descripcioAnunciEN?: string; // English
  descripcioAnunciFR?: string; // French
  descripcioAnunciES?: string; // Spanish
  
  // Step 7: Images and Status
  imatgeDestacadaUrl?: string;
  galeriaVehicleUrls: string[];
  anunciActiu: boolean;
  anunciDestacat: number;
  venut: boolean;
  
  // Internal Notes (not part of the 7 steps, but additional field)
  notesInternes?: string;
}

interface MultiStepVehicleFormProps {
  initialData?: VehicleFormData | null; // For editing existing vehicle
  mode?: 'create' | 'edit';
  onSave: (vehicleData: VehicleFormData) => Promise<void>;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, title: 'Tipus de Vehicle', description: 'Selecciona el tipus de vehicle' },
  { id: 2, title: 'Dades Bàsiques', description: 'Marca, model i informació general' },
  { id: 3, title: 'Especificacions Tècniques', description: 'Detalls tècnics del vehicle' },
  { id: 4, title: 'Equipament i Extras', description: 'Equipament i característiques' },
  { id: 5, title: 'Informació Comercial', description: 'Garantia, origen i finançament' },
  { id: 6, title: 'Descripcions', description: 'Textos en diferents idiomes' },
  { id: 7, title: 'Imatges i Estat', description: 'Fotos i configuració final' }
];

export default function MultiStepVehicleForm({ 
  initialData, 
  mode = 'create',
  onSave, 
  onCancel 
}: MultiStepVehicleFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<VehicleFormData>({
    tipusVehicle: '',
    preu: '',
    titolAnunci: '',
    galeriaVehicleUrls: [],
    anunciActiu: true,
    anunciDestacat: 0,
    venut: false,
    extresCotxe: [],
    extresMoto: [],
    extresAutocaravana: [],
    extresHabitacle: [],
    notesInternes: '',
    ...initialData // Load existing vehicle data if editing
  });

  // Debug logging para ver qué datos iniciales se reciben
  useEffect(() => {
    if (initialData) {
      // Data loading logic here
    }
  }, [initialData, formData.tipusVehicle]);

  // Actualizar formData cuando initialData cambie (importante para edición)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData, mode]);

  // Store brands and models data for title generation
  const [brandsAndModelsData, setBrandsAndModelsData] = useState<{
    brandsData?: any;
    modelsData?: any;
  }>({});

  // Auto-generate title when marca, model, or version changes
  const generateTitle = useCallback((brandsData?: any, modelsData?: any) => {
    // Use provided data or stored data
    const finalBrandsData = brandsData || brandsAndModelsData.brandsData;
    const finalModelsData = modelsData || brandsAndModelsData.modelsData;
    let marca = '';
    let modelo = '';
    let marcaSlug = '';
    let modeloSlug = '';
    
    switch (formData.tipusVehicle) {
      case 'cotxe':
        marcaSlug = formData.marcaCotxe || '';
        modeloSlug = formData.modelsCotxe || '';
        break;
      case 'moto':
        marcaSlug = formData.marcaMoto || '';
        modeloSlug = formData.modelsMoto || '';
        break;
      case 'autocaravana':
        marcaSlug = formData.marquesAutocaravana || '';
        modeloSlug = formData.modelsAutocaravana || '';
        break;
      case 'vehicle-comercial':
        marcaSlug = formData.marquesComercial || '';
        modeloSlug = formData.modelsComercial || '';
        break;
      default:
        marcaSlug = '';
        modeloSlug = '';
    }
    
    // Buscar el label de la marca
    if (marcaSlug && finalBrandsData) {
      const brandsList = formData.tipusVehicle === 'moto' ? finalBrandsData.motorcycleBrands : finalBrandsData.carBrands;
      const brandItem = brandsList?.find((b: any) => b.value === marcaSlug);
      marca = brandItem ? brandItem.label : marcaSlug;
    } else {
      marca = marcaSlug;
    }
    
    // Buscar el label del modelo
    if (modeloSlug && finalModelsData) {
      const modelItem = finalModelsData.find((m: any) => m.value === modeloSlug);
      modelo = modelItem ? modelItem.label : modeloSlug;
    } else {
      modelo = modeloSlug;
    }
    
    const version = formData.versio || '';
    const titleParts = [marca, modelo, version].filter(part => part.trim() !== '');
    const newTitle = titleParts.join(' ').trim() || 'Vehicle sense títol';
    
    return newTitle;
  }, [
    formData.tipusVehicle,
    formData.marcaCotxe, 
    formData.marcaMoto, 
    formData.marquesAutocaravana,
    formData.marquesComercial,
    formData.modelsCotxe, 
    formData.modelsMoto, 
    formData.modelsAutocaravana,
    formData.modelsComercial,
    formData.versio,
    brandsAndModelsData
  ]);

  useEffect(() => {
    const newTitle = generateTitle();
    if (newTitle !== formData.titolAnunci) {
      setFormData(prev => ({ ...prev, titolAnunci: newTitle }));
    }
  }, [
    formData.tipusVehicle,
    formData.marcaCotxe, 
    formData.marcaMoto, 
    formData.marquesAutocaravana,
    formData.marquesComercial,
    formData.modelsCotxe, 
    formData.modelsMoto, 
    formData.modelsAutocaravana,
    formData.modelsComercial,
    formData.versio,
    brandsAndModelsData.brandsData,
    brandsAndModelsData.modelsData
  ]);

  // Auto-scroll to current step
  useEffect(() => {
    if (stepsContainerRef.current) {
      const stepElement = stepsContainerRef.current.children[currentStep - 1] as HTMLElement;
      if (stepElement) {
        stepElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentStep]);

  const updateFormData = (updates: Partial<VehicleFormData>) => {
    console.log('🔄 updateFormData called with:', updates);
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      console.log('📝 New formData state:', newData);
      return newData;
    });
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
      // Error handled by parent component
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
        return true; // Equipment is optional
      case 5:
        return true; // Commercial info is optional
      case 6:
        return !!formData.descripcioAnunciCA; // At least Catalan description required
      case 7:
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
          {mode === 'edit' ? 'Editar Vehicle' : 'Afegir Nou Vehicle'}
        </h2>
        
        {/* Step Navigation - Horizontal Slider */}
        <div className="mb-8 overflow-hidden relative">
          <div 
            ref={stepsContainerRef}
            className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          >
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-shrink-0 relative px-4 py-3 rounded-lg transition-all duration-300 min-w-[140px] ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white transform scale-105 shadow-lg'
                    : currentStep > step.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {/* Step Number - Positioned over text */}
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${
                      currentStep === step.id
                        ? 'bg-white text-blue-600'
                        : currentStep > step.id
                        ? 'bg-white text-green-600'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  
                  {/* Step Text */}
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${
                      currentStep === step.id || currentStep > step.id
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs leading-tight mt-1 opacity-75 ${
                      currentStep === step.id || currentStep > step.id
                        ? 'text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-8 py-8">
        {/* Auto-generated title preview with vehicle type icon */}
        {formData.titolAnunci && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 uppercase tracking-wide">
                    Títol generat automàticament
                  </h3>
                </div>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  {formData.titolAnunci}
                </p>
              </div>
              
              {/* Vehicle Type Icon */}
              {formData.tipusVehicle && (
                <div className="flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-lg border-2 border-blue-200 dark:border-blue-700">
                  {formData.tipusVehicle === 'cotxe' && (
                    <Car className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  )}
                  {formData.tipusVehicle === 'moto' && (
                    <Bike className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  )}
                  {formData.tipusVehicle === 'autocaravana' && (
                    <Home className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  )}
                  {formData.tipusVehicle === 'vehicle-comercial' && (
                    <Truck className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
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
              onBrandsAndModelsLoaded={(brandsData, modelsData) => {
                // Store the brands and models data for future use
                setBrandsAndModelsData({ brandsData, modelsData });
                // Generate title immediately with the new data
                const newTitle = generateTitle(brandsData, modelsData);
                if (newTitle !== formData.titolAnunci) {
                  setFormData(prev => ({ ...prev, titolAnunci: newTitle }));
                }
              }}
            />
          )}
          
          {currentStep === 3 && (
            <TechnicalSpecsStep 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          )}
          
          {currentStep === 4 && (
            <EquipmentExtrasStep 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          )}
          
          {currentStep === 5 && (
            <CommercialInfoStep 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          )}
          
          {currentStep === 6 && (
            <DescriptionsStep 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          )}
          
          {currentStep === 7 && (
            <ImagesAndStatusStep 
              formData={formData} 
              updateFormData={updateFormData} 
            />
          )}
        </div>

      </div>

      {/* Footer with Navigation */}
      <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium shadow-sm transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
          )}
        </div>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium shadow-sm transition-all duration-200"
          >
            Cancel·lar
          </button>
          
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg transition-all duration-200 disabled:shadow-none"
            >
              Següent
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!canProceed || isLoading}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg transition-all duration-200 disabled:shadow-none"
            >
              {isLoading ? 'Guardant...' : 'Guardar Vehicle'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
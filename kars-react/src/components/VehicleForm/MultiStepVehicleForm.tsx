import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Car, Zap, Truck, Home, ChevronDown, Upload, Image, X, Plus, Link } from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosAdmin } from '../../api/axiosClient';

// Types
interface ModelOption {
  value: string;
  label: string;
}

interface ModelSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  models: ModelOption[];
  loading: boolean;
  disabled: boolean;
  placeholder: string;
}

// Brand Search Input Component
interface BrandOption {
  value: string;
  label: string;
}

interface BrandSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  brands: BrandOption[];
  loading: boolean;
  placeholder: string;
}

const BrandSearchInput: React.FC<BrandSearchInputProps> = ({
  value,
  onChange,
  brands,
  loading,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search term when value changes externally
  useEffect(() => {
    const selectedBrand = brands.find(b => b.value === value);
    if (selectedBrand) {
      setSearchTerm(selectedBrand.label);
    } else {
      setSearchTerm(value);
    }
  }, [value, brands]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    if (!isOpen && newValue) {
      setIsOpen(true);
    }
  };

  const handleSelectBrand = (brand: BrandOption) => {
    setSearchTerm(brand.label);
    onChange(brand.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Marca *
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          disabled={loading}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 disabled:text-gray-500"
        />
        <ChevronDown 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
        />
      </div>

      {/* Dropdown */}
      {isOpen && !loading && (
        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <button
                key={brand.value}
                type="button"
                onClick={() => handleSelectBrand(brand)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              >
                {brand.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No s\'han trobat marques' : 'Escriu per buscar marques'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Model Search Input Component
const ModelSearchInput: React.FC<ModelSearchInputProps> = ({
  value,
  onChange,
  models,
  loading,
  disabled,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter models based on search term
  const filteredModels = models.filter(model =>
    model.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update search term when value changes externally
  useEffect(() => {
    const selectedModel = models.find(m => m.value === value);
    if (selectedModel) {
      setSearchTerm(selectedModel.label);
    } else {
      setSearchTerm(value);
    }
  }, [value, models]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue); // Allow free text input
    if (!isOpen && newValue) {
      setIsOpen(true);
    }
  };

  const handleSelectModel = (model: ModelOption) => {
    setSearchTerm(model.label);
    onChange(model.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Model *
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          disabled={disabled || loading}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-50 disabled:text-gray-500"
        />
        <ChevronDown 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
        />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <button
                key={model.value}
                type="button"
                onClick={() => handleSelectModel(model)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              >
                {model.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No s\'han trobat models' : 'Escriu per buscar models'}
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {models.length === 0 && !loading && (
        <p className="text-xs text-gray-500 mt-1">
          Pots escriure el model manualment si no apareix a la llista.
        </p>
      )}
    </div>
  );
};

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
  
  // Additional technical fields from payload
  emissionsVehicle?: string;
  consumUrba?: string;
  consumCarretera?: string;
  consumMixt?: string;
  emissionsCo2?: string;
  categoriaEcologica?: string;
  tipusTapisseria?: string;
  
  // Step 4: Equipment and Extras
  extresCotxe?: string[]; // Array of extras
  seguretat?: string[];
  confort?: string[];
  multimedia?: string[];
  
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
    seguretat: [],
    confort: [],
    multimedia: [],
    ...initialData // Load existing vehicle data if editing
  });

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
      case 'COTXE':
        marcaSlug = formData.marcaCotxe || '';
        modeloSlug = formData.modelsCotxe || '';
        break;
      case 'MOTO':
        marcaSlug = formData.marcaMoto || '';
        modeloSlug = formData.modelsMoto || '';
        break;
      case 'AUTOCARAVANA':
        marcaSlug = formData.marquesAutocaravana || '';
        modeloSlug = formData.modelsAutocaravana || '';
        break;
      default:
        marcaSlug = '';
        modeloSlug = '';
    }
    
    // Buscar el label de la marca
    if (marcaSlug && finalBrandsData) {
      const brandsList = formData.tipusVehicle === 'MOTO' ? finalBrandsData.motorcycleBrands : finalBrandsData.carBrands;
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
    formData.modelsCotxe, 
    formData.modelsMoto, 
    formData.modelsAutocaravana,
    formData.versio,
    brandsAndModelsData
  ]);

  useEffect(() => {
    const newTitle = generateTitle();
    if (newTitle !== formData.titolAnunci) {
      setFormData(prev => ({ ...prev, titolAnunci: newTitle }));
    }
  }, [generateTitle, formData.titolAnunci]);

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
      console.log('🚀 Saving vehicle with data:', formData);
      console.log('🔍 Key fields check:', {
        titolAnunci: formData.titolAnunci,
        titolAnunciLength: formData.titolAnunci?.length,
        tipusVehicle: formData.tipusVehicle,
        preu: formData.preu,
        preuType: typeof formData.preu
      });
      await onSave(formData);
    } catch (error) {
      console.error('❌ Error in handleSave:', error);
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
        {/* Auto-generated title preview */}
        {formData.titolAnunci && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
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
            <MultilingualDescriptionsStep 
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

// Step Components (to be implemented)
function VehicleTypeStep({ formData, updateFormData }: any) {
  const vehicleTypes = [
    { value: 'COTXE', label: 'Cotxe', icon: Car, description: 'Vehicles de turisme' },
    { value: 'MOTO', label: 'Motocicleta', icon: Zap, description: 'Motos i ciclomotors' },
    { value: 'AUTOCARAVANA', label: 'Autocaravana', icon: Home, description: 'Autocaravanes i campers' },
    { value: 'VEHICLE_COMERCIAL', label: 'Vehicle Comercial', icon: Truck, description: 'Furgonetes i camions' }
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
                  marquesAutocaravana: '',
                  modelsCotxe: '',
                  modelsMoto: '',
                  modelsAutocaravana: '',
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
}

function BasicInfoStep({ formData, updateFormData, onBrandsAndModelsLoaded }: any) {
  const [carBrands, setCarBrands] = useState<Array<{value: string, label: string}>>([]);
  const [motorcycleBrands, setMotorcycleBrands] = useState<Array<{value: string, label: string}>>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [models, setModels] = useState<Array<{value: string, label: string}>>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  
  // Axios configuration ready

  // Cargar marcas desde la API
  useEffect(() => {
    const loadBrands = async () => {
      setLoadingBrands(true);
      try {
        // Cargar marcas de coches (para coches, autocaravanas y comerciales)
        const carResponse = await axiosAdmin.get('/brands/cars');
        
        if (carResponse.data?.success && carResponse.data?.data) {
          setCarBrands(carResponse.data.data);
        } else {
          console.error('❌ Car brands response structure invalid:', carResponse.data);
          setCarBrands([]);
        }

        // Cargar marcas de motos
        const motoResponse = await axiosAdmin.get('/brands/motorcycles');
        
        if (motoResponse.data?.success && motoResponse.data?.data) {
          setMotorcycleBrands(motoResponse.data.data);
        } else {
          console.error('❌ Motorcycle brands response structure invalid:', motoResponse.data);
          setMotorcycleBrands([]);
        }
      } catch (error) {
        console.error('❌ Error cargando marcas:', error);
        console.error('❌ Error details:', {
          message: error.message,
          name: error.name,
          response: error.response?.data,
          status: error.response?.status
        });
        // Si hay error, usar arrays vacíos
        setCarBrands([]);
        setMotorcycleBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrands();
  }, []);

  // Notificar al componente padre cuando cambien las marcas o modelos
  useEffect(() => {
    if (onBrandsAndModelsLoaded && (carBrands.length > 0 || motorcycleBrands.length > 0)) {
      onBrandsAndModelsLoaded({ carBrands, motorcycleBrands }, models);
    }
  }, [carBrands, motorcycleBrands, models]);

  // Determinar qué marcas mostrar según el tipo de vehículo
  const getBrandsForVehicleType = () => {
    
    switch (formData.tipusVehicle) {
      case 'COTXE':
      case 'AUTOCARAVANA':
      case 'VEHICLE_COMERCIAL':
        return carBrands;
      case 'MOTO':
        return motorcycleBrands;
      default:
        return [];
    }
  };

  const currentBrands = getBrandsForVehicleType();

  // Función para cargar modelos cuando se selecciona una marca
  const loadModelsForBrand = async (brandSlug: string) => {
    if (!brandSlug) {
      setModels([]);
      return;
    }

    // Validar que el brandSlug sea una marca válida existente
    const validBrand = currentBrands.find(brand => brand.value === brandSlug);
    if (!validBrand) {
      console.log(`⏸️ Skipping models load for invalid brand: ${brandSlug}`);
      setModels([]);
      return;
    }

    setLoadingModels(true);
    try {
      console.log(`🔄 Loading models for valid brand: ${brandSlug}`);
      const response = await axiosAdmin.get(`/brands/${brandSlug}/models`);
      if (response.data?.success && response.data?.data) {
        setModels(response.data.data);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('Error cargando modelos:', error);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  // Efecto para cargar modelos cuando cambia la marca seleccionada
  useEffect(() => {
    const selectedBrand = 
      formData.tipusVehicle === 'COTXE' ? formData.marcaCotxe :
      formData.tipusVehicle === 'MOTO' ? formData.marcaMoto :
      formData.tipusVehicle === 'AUTOCARAVANA' ? formData.marquesAutocaravana :
      '';
    
    if (selectedBrand) {
      loadModelsForBrand(selectedBrand);
    } else {
      setModels([]);
    }
  }, [formData.marcaCotxe, formData.marcaMoto, formData.marquesAutocaravana, formData.tipusVehicle]);

  // Helper to get the currently selected brand
  const getSelectedBrand = () => {
    switch (formData.tipusVehicle) {
      case 'COTXE':
        return formData.marcaCotxe || '';
      case 'MOTO':
        return formData.marcaMoto || '';
      case 'AUTOCARAVANA':
        return formData.marquesAutocaravana || '';
      default:
        return '';
    }
  };

  const selectedBrand = getSelectedBrand();

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Dades bàsiques del vehicle
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Field - Searchable input with dropdown */}
        <BrandSearchInput
          value={
            formData.tipusVehicle === 'COTXE' ? formData.marcaCotxe || '' :
            formData.tipusVehicle === 'MOTO' ? formData.marcaMoto || '' :
            formData.tipusVehicle === 'AUTOCARAVANA' ? formData.marquesAutocaravana || '' :
            ''
          }
          onChange={(value) => {
            const fieldName = 
              formData.tipusVehicle === 'COTXE' ? 'marcaCotxe' :
              formData.tipusVehicle === 'MOTO' ? 'marcaMoto' :
              formData.tipusVehicle === 'AUTOCARAVANA' ? 'marquesAutocaravana' :
              '';
            if (fieldName) {
              updateFormData({ [fieldName]: value });
            }
          }}
          brands={currentBrands}
          loading={loadingBrands}
          placeholder={loadingBrands ? 'Carregant marcas...' : 'Busca o selecciona una marca...'}
        />

        {/* Model Field - Searchable input with dropdown */}
        <ModelSearchInput
          value={
            formData.tipusVehicle === 'COTXE' ? formData.modelsCotxe || '' :
            formData.tipusVehicle === 'MOTO' ? formData.modelsMoto || '' :
            formData.tipusVehicle === 'AUTOCARAVANA' ? formData.modelsAutocaravana || '' :
            ''
          }
          onChange={(value) => {
            const fieldName = 
              formData.tipusVehicle === 'COTXE' ? 'modelsCotxe' :
              formData.tipusVehicle === 'MOTO' ? 'modelsMoto' :
              formData.tipusVehicle === 'AUTOCARAVANA' ? 'modelsAutocaravana' :
              '';
            if (fieldName) {
              updateFormData({ [fieldName]: value });
            }
          }}
          models={models}
          loading={loadingModels}
          disabled={!selectedBrand}
          placeholder={
            loadingModels ? 'Carregant models...' : 
            !selectedBrand ? 
            'Selecciona primer una marca' : 
            'Busca o selecciona un model...'
          }
        />

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
    <div className="space-y-8">
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

        {/* Emissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emissions Vehicle
          </label>
          <select
            value={formData.emissionsVehicle || ''}
            onChange={(e) => updateFormData({ emissionsVehicle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona emissions</option>
            <option value="euro-6">Euro 6</option>
            <option value="euro-5">Euro 5</option>
            <option value="euro-4">Euro 4</option>
            <option value="euro-3">Euro 3</option>
            <option value="eco">ECO</option>
            <option value="zero">ZERO</option>
          </select>
        </div>

        {/* CO2 Emissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emissions CO2 (g/km)
          </label>
          <input
            type="number"
            min="0"
            value={formData.emissionsCo2 || ''}
            onChange={(e) => updateFormData({ emissionsCo2: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="120"
          />
        </div>

        {/* Fuel Consumption Urban */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consum Urbà (l/100km)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.consumUrba || ''}
            onChange={(e) => updateFormData({ consumUrba: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="6.5"
          />
        </div>

        {/* Fuel Consumption Highway */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consum Carretera (l/100km)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.consumCarretera || ''}
            onChange={(e) => updateFormData({ consumCarretera: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="4.2"
          />
        </div>

        {/* Fuel Consumption Mixed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consum Mixt (l/100km)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={formData.consumMixt || ''}
            onChange={(e) => updateFormData({ consumMixt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="5.1"
          />
        </div>

        {/* Upholstery Type (only for cars) */}
        {formData.tipusVehicle === 'COTXE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipus Tapisseria
            </label>
            <select
              value={formData.tipusTapisseria || ''}
              onChange={(e) => updateFormData({ tipusTapisseria: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona tapisseria</option>
              <option value="tela">Tela</option>
              <option value="cuir">Cuir</option>
              <option value="semicuir">Semicuir</option>
              <option value="alcantara">Alcantara</option>
              <option value="vinil">Vinil</option>
            </select>
          </div>
        )}

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
  const [activeTab, setActiveTab] = useState('ca');
  
  const languages = [
    { code: 'ca', name: 'Català', flag: '🏴󠁣󠁯󠁣󠁡󠁿', required: true },
    { code: 'es', name: 'Español', flag: '🇪🇸', required: false },
    { code: 'en', name: 'English', flag: '🇬🇧', required: false },
    { code: 'fr', name: 'Français', flag: '🇫🇷', required: false }
  ];

  const getFieldName = (code: string) => {
    const mapping: Record<string, string> = {
      'ca': 'descripcioAnunciCA',
      'es': 'descripcioAnunciES', 
      'en': 'descripcioAnunciEN',
      'fr': 'descripcioAnunciFR'
    };
    return mapping[code];
  };

  const getPlaceholder = (code: string) => {
    const placeholders: Record<string, string> = {
      'ca': 'Descripció detallada del vehicle en català...',
      'es': 'Descripción detallada del vehículo en español...',
      'en': 'Detailed vehicle description in English...',
      'fr': 'Description détaillée du véhicule en français...'
    };
    return placeholders[code];
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Descripcions en diferents idiomes
      </h3>
      
      {/* Language Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {languages.map((lang) => {
            const fieldName = getFieldName(lang.code);
            const hasContent = formData[fieldName] && formData[fieldName].trim().length > 0;
            
            return (
              <button
                key={lang.code}
                onClick={() => setActiveTab(lang.code)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === lang.code
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {lang.required && <span className="text-red-500">*</span>}
                {hasContent && (
                  <span className="inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {languages.map((lang) => {
          if (activeTab !== lang.code) return null;
          
          const fieldName = getFieldName(lang.code);
          
          return (
            <div key={lang.code} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{lang.flag}</span>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {lang.name}
                  {lang.required && <span className="text-red-500 ml-1">*</span>}
                </h4>
              </div>
              
              {/* Rich Text Editor Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text enriquit
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  {/* Simple toolbar */}
                  <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(`textarea-${lang.code}`) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = textarea.value.substring(start, end);
                          const newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
                          updateFormData({ [fieldName]: newText });
                        }
                      }}
                      className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(`textarea-${lang.code}`) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = textarea.value.substring(start, end);
                          const newText = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end);
                          updateFormData({ [fieldName]: newText });
                        }
                      }}
                      className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <em>I</em>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(`textarea-${lang.code}`) as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const newText = textarea.value.substring(0, start) + '\n• ' + textarea.value.substring(start);
                          updateFormData({ [fieldName]: newText });
                        }
                      }}
                      className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      •
                    </button>
                  </div>
                  
                  <textarea
                    id={`textarea-${lang.code}`}
                    rows={8}
                    value={formData[fieldName] || ''}
                    onChange={(e) => updateFormData({ [fieldName]: e.target.value })}
                    className="w-full px-3 py-2 bg-transparent text-gray-900 dark:text-white resize-none border-0 focus:ring-0 focus:outline-none"
                    placeholder={getPlaceholder(lang.code)}
                  />
                </div>
                
                {/* Character count */}
                <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(formData[fieldName] || '').length} caràcters
                </div>
              </div>
              
              {/* Preview */}
              {formData[fieldName] && formData[fieldName].trim().length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vista prèvia
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div 
                      className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: formData[fieldName]
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n• /g, '<br/>• ')
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Step 4: Equipment and Extras
function EquipmentExtrasStep({ formData, updateFormData }: any) {
  const availableExtras = [
    'abs', 'airbag-conductor', 'airbag-passatger', 'airbags-laterals', 'airbags-cortina',
    'aire-acondicionat', 'climatitzador', 'calefaccio', 'vidres-electrics',
    'miralls-electrics', 'direccio-assistida', 'control-creuer', 'navegador-gps',
    'radio-cd', 'bluetooth', 'usb', 'aux', 'mans-lliures', 'camera-aparcament',
    'sensors-aparcament', 'fars-xenon', 'fars-led', 'llantes-aliatge', 'barres-sostre',
    'ganxo-remolc', 'seients-cuir', 'seients-calefactats', 'volant-cuir',
    'ordenador-viatge', 'control-estabilitat', 'control-traccio'
  ];

  const toggleExtra = (extra: string) => {
    const currentExtras = formData.extresCotxe || [];
    const updatedExtras = currentExtras.includes(extra)
      ? currentExtras.filter((item: string) => item !== extra)
      : [...currentExtras, extra];
    updateFormData({ extresCotxe: updatedExtras });
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
          {availableExtras.map((extra) => {
            const isSelected = (formData.extresCotxe || []).includes(extra);
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
}

// Step 5: Commercial Information
function CommercialInfoStep({ formData, updateFormData }: any) {
  const warrantyOptions = [
    { value: '', label: 'Selecciona garantia' },
    { value: '6-mesos', label: '6 mesos' },
    { value: '12-mesos', label: '12 mesos' },
    { value: '24-mesos', label: '24 mesos' },
    { value: '36-mesos', label: '36 mesos' },
    { value: '48-mesos', label: '48 mesos' },
    { value: 'fabricant', label: 'Garantia del fabricant' },
    { value: 'sense-garantia', label: 'Sense garantia' }
  ];

  const originOptions = [
    { value: '', label: 'Selecciona origen' },
    { value: 'andorra', label: 'Andorra' },
    { value: 'espanya', label: 'Espanya' },
    { value: 'franca', label: 'França' },
    { value: 'alemanya', label: 'Alemanya' },
    { value: 'importacio', label: 'Importació' },
    { value: 'altres', label: 'Altres' }
  ];

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Informació comercial
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Warranty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Garantia
          </label>
          <select
            value={formData.garantia || ''}
            onChange={(e) => updateFormData({ garantia: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {warrantyOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Origin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Origen del Vehicle
          </label>
          <select
            value={formData.origen || ''}
            onChange={(e) => updateFormData({ origen: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {originOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Accidental Vehicle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vehicle Accidentat
          </label>
          <select
            value={formData.vehicleAccidentat || ''}
            onChange={(e) => updateFormData({ vehicleAccidentat: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona estat</option>
            <option value="no">No accidentat</option>
            <option value="si-reparat">Accidentat però reparat</option>
            <option value="danys-menors">Danys menors</option>
            <option value="danys-importants">Danys importants</option>
          </select>
        </div>

        {/* VAT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            IVA
          </label>
          <select
            value={formData.iva || ''}
            onChange={(e) => updateFormData({ iva: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona IVA</option>
            <option value="inclou">Preu amb IVA inclòs</option>
            <option value="deductible">IVA deductible</option>
            <option value="exempt">Exempt d'IVA</option>
          </select>
        </div>

        {/* Financing */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Finançament
          </label>
          <select
            value={formData.finacament || ''}
            onChange={(e) => updateFormData({ finacament: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona finançament</option>
            <option value="disponible">Finançament disponible</option>
            <option value="bank">Finançament bancari</option>
            <option value="leasing">Leasing</option>
            <option value="renting">Renting</option>
            <option value="no-disponible">No disponible</option>
          </select>
        </div>
      </div>
      
      {/* Vehicle Notes - Rich Text */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas del vehículo
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Notes internes per al seguiment del vehicle (no es mostren públicament)
        </p>
        
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          {/* Simple toolbar */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('textarea-notes') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = textarea.value.substring(start, end);
                  const newText = textarea.value.substring(0, start) + `**${selectedText}**` + textarea.value.substring(end);
                  updateFormData({ notesVehicle: newText });
                  setTimeout(() => textarea.focus(), 0);
                }
              }}
              className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <strong>B</strong>
            </button>
            <button
              type="button" 
              onClick={() => {
                const textarea = document.getElementById('textarea-notes') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const selectedText = textarea.value.substring(start, end);
                  const newText = textarea.value.substring(0, start) + `*${selectedText}*` + textarea.value.substring(end);
                  updateFormData({ notesVehicle: newText });
                  setTimeout(() => textarea.focus(), 0);
                }
              }}
              className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('textarea-notes') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const newText = textarea.value.substring(0, start) + '\\n• ' + textarea.value.substring(start);
                  updateFormData({ notesVehicle: newText });
                  setTimeout(() => textarea.focus(), 0);
                }
              }}
              className="px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              •
            </button>
            <div className="border-l border-gray-200 dark:border-gray-600 h-6 mx-2"></div>
            <button
              type="button"
              onClick={() => {
                const textarea = document.getElementById('textarea-notes') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const today = new Date().toLocaleDateString('ca-ES');
                  const newText = textarea.value.substring(0, start) + `\\n**${today}:** ` + textarea.value.substring(start);
                  updateFormData({ notesVehicle: newText });
                  setTimeout(() => textarea.focus(), 0);
                }
              }}
              className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800"
            >
              + Data
            </button>
          </div>
          
          <textarea
            id="textarea-notes"
            rows={6}
            value={formData.notesVehicle || ''}
            onChange={(e) => updateFormData({ notesVehicle: e.target.value })}
            className="w-full px-3 py-2 bg-transparent text-gray-900 dark:text-white resize-none border-0 focus:ring-0 focus:outline-none"
            placeholder="Notes internes sobre l'estat, procedència, reparacions, contactes, etc..."
          />
        </div>
        
        {/* Character count */}
        <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
          {(formData.notesVehicle || '').length} caràcters
        </div>
        
        {/* Preview */}
        {formData.notesVehicle && formData.notesVehicle.trim().length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vista prèvia
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div 
                className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: formData.notesVehicle
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n• /g, '<br/>• ')
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for featured image URL
const getFeaturedImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // For relative paths, ensure proper format
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

// Helper function for gallery image URLs
const getGalleryImageUrl = (path: string | undefined): string => {
  if (!path) return '';
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // For relative paths, ensure proper format
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  return path;
};

function ImagesAndStatusStep({ formData, updateFormData }: any) {
  const [showUrlInput, setShowUrlInput] = useState({ featured: false, gallery: false });
  const [urlInputs, setUrlInputs] = useState({ featured: '', gallery: '' });
  const [uploading, setUploading] = useState(false);

  // Debug current form data
  console.log('🔍 ImagesAndStatusStep formData:', {
    imatgeDestacadaUrl: formData.imatgeDestacadaUrl,
    galeriaVehicleUrls: formData.galeriaVehicleUrls
  });

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent, type: 'featured' | 'gallery') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await uploadImages(imageFiles, type);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle file input
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'gallery') => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await uploadImages(imageFiles, type);
    }
  };

  // Upload images to server
  const uploadImages = async (files: File[], type: 'featured' | 'gallery') => {
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      if (type === 'gallery' && files.length > 1) {
        // Upload multiple files for gallery
        const formData = new FormData();
        files.forEach(file => {
          formData.append('images', file);
        });

        const response = await axiosAdmin.post('/upload/gallery', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          const urls = response.data.data.map((item: any) => item.url);
          uploadedUrls.push(...urls);
        }
      } else {
        // Upload single files one by one
        for (const file of files) {
          const fileFormData = new FormData();
          fileFormData.append('image', file);

          const response = await axiosAdmin.post('/upload/image', fileFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success) {
            uploadedUrls.push(response.data.data.url);
          }
        }
      }

      // Update form data
      if (type === 'featured') {
        console.log('🖼️ Updating featured image URL:', uploadedUrls[0]);
        updateFormData({ imatgeDestacadaUrl: uploadedUrls[0] });
      } else {
        const currentUrls = formData.galeriaVehicleUrls || [];
        console.log('🖼️ Updating gallery URLs:', [...currentUrls, ...uploadedUrls]);
        updateFormData({ 
          galeriaVehicleUrls: [...currentUrls, ...uploadedUrls] 
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error && error.message.includes('File too large')) {
        toast.error('Les imatges són massa grans. Mida màxima: 50MB');
      } else if (error instanceof Error && error.message.includes('Authentication')) {
        toast.error('Error d\'autenticació. Torna a iniciar sessió');
      } else {
        toast.error('Error pujant les imatges. Si us plau, torna-ho a provar.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle URL input - Download and save to media folder
  const handleUrlSubmit = async (type: 'featured' | 'gallery') => {
    const url = urlInputs[type];
    if (!url) return;

    setUploading(true);
    try {
      console.log('📥 Downloading image from URL:', url);
      // Download image from URL and save to media folder
      const response = await axiosAdmin.post('/upload/image-from-url', {
        url,
        width: 1200,
        height: 800,
        quality: 80
      });

      if (response.data.success) {
        const downloadedUrl = response.data.data.url;
        
        if (type === 'featured') {
          console.log('🔗 Updating featured image from URL:', downloadedUrl);
          updateFormData({ imatgeDestacadaUrl: downloadedUrl });
        } else {
          const currentUrls = formData.galeriaVehicleUrls || [];
          console.log('🔗 Updating gallery from URL:', [...currentUrls, downloadedUrl]);
          updateFormData({ 
            galeriaVehicleUrls: [...currentUrls, downloadedUrl] 
          });
        }

        setUrlInputs(prev => ({ ...prev, [type]: '' }));
        setShowUrlInput(prev => ({ ...prev, [type]: false }));
      }
    } catch (error: any) {
      console.error('URL download error:', error);
      const errorMessage = error.response?.data?.error || 'Error descarregant la imatge des de la URL. Comprova que la URL sigui vàlida.';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Remove image from gallery
  const removeFromGallery = (index: number) => {
    const currentUrls = formData.galeriaVehicleUrls || [];
    const newUrls = currentUrls.filter((_, i) => i !== index);
    updateFormData({ galeriaVehicleUrls: newUrls });
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Imatges i estat de l'anunci
      </h3>
      
      {/* Featured Image Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Imatge Principal
        </h4>
        
        <div
          onDrop={(e) => handleDrop(e, 'featured')}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            formData.imatgeDestacadaUrl
              ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-gray-50 dark:bg-gray-700/50'
          }`}
        >
          {formData.imatgeDestacadaUrl ? (
            <div className="relative">
              <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                ✅ Imagen destacada carregada
              </p>
              <img
                src={getFeaturedImageUrl(formData.imatgeDestacadaUrl)}
                alt="Imagen destacada"
                className="w-full h-48 object-cover rounded-lg border border-green-200"
                onError={(e) => {
                  console.error('❌ Error loading featured image:', formData.imatgeDestacadaUrl);
                  console.error('❌ Processed URL:', getFeaturedImageUrl(formData.imatgeDestacadaUrl));
                  toast.error('Error carregant la imatge destacada');
                  (e.target as HTMLImageElement).style.border = '2px solid red';
                }}
                onLoad={() => {
                  console.log('✅ Featured image loaded successfully:', formData.imatgeDestacadaUrl);
                  console.log('✅ Processed URL:', getFeaturedImageUrl(formData.imatgeDestacadaUrl));
                }}
              />
              <button
                onClick={() => updateFormData({ imatgeDestacadaUrl: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Arrossega una imatge aquí o
                </p>
                <div className="mt-2 flex gap-2 justify-center">
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Seleccionar arxiu
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'featured')}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => setShowUrlInput(prev => ({ ...prev, featured: !prev.featured }))}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Link className="w-4 h-4" />
                    URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showUrlInput.featured && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInputs.featured}
              onChange={(e) => setUrlInputs(prev => ({ ...prev, featured: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => handleUrlSubmit('featured')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Afegir
            </button>
          </div>
        )}
      </div>

      {/* Gallery Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Galeria d'Imatges
        </h4>
        
        <div
          onDrop={(e) => handleDrop(e, 'gallery')}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-blue-400 bg-gray-50 dark:bg-gray-700/50 transition-colors"
        >
          <div className="text-center">
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arrossega múltiples imatges aquí o
              </p>
              <div className="mt-2 flex gap-2 justify-center">
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Seleccionar arxius
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, 'gallery')}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowUrlInput(prev => ({ ...prev, gallery: !prev.gallery }))}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <Link className="w-4 h-4" />
                  URL
                </button>
              </div>
            </div>
          </div>
        </div>

        {showUrlInput.gallery && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInputs.gallery}
              onChange={(e) => setUrlInputs(prev => ({ ...prev, gallery: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => handleUrlSubmit('gallery')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Afegir
            </button>
          </div>
        )}

        {/* Gallery Grid */}
        {formData.galeriaVehicleUrls && formData.galeriaVehicleUrls.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {formData.galeriaVehicleUrls.length} imagen{formData.galeriaVehicleUrls.length !== 1 ? 's' : ''} carregad{formData.galeriaVehicleUrls.length !== 1 ? 'es' : 'a'}:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.galeriaVehicleUrls.map((url: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={getGalleryImageUrl(url)}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-green-200"
                    onError={(e) => {
                      console.error('❌ Error loading gallery image:', url);
                      console.error('❌ Processed URL:', getGalleryImageUrl(url));
                      toast.error(`Error carregant la imatge ${index + 1} de la galeria`);
                      (e.target as HTMLImageElement).style.border = '2px solid red';
                    }}
                    onLoad={() => {
                      console.log('✅ Gallery image loaded successfully:', url);
                      console.log('✅ Processed URL:', getGalleryImageUrl(url));
                    }}
                  />
                  <button
                    onClick={() => removeFromGallery(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          Estat de l'anunci
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-900 dark:text-white">Pujant imatges...</span>
          </div>
        </div>
      )}
    </div>
  );
}
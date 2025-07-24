import React, { useState, useEffect } from 'react';
import { axiosAdmin } from '../../../api/axiosClient';
import SearchableSelect from '../../ui/SearchableSelect';

interface BasicInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
  onBrandsAndModelsLoaded?: (brands: any, models: any) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ 
  formData, 
  updateFormData, 
  onBrandsAndModelsLoaded 
}) => {
  const [carBrands, setCarBrands] = useState<Array<{value: string, label: string}>>([]);
  const [motorcycleBrands, setMotorcycleBrands] = useState<Array<{value: string, label: string}>>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [models, setModels] = useState<Array<{value: string, label: string}>>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  
  // Estados para los nuevos campos técnicos
  const [fuelTypes, setFuelTypes] = useState<Array<{value: string, label: string}>>([]);
  const [transmissionTypes, setTransmissionTypes] = useState<Array<{value: string, label: string}>>([]);
  const [propulsionTypes, setPropulsionTypes] = useState<Array<{value: string, label: string}>>([]);
  const [vehicleStates, setVehicleStates] = useState<Array<{value: string, label: string}>>([]);
  const [bodyTypes, setBodyTypes] = useState<Array<{value: string, label: string}>>([]);
  const [motorcycleBodyTypes, setMotorcycleBodyTypes] = useState<Array<{value: string, label: string}>>([]);
  const [caravanBodyTypes, setCaravanBodyTypes] = useState<Array<{value: string, label: string}>>([]);
  const [commercialBodyTypes, setCommercialBodyTypes] = useState<Array<{value: string, label: string}>>([]);
  const [loadingTechnicalData, setLoadingTechnicalData] = useState(false);
  
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
  
  // Cargar datos técnicos desde la API
  useEffect(() => {
    const loadTechnicalData = async () => {
      setLoadingTechnicalData(true);
      try {
        // Cargar todos los datos técnicos en paralelo
        const [fuelResponse, transmissionResponse, propulsionResponse, statesResponse] = await Promise.all([
          axiosAdmin.get('/fuel-types'),
          axiosAdmin.get('/transmission-types'),
          axiosAdmin.get('/propulsion-types'),
          axiosAdmin.get('/vehicle-states')
        ]);
        
        if (fuelResponse.data?.data) {
          setFuelTypes(fuelResponse.data.data.map((item: any) => ({
            value: item.slug,
            label: item.name
          })));
        }
        
        if (transmissionResponse.data?.data) {
          setTransmissionTypes(transmissionResponse.data.data.map((item: any) => ({
            value: item.slug,
            label: item.name
          })));
        }
        
        if (propulsionResponse.data?.data) {
          setPropulsionTypes(propulsionResponse.data.data.map((item: any) => ({
            value: item.slug,
            label: item.name
          })));
        }
        
        if (statesResponse.data?.data) {
          setVehicleStates(statesResponse.data.data.map((item: any) => ({
            value: item.slug,
            label: item.name
          })));
        }
        
      } catch (error) {
        console.error('Error cargando datos técnicos:', error);
      } finally {
        setLoadingTechnicalData(false);
      }
    };
    
    loadTechnicalData();
  }, []);
  
  // Función para cargar tipos de carrocería según el tipo de vehículo
  const loadBodyTypes = async (vehicleType: string) => {
    try {
      let endpoint = '';
      switch (vehicleType) {
        case 'COTXE':
          endpoint = '/body-types';
          break;
        case 'MOTO':
          endpoint = '/motorcycle-body-types';
          break;
        case 'AUTOCARAVANA':
          endpoint = '/caravan-body-types';
          break;
        case 'VEHICLE_COMERCIAL':
          endpoint = '/commercial-body-types';
          break;
        default:
          return;
      }

      const response = await axiosAdmin.get(endpoint);
      if (response.data?.data) {
        const transformedData = response.data.data.map((item: any) => ({
          value: item.slug,
          label: item.name
        }));
        
        switch (vehicleType) {
          case 'COTXE':
            setBodyTypes(transformedData);
            break;
          case 'MOTO':
            setMotorcycleBodyTypes(transformedData);
            break;
          case 'AUTOCARAVANA':
            setCaravanBodyTypes(transformedData);
            break;
          case 'VEHICLE_COMERCIAL':
            setCommercialBodyTypes(transformedData);
            break;
        }
      }
    } catch (error) {
      console.error(`Error cargando tipos de carrocería para ${vehicleType}:`, error);
    }
  };

  // Cargar tipos de carrocería cuando cambie el tipo de vehículo
  useEffect(() => {
    if (formData.tipusVehicle) {
      loadBodyTypes(formData.tipusVehicle);
    }
  }, [formData.tipusVehicle]);

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
      setModels([]);
      return;
    }

    setLoadingModels(true);
    try {
      const response = await axiosAdmin.get(`/brands/${brandSlug}/models`);
      
      if (response.data?.success && response.data?.data) {
        // Transformar los modelos para que tengan la estructura correcta
        const transformedModels = response.data.data.map((model: any) => ({
          value: model.slug || model.value,
          label: model.name || model.label
        }));
        setModels(transformedModels);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error(`❌ Error loading models for ${brandSlug}:`, error);
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
  }, [formData.marcaCotxe, formData.marcaMoto, formData.marquesAutocaravana, formData.tipusVehicle, currentBrands]);

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
        {/* Brand Field - Searchable select with clear button */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Marca *
          </label>
          <SearchableSelect
            options={currentBrands.map(brand => ({ value: brand.value, label: brand.label }))}
            value={
              formData.tipusVehicle === 'COTXE' ? formData.marcaCotxe || '' :
              formData.tipusVehicle === 'MOTO' ? formData.marcaMoto || '' :
              formData.tipusVehicle === 'AUTOCARAVANA' ? formData.marquesAutocaravana || '' :
              ''
            }
            onValueChange={(value) => {
              const fieldName = 
                formData.tipusVehicle === 'COTXE' ? 'marcaCotxe' :
                formData.tipusVehicle === 'MOTO' ? 'marcaMoto' :
                formData.tipusVehicle === 'AUTOCARAVANA' ? 'marquesAutocaravana' :
                '';
              if (fieldName) {
                updateFormData({ [fieldName]: value });
              }
            }}
            loading={loadingBrands}
            placeholder={loadingBrands ? 'Carregant marcas...' : 'Busca o selecciona una marca...'}
            allowClear={true}
            showSearch={true}
            emptyMessage="No s'han trobat marcas"
          />
        </div>

        {/* Model Field - Searchable select with clear button */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Model *
          </label>
          <SearchableSelect
            options={models.map(model => ({ value: model.value, label: model.label }))}
            value={
              formData.tipusVehicle === 'COTXE' ? formData.modelsCotxe || '' :
              formData.tipusVehicle === 'MOTO' ? formData.modelsMoto || '' :
              formData.tipusVehicle === 'AUTOCARAVANA' ? formData.modelsAutocaravana || '' :
              ''
            }
            onValueChange={(value) => {
              const fieldName = 
                formData.tipusVehicle === 'COTXE' ? 'modelsCotxe' :
                formData.tipusVehicle === 'MOTO' ? 'modelsMoto' :
                formData.tipusVehicle === 'AUTOCARAVANA' ? 'modelsAutocaravana' :
                '';
              if (fieldName) {
                updateFormData({ [fieldName]: value });
              }
            }}
            loading={loadingModels}
            disabled={!selectedBrand}
            placeholder={
              loadingModels ? 'Carregant models...' : 
              !selectedBrand ? 
              'Selecciona primer una marca' : 
              'Busca o selecciona un model...'
            }
            allowClear={true}
            showSearch={true}
            emptyMessage="No s'han trobat models"
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
      
      {/* Sección de datos técnicos */}
      <div className="mt-12">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
          Dades tècniques bàsiques
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipus de Combustible
            </label>
            <SearchableSelect
              options={fuelTypes}
              value={formData.tipusCombustible || ''}
              onValueChange={(value) => updateFormData({ tipusCombustible: value })}
              placeholder="Selecciona combustible..."
              allowClear={true}
              showSearch={true}
              loading={loadingTechnicalData}
              emptyMessage="No s'han trobat tipus de combustible"
            />
          </div>
          
          {/* Transmission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipus de Canvi
            </label>
            <SearchableSelect
              options={transmissionTypes}
              value={formData.tipusCanvi || ''}
              onValueChange={(value) => updateFormData({ tipusCanvi: value })}
              placeholder="Selecciona tipus de canvi..."
              allowClear={true}
              showSearch={true}
              loading={loadingTechnicalData}
              emptyMessage="No s'han trobat tipus de canvi"
            />
          </div>
          
          {/* Propulsion Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipus de Propulsor
            </label>
            <SearchableSelect
              options={propulsionTypes}
              value={formData.tipusPropulsor || ''}
              onValueChange={(value) => updateFormData({ tipusPropulsor: value })}
              placeholder="Selecciona tipus de propulsor..."
              allowClear={true}
              showSearch={true}
              loading={loadingTechnicalData}
              emptyMessage="No s'han trobat tipus de propulsor"
            />
          </div>
          
          {/* Vehicle State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estat del Vehicle
            </label>
            <SearchableSelect
              options={vehicleStates}
              value={formData.estatVehicle || ''}
              onValueChange={(value) => updateFormData({ estatVehicle: value })}
              placeholder="Selecciona estat..."
              allowClear={true}
              showSearch={false}
              loading={loadingTechnicalData}
              emptyMessage="No s'han trobat estats de vehicle"
            />
          </div>
          
          {/* Body Type - based on vehicle type */}
          {formData.tipusVehicle && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipus de Carrosseria
              </label>
              <SearchableSelect
                options={
                  formData.tipusVehicle === 'COTXE' ? bodyTypes :
                  formData.tipusVehicle === 'MOTO' ? motorcycleBodyTypes :
                  formData.tipusVehicle === 'AUTOCARAVANA' ? caravanBodyTypes :
                  formData.tipusVehicle === 'VEHICLE_COMERCIAL' ? commercialBodyTypes :
                  []
                }
                value={
                  formData.tipusVehicle === 'COTXE' ? (formData.carrosseriaCotxe || '') :
                  formData.tipusVehicle === 'MOTO' ? (formData.carrosseriaMoto || '') :
                  formData.tipusVehicle === 'AUTOCARAVANA' ? (formData.carrosseriaCaravana || '') :
                  formData.tipusVehicle === 'VEHICLE_COMERCIAL' ? (formData.carrosseriaComercial || '') :
                  ''
                }
                onValueChange={(value) => {
                  const fieldName = 
                    formData.tipusVehicle === 'COTXE' ? 'carrosseriaCotxe' :
                    formData.tipusVehicle === 'MOTO' ? 'carrosseriaMoto' :
                    formData.tipusVehicle === 'AUTOCARAVANA' ? 'carrosseriaCaravana' :
                    formData.tipusVehicle === 'VEHICLE_COMERCIAL' ? 'carrosseriaComercial' :
                    null;
                  if (fieldName) {
                    updateFormData({ [fieldName]: value });
                  }
                }}
                placeholder="Selecciona tipus de carrosseria..."
                allowClear={true}
                showSearch={true}
                emptyMessage="No s'han trobat tipus de carrosseria"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
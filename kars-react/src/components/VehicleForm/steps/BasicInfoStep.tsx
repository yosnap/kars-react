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
      setModels([]);
      return;
    }

    setLoadingModels(true);
    try {
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
    </div>
  );
};

export default BasicInfoStep;
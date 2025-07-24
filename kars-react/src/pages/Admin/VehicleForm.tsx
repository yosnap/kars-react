import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import MultiStepVehicleForm from '../../components/VehicleForm/MultiStepVehicleForm';
import { axiosAdmin } from '../../api/axiosClient';

interface VehicleFormProps {
  mode: 'create' | 'edit';
}

const VehicleForm: React.FC<VehicleFormProps> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(mode === 'edit');
  const [vehicleData, setVehicleData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadVehicle();
    }
  }, [mode, id]);

  // Función para transformar datos del API al formato que espera el formulario
  const transformApiDataToFormData = (apiData: any) => {
    
    // Debug específico para tipusVehicle
    const rawTipusVehicle = apiData.tipusVehicle || apiData['tipus-vehicle'] || '';
    
    // Normalizar el tipo de vehículo para asegurar que coincida con los valores esperados
    const normalizeTipusVehicle = (value: string) => {
      if (!value) return '';
      
      const normalized = value.toUpperCase().trim();
      
      // Mapear valores comunes a los esperados por el formulario
      const mapping: Record<string, string> = {
        'COTXE': 'COTXE',
        'CAR': 'COTXE',
        'COCHE': 'COTXE',
        'MOTO': 'MOTO',
        'MOTORCYCLE': 'MOTO',
        'MOTOCICLETA': 'MOTO',
        'AUTOCARAVANA': 'AUTOCARAVANA',
        'CAMPER': 'AUTOCARAVANA',
        'VEHICLE_COMERCIAL': 'VEHICLE_COMERCIAL',
        'COMERCIAL': 'VEHICLE_COMERCIAL',
        'TRUCK': 'VEHICLE_COMERCIAL',
        'FURGONETA': 'VEHICLE_COMERCIAL'
      };
      
      return mapping[normalized] || normalized;
    };
    
    const tipusVehicleFromApi = normalizeTipusVehicle(rawTipusVehicle);
    
    const formData = {
      // Step 1: Vehicle Type
      tipusVehicle: tipusVehicleFromApi,
      
      // Step 2: Basic Info  
      marcaCotxe: apiData.marcaCotxe || apiData['marca-cotxe'] || '',
      marcaMoto: apiData.marcaMoto || apiData['marca-moto'] || '',
      marquesAutocaravana: apiData.marquesAutocaravana || apiData['marques-autocaravana'] || '',
      modelsCotxe: apiData.modelsCotxe || apiData['models-cotxe'] || '',
      modelsMoto: apiData.modelsMoto || apiData['models-moto'] || '',
      modelsAutocaravana: apiData.modelsAutocaravana || apiData['models-autocaravana'] || '',
      versio: apiData.versio || '',
      any: apiData.any || apiData['any-fabricacio'] || '',
      preu: String(apiData.preu || ''),
      quilometratge: String(apiData.quilometratge || ''),
      
      // Auto-generated title
      titolAnunci: apiData.titolAnunci || apiData['titol-anunci'] || '',
      
      // Step 3: Technical Specs
      tipusCombustible: apiData.tipusCombustible || apiData['tipus-combustible'] || '',
      tipusCanvi: apiData.tipusCanvi || apiData['tipus-canvi'] || '',
      tipusPropulsor: apiData.tipusPropulsor || apiData['tipus-propulsor'] || '',
      potenciaCv: String(apiData.potenciaCv || apiData['potencia-cv'] || ''),
      potenciaKw: String(apiData.potenciaKw || apiData['potencia-kw'] || ''),
      cilindrada: String(apiData.cilindrada || ''),
      colorVehicle: apiData.colorVehicle || apiData['color-vehicle'] || '',
      portesCotxe: String(apiData.portesCotxe || apiData['portes-cotxe'] || ''),
      placesCotxe: String(apiData.placesCotxe || apiData['places-cotxe'] || ''),
      estatVehicle: apiData.estatVehicle || apiData['estat-vehicle'] || '',
      
      // Additional technical fields
      emissionsVehicle: apiData.emissionsVehicle || apiData['emissions-vehicle'] || '',
      consumUrba: apiData.consumUrba || apiData['consum-urba'] || '',
      consumCarretera: apiData.consumCarretera || apiData['consum-carretera'] || '',
      consumMixt: apiData.consumMixt || apiData['consum-mixt'] || '',
      emissionsCo2: apiData.emissionsCo2 || apiData['emissions-co2'] || '',
      tipusTapisseria: apiData.tipusTapisseria || apiData['tipus-tapisseria'] || '',
      
      // Step 4: Equipment and Extras - Mapear todos los tipos según el vehículo
      extresCotxe: Array.isArray(apiData.extresCotxe) ? apiData.extresCotxe : 
                   Array.isArray(apiData['extres-cotxe']) ? apiData['extres-cotxe'] : [],
      extresMoto: Array.isArray(apiData.extresMoto) ? apiData.extresMoto : 
                  Array.isArray(apiData['extres-moto']) ? apiData['extres-moto'] : [],
      extresAutocaravana: Array.isArray(apiData.extresAutocaravana) ? apiData.extresAutocaravana : 
                          Array.isArray(apiData['extres-autocaravana']) ? apiData['extres-autocaravana'] : [],
      extresHabitacle: Array.isArray(apiData.extresHabitacle) ? apiData.extresHabitacle : 
                       Array.isArray(apiData['extres-habitacle']) ? apiData['extres-habitacle'] : [],
      
      // Step 5: Commercial Information
      garantia: apiData.garantia || '',
      vehicleAccidentat: apiData.vehicleAccidentat || apiData['vehicle-accidentat'] || '',
      origen: apiData.origen || '',
      
      // Step 6: Descriptions (already in correct format)
      descripcioAnunci: apiData.descripcioAnunci || apiData['descripcio-anunci'] || '',
      
      // Step 7: Images and Status
      imatgeDestacadaUrl: apiData.imatgeDestacadaUrl || apiData['imatge-destacada-url'] || '',
      galeriaVehicleUrls: Array.isArray(apiData.galeriaVehicleUrls) ? apiData.galeriaVehicleUrls :
                         Array.isArray(apiData['galeria-vehicle-urls']) ? apiData['galeria-vehicle-urls'] : [],
      anunciActiu: apiData.anunciActiu === true || apiData['anunci-actiu'] === 'true' || apiData['anunci-actiu'] === true,
      anunciDestacat: parseInt(apiData.anunciDestacat || apiData['anunci-destacat'] || '0'),
      venut: apiData.venut === true || apiData.venut === 'true',
      
      // Additional fields that might be missing
      seguretat: [],
      confort: [],
      multimedia: []
    };
    
    return formData;
  };

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get(`/vehicles/by-id/${id}`);
      
      // Transform API data to form format
      const transformedData = transformApiDataToFormData(response.data);
      setVehicleData(transformedData);
    } catch (err) {
      console.error('Error loading vehicle:', err);
      setError('Error al carregar el vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (mode === 'create') {
        await axiosAdmin.post('/vehicles', formData);
        toast.success('🎉 Vehicle creat correctament!');
      } else {
        await axiosAdmin.put(`/vehicles/${id}`, formData);
        toast.success('✅ Vehicle actualitzat correctament!');
      }
      
      // Small delay to show the toast before navigation
      setTimeout(() => {
        navigate('/admin/kars-vehicles');
      }, 1000);
    } catch (err) {
      toast.error('❌ Error al guardar el vehicle. Si us plau, torna-ho a provar.');
      throw new Error('Error al guardar el vehicle');
    }
  };

  const handleCancel = () => {
    navigate('/admin/kars-vehicles');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate('/admin/kars-vehicles')}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Tornar al llistat
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Tornar al llistat
            </button>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Crear Nou Vehicle' : 'Editar Vehicle'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === 'create' 
              ? 'Completa el formulari per crear un nou vehicle' 
              : 'Modifica les dades del vehicle'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <MultiStepVehicleForm
            initialData={vehicleData}
            onSave={handleSave}
            onCancel={handleCancel}
            mode={mode}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default VehicleForm;
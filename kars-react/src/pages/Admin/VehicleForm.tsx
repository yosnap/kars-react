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
    
    // Normalizar el tipo de vehículo para asegurar que coincida con los valores esperados (minúsculas)
    const normalizeTipusVehicle = (value: string) => {
      if (!value) return '';
      
      const normalized = value.toLowerCase().trim();
      
      // Mapear valores comunes a los esperados por el formulario
      const mapping: Record<string, string> = {
        'cotxe': 'cotxe',
        'car': 'cotxe',
        'coche': 'cotxe',
        'moto': 'moto',
        'motorcycle': 'moto',
        'motocicleta': 'moto',
        'autocaravana': 'autocaravana-camper',
        'autocaravana-camper': 'autocaravana-camper',
        'camper': 'autocaravana-camper',
        'vehicle-comercial': 'vehicle-comercial',
        'vehicle_comercial': 'vehicle-comercial',
        'comercial': 'vehicle-comercial',
        'truck': 'vehicle-comercial',
        'furgoneta': 'vehicle-comercial'
      };
      
      return mapping[normalized] || normalized;
    };
    
    const tipusVehicleFromApi = normalizeTipusVehicle(rawTipusVehicle);
    
    const formData = {
      // Step 1: Vehicle Type
      tipusVehicle: tipusVehicleFromApi,
      
      // Step 2: Basic Info  
      // Para autocaravanas y vehículos comerciales, migrar datos de campos específicos a campos de coche
      marcaCotxe: (() => {
        if (tipusVehicleFromApi === 'autocaravana-camper') {
          return apiData.marcaCotxe || apiData.marquesAutocaravana || '';
        }
        if (tipusVehicleFromApi === 'vehicle-comercial') {
          return apiData.marcaCotxe || apiData.marquesComercial || '';
        }
        return apiData.marcaCotxe || '';
      })(),
      marcaMoto: apiData.marcaMoto || '',
      marquesComercial: apiData.marquesComercial || '',
      modelsCotxe: (() => {
        if (tipusVehicleFromApi === 'autocaravana-camper') {
          return apiData.modelsCotxe || apiData.modelsAutocaravana || '';
        }
        if (tipusVehicleFromApi === 'vehicle-comercial') {
          return apiData.modelsCotxe || apiData.modelsComercial || '';
        }
        return apiData.modelsCotxe || '';
      })(),
      modelsMoto: apiData.modelsMoto || '',
      modelsComercial: apiData.modelsComercial || '',
      versio: apiData.versio || '',
      any: apiData.any || '',
      preu: String(apiData.preu || ''),
      quilometratge: String(apiData.quilometratge || ''),
      
      // Auto-generated title
      titolAnunci: apiData.titolAnunci || '',
      
      // Step 3: Technical Specs
      tipusCombustible: apiData.tipusCombustible || '',
      tipusCanvi: apiData.tipusCanvi || '',
      tipusCanviMoto: apiData.tipusCanviMoto || '',
      tipusPropulsor: apiData.tipusPropulsor || '',
      potenciaCv: String(apiData.potenciaCv || ''),
      potenciaKw: String(apiData.potenciaKw || ''),
      cilindrada: String(apiData.cilindrada || ''),
      colorVehicle: apiData.colorVehicle || '',
      portesCotxe: String(apiData.portesCotxe || ''),
      placesCotxe: String(apiData.placesCotxe || ''),
      estatVehicle: apiData.estatVehicle || '',
      traccio: apiData.traccio || '',
      
      // Carrocería por tipo de vehículo
      carrosseriaCotxe: apiData.carrosseriaCotxe || '',
      carrosseriaMoto: apiData.carrosseriaMoto || '',
      carrosseriaCaravana: apiData.carrosseriaCaravana || '',
      
      // Additional technical fields
      emissionsVehicle: apiData.emissionsVehicle || '',
      consumUrba: apiData.consumUrba || '',
      consumCarretera: apiData.consumCarretera || '',
      consumMixt: apiData.consumMixt || '',
      emissionsCo2: apiData.emissionsCo2 || '',
      tipusTapisseria: apiData.tipusTapisseria || '',
      colorTapisseria: apiData.colorTapisseria || '',
      
      // Equipment and capacity fields - CORRIGIENDO NOMBRES DE CAMPOS
      numeroMaletersCotxe: String(apiData.numeroMaletersCotxe || ''),
      capacitatTotalL: String(apiData.capacitatTotalL || ''),
      rodaRecanvi: apiData.rodaRecanvi || '',
      velocitatMaxima: String(apiData.velocitatMaxima || ''),
      acceleracio0100Cotxe: String(apiData.acceleracio0100Cotxe || ''),
      
      // Motor fields - using correct field names from Prisma schema
      numeroMotors: String(apiData.numeroMotors || apiData['numero-motors'] || ''),
      cvMotorDavant: String(apiData.cvMotorDavant || apiData['cv-motor-davant'] || ''),
      kwMotorDavant: String(apiData.kwMotorDavant || apiData['kw-motor-davant'] || ''),
      cvMotorDarrere: String(apiData.cvMotorDarrere || apiData['cv-motor-darrere'] || ''),
      kwMotorDarrere: String(apiData.kwMotorDarrere || apiData['kw-motor-darrere'] || ''),
      cvMotor3: String(apiData.cvMotor3 || apiData['cv-motor-3'] || ''),
      kwMotor3: String(apiData.kwMotor3 || apiData['kw-motor-3'] || ''),
      cvMotor4: String(apiData.cvMotor4 || apiData['cv-motor-4'] || ''),
      kwMotor4: String(apiData.kwMotor4 || apiData['kw-motor-4'] || ''),
      potenciaCombinada: String(apiData.potenciaCombinada || apiData['potencia-combinada'] || ''),
      
      // Electric vehicle fields
      autonomiaWltp: String(apiData.autonomiaWltp || ''),
      autonomiaUrbanaWltp: String(apiData.autonomiaUrbanaWltp || ''),
      autonomiaExtraurbanaWltp: String(apiData.autonomiaExtraurbanaWltp || ''),
      autonomiaElectrica: String(apiData.autonomiaElectrica || ''),
      bateria: apiData.bateria || '',
      cablesRecarrega: apiData.cablesRecarrega || '',
      connectors: apiData.connectors || '',
      velocitatRecarrega: apiData.velocitatRecarrega || '',
      frenadaRegenerativa: apiData.frenadaRegenerativa || '',
      onePedal: apiData.onePedal || '',
      tempsRecarregaTotal: String(apiData.tempsRecarregaTotal || ''),
      tempsRecarregaFins80: String(apiData.tempsRecarregaFins80 || ''),
      
      // Step 4: Equipment and Extras - Mapear todos los tipos según el vehículo
      extresCotxe: Array.isArray(apiData.extresCotxe) ? apiData.extresCotxe : [],
      extresMoto: Array.isArray(apiData.extresMoto) ? apiData.extresMoto : [],
      extresAutocaravana: Array.isArray(apiData.extresAutocaravana) ? apiData.extresAutocaravana : [],
      extresHabitacle: Array.isArray(apiData.extresHabitacle) ? apiData.extresHabitacle : [],
      
      // Comfort features
      aireAcondicionat: apiData.aireAcondicionat || '',
      climatitzacio: apiData.climatitzacio === true || apiData.climatitzacio === 'true',
      vehicleFumador: apiData.vehicleFumador === true || apiData.vehicleFumador === 'true',
      
      // Step 5: Commercial Information
      garantia: apiData.garantia || '',
      vehicleAccidentat: (() => {
        const value = apiData.vehicleAccidentat || apiData['vehicle-accidentat'];
        if (value === true || value === 'true') return 'true';
        if (value === false || value === 'false') return 'false';
        return ''; // null, undefined o cualquier otro valor -> placeholder
      })(),
      origen: apiData.origen || '',
      iva: apiData.iva || '',
      finacament: apiData.finacament || '',
      
      // Precios adicionales
      preuAntic: apiData.preuAntic || '',
      preuMensual: apiData.preuMensual || '',
      preuDiari: apiData.preuDiari || '',
      
      // Propietarios y mantenimiento
      nombrePropietaris: apiData.nombrePropietaris || '',
      llibreManteniment: apiData.llibreManteniment === true || apiData.llibreManteniment === 'true',
      revisionsOficials: apiData.revisionsOficials === true || apiData.revisionsOficials === 'true',
      impostosDeduibles: apiData.impostosDeduibles === true || apiData.impostosDeduibles === 'true' ? 'true' : 'false',
      vehicleACanvi: apiData.vehicleACanvi === true || apiData.vehicleACanvi === 'true',
      
      // Step 6: Descriptions (multilingual support)
      descripcioAnunciCA: apiData.descripcioAnunciCA || apiData.descripcioAnunci || '',
      descripcioAnunciEN: apiData.descripcioAnunciEN || '',
      descripcioAnunciFR: apiData.descripcioAnunciFR || '',
      descripcioAnunciES: apiData.descripcioAnunciES || '',
      
      // Step 7: Images and Status
      imatgeDestacadaUrl: apiData.imatgeDestacadaUrl || '',
      galeriaVehicleUrls: Array.isArray(apiData.galeriaVehicleUrls) ? apiData.galeriaVehicleUrls : [],
      anunciActiu: apiData.anunciActiu === true || apiData.anunciActiu === 'true',
      anunciDestacat: parseInt(apiData.anunciDestacat || '0'),
      venut: apiData.venut === true || apiData.venut === 'true',
      
      // Internal Notes (not part of the 7 steps, but additional field)
      notesInternes: apiData.notesInternes || apiData['notes-internes'] || '',
      
      // Additional fields that might be missing
      // Note: seguretat, confort, multimedia removed - not in Prisma schema
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

  // Función para transformar datos del formulario al formato que espera la API
  const transformFormDataToApiData = (formData: any) => {
    const transformedData = { ...formData };
    
    // Para autocaravanas y vehículos comerciales, sincronizar campos nuevos con campos antiguos para compatibilidad
    if (formData.tipusVehicle === 'autocaravana-camper') {
      transformedData.marquesAutocaravana = formData.marcaCotxe;
      transformedData.modelsAutocaravana = formData.modelsCotxe;
    }
    
    if (formData.tipusVehicle === 'vehicle-comercial') {
      transformedData.marquesComercial = formData.marcaCotxe;
      transformedData.modelsComercial = formData.modelsCotxe;
    }
    
    // Campos que son Boolean en el esquema de Prisma
    const booleanFields = [
      'climatitzacio', 
      'vehicleFumador',
      'llibreManteniment',
      'revisionsOficials',
      'vehicleACanvi',
      'impostosDeduibles'
    ];
    
    booleanFields.forEach(field => {
      if (transformedData[field] === 'true') {
        transformedData[field] = true;
      } else if (transformedData[field] === 'false') {
        transformedData[field] = false;
      } else if (transformedData[field] === true || transformedData[field] === false) {
        // Ya es boolean, no hacer nada
      } else {
        // Si es undefined, null o cualquier otro valor, convertir a false
        transformedData[field] = false;
      }
    });
    
    // Campo especial: aireAcondicionat es String en el esquema
    if (transformedData.aireAcondicionat === true) {
      transformedData.aireAcondicionat = 'true';
    } else if (transformedData.aireAcondicionat === false) {
      transformedData.aireAcondicionat = 'false';
    } else if (transformedData.aireAcondicionat !== 'true' && transformedData.aireAcondicionat !== 'false') {
      // Si no es string válido, convertir a null
      transformedData.aireAcondicionat = null;
    }
    
    // Convertir campos numéricos
    if (transformedData.preu) {
      transformedData.preu = parseFloat(transformedData.preu) || 0;
    }
    
    // IMPORTANT: Todos los campos de motor en Prisma son String?, no numéricos
    // Mantener todos los campos de motor como strings para compatibilidad con Prisma
    const motorStringFields = [
      'numeroMotors', 'cvMotorDavant', 'kwMotorDavant', 'cvMotorDarrere', 
      'kwMotorDarrere', 'cvMotor3', 'kwMotor3', 'cvMotor4', 'kwMotor4', 
      'potenciaCombinada', 'potenciaCv', 'potenciaKw', 'cilindrada',
      'velocitatMaxima', 'acceleracio0100Cotxe'
    ];
    
    motorStringFields.forEach(field => {
      if (transformedData[field] && transformedData[field] !== '') {
        // Mantener como string, no convertir a número
        transformedData[field] = String(transformedData[field]);
      } else {
        transformedData[field] = null;
      }
    });
    
    // Filtrar campos que no existen en el esquema de Prisma
    const fieldsToRemove = ['seguretat', 'confort', 'multimedia', 'marquesComercial', 'modelsComercial'];
    
    fieldsToRemove.forEach(field => {
      if (transformedData.hasOwnProperty(field)) {
        delete transformedData[field];
      }
    });
    
    return transformedData;
  };

  // Función para enviar descripción a n8n para traducción
  const sendToTranslationService = async (vehicleId: string, description: string) => {
    try {
      // Verificar si hay descripción en catalán para traducir
      if (!description || description.trim() === '') {
        return;
      }

      // Obtener configuración de traducción
      const configResponse = await axiosAdmin.get('/admin/translation-config');
      if (!configResponse.data.success || !configResponse.data.config.enabled) {
        return;
      }

      const config = configResponse.data.config;
      
      // Preparar datos para el webhook de n8n
      const translationData = {
        vehicleId,
        description: description.trim(),
        sourceLanguage: 'catalan',
        targetLanguages: config.targetLanguages,
        callbackUrl: `${import.meta.env.VITE_API_BASE_URL}/admin/receive-translations`
      };


      // Enviar al webhook de n8n
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
        },
        body: JSON.stringify(translationData),
        signal: AbortSignal.timeout(config.timeout || 30000)
      });

      
      if (response.ok) {
        const responseData = await response.text();
        toast.success('🌐 Traduccions enviades a processar');
      } else {
        const errorData = await response.text();
        console.error('❌ n8n response error:', errorData);
        throw new Error(`Failed to send to n8n: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error sending to translation service:', error);
      // No mostrar error al usuario ya que es una funcionalidad secundaria
    }
  };

  const handleSave = async (formData: any) => {
    try {
      // Transformar datos antes de enviar
      const apiData = transformFormDataToApiData(formData);
      
      let vehicleId = id;
      
      if (mode === 'create') {
        const response = await axiosAdmin.post('/vehicles', apiData);
        vehicleId = response.data.id;
        toast.success('🎉 Vehicle creat correctament!');
      } else {
        const response = await axiosAdmin.put(`/vehicles/${id}`, apiData);
        toast.success('✅ Vehicle actualitzat correctament!');
      }
      
      // Enviar descripción a n8n para traducción automática si hay descripción en catalán
      const catalaDescription = formData.descripcioAnunciCA;
      if (catalaDescription && catalaDescription.trim() !== '') {
        // Enviar a n8n en background sin bloquear la navegación
        sendToTranslationService(vehicleId, catalaDescription).catch(err => {
          console.warn('Background translation request failed:', err);
        });
      }
      
      // Small delay to show the toast before navigation
      setTimeout(() => {
        navigate('/admin/kars-vehicles');
      }, 1000);
    } catch (err: any) {
      console.error('❌ Error saving vehicle:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error message:', err.message);
      
      // More specific error message
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error desconegut';
      toast.error(`❌ Error al guardar: ${errorMessage}`);
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
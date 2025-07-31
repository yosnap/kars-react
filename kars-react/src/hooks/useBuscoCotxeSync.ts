import { useState } from 'react';
import { axiosAdmin } from '../api/axiosClient';

interface BuscoSyncCredentials {
  username: string;
  password: string;
  apiKey: string;
  userId: string;
  token: string;
}

interface BuscoSyncResponse {
  success: boolean;
  message: string;
  data?: any;
  buscoVehicleId?: string;
}

interface BuscoSyncStatus {
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

export const useBuscoCotxeSync = () => {
  const [status, setStatus] = useState<BuscoSyncStatus>({
    isLoading: false,
    error: null,
    lastSync: null
  });

  // Obtener credenciales desde localStorage (configuradas en AdminSettings)
  const getBuscoCredentials = (): BuscoSyncCredentials | null => {
    try {
      const savedConfig = localStorage.getItem('buscoSyncOutConfig');
      if (!savedConfig) return null;
      
      const config = JSON.parse(savedConfig);
      
      // Verificar que todas las credenciales estén presentes
      if (!config.username || !config.password || !config.apiKey || !config.userId || !config.token) {
        throw new Error('Credenciales incompletas para BuscoCotxe');
      }
      
      return {
        username: config.username,
        password: config.password,
        apiKey: config.apiKey,
        userId: config.userId,
        token: config.token
      };
    } catch (error) {
      console.error('Error obteniendo credenciales BuscoCotxe:', error);
      return null;
    }
  };

  // Sincronizar vehículo individual
  const syncVehicle = async (vehicleId: string, isRemove: boolean = false): Promise<BuscoSyncResponse> => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const credentials = getBuscoCredentials();
      if (!credentials) {
        throw new Error('No se encontraron credenciales válidas para BuscoCotxe. Configúralas en Configuración > Sincronización Busco - Salida');
      }

      // Obtener datos del vehículo
      const vehicleResponse = await axiosAdmin.get(`/vehicles/${vehicleId}`);
      if (!vehicleResponse.data.success) {
        throw new Error('No se pudo obtener los datos del vehículo');
      }

      const vehicleData = vehicleResponse.data.data;
      
      // Mapear datos del vehículo al formato BuscoCotxe
      const buscoData = mapVehicleToBuscoFormat(vehicleData, credentials);
      
      // Determinar servicio (crear o modificar)
      const service = isRemove ? 'eliminar_item' : (vehicleData.buscoVehicleId ? 'modificar_item' : 'crear_item');
      
      if (service === 'modificar_item' && vehicleData.buscoVehicleId) {
        buscoData.id_item = vehicleData.buscoVehicleId;
      }

      // Enviar a la API de BuscoCotxe
      const response = await sendToBuscoAPI(service, buscoData, credentials);
      
      if (response.success) {
        // Actualizar vehículo en nuestra base de datos con el ID de Busco
        if (service === 'crear_item' && response.data?.message) {
          await axiosAdmin.patch(`/vehicles/${vehicleId}`, {
            buscoVehicleId: response.data.message,
            syncedToBuscoAt: new Date().toISOString()
          });
        } else if (service === 'eliminar_item') {
          await axiosAdmin.patch(`/vehicles/${vehicleId}`, {
            buscoVehicleId: null,
            syncedToBuscoAt: null
          });
        } else {
          await axiosAdmin.patch(`/vehicles/${vehicleId}`, {
            syncedToBuscoAt: new Date().toISOString()
          });
        }
        
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          lastSync: new Date(),
          error: null 
        }));
        
        return {
          success: true,
          message: response.message || 'Sincronización exitosa',
          buscoVehicleId: response.data?.message
        };
      } else {
        throw new Error(response.message || 'Error en la sincronización con BuscoCotxe');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Enviar datos a la API de BuscoCotxe
  const sendToBuscoAPI = async (
    service: string, 
    data: any, 
    credentials: BuscoSyncCredentials
  ): Promise<BuscoSyncResponse> => {
    const BUSCOCOTXE_API_URL = 'https://buscocotxe.ad/api/buscocotxead';
    
    const requestData = {
      ...data,
      servei: service
    };

    const authHeader = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);
    
    try {
      const response = await fetch(BUSCOCOTXE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      
      return {
        success: responseData.result === true,
        message: responseData.message || '',
        data: responseData
      };
      
    } catch (error) {
      throw new Error(`Error conectando con BuscoCotxe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Mapear datos del vehículo al formato esperado por BuscoCotxe
  const mapVehicleToBuscoFormat = (vehicle: any, credentials: BuscoSyncCredentials): any => {
    return {
      api_key: credentials.apiKey,
      id_usuari: credentials.userId,
      token: credentials.token,
      
      // Datos básicos del vehículo
      titol: vehicle.titolAnunci || '',
      marca: vehicle.marcaCotxe || vehicle.marcaMoto || '',
      model: vehicle.modelsCotxe || vehicle.modelsMoto || '',
      any: vehicle.any || '',
      preu: parseFloat(vehicle.preu) || 0,
      quilometratge: parseInt(vehicle.quilometratge) || 0,
      tipus_vehicle: mapVehicleType(vehicle.tipusVehicle),
      
      // Datos técnicos
      combustible: vehicle.combustible || '',
      transmissio: vehicle.transmissio || '',
      potencia: vehicle.potencia || '',
      cilindrada: vehicle.cilindrada || '',
      
      // Estado del vehículo  
      estat_anunci: vehicle.anunciActiu ? 'actiu' : 'inactiu',
      destacat: vehicle.anunciDestacat === 1,
      venut: vehicle.venut || false,
      
      // Descripción e imágenes
      descripcio: vehicle.descripcio || '',
      imatges: vehicle.imatgeDestacadaUrl ? [vehicle.imatgeDestacadaUrl] : [],
      
      // Información de contacto (usar valores por defecto)
      telefon: '',
      email: '',
      ubicacio: 'Andorra'
    };
  };

  // Mapear tipo de vehículo al formato BuscoCotxe
  const mapVehicleType = (tipusVehicle: string): string => {
    const typeMap: Record<string, string> = {
      'cotxe': 'cotxe',
      'moto': 'moto',
      'autocaravana-camper': 'autocaravana',
      'vehicle-comercial': 'comercial'
    };
    
    return typeMap[tipusVehicle?.toLowerCase()] || 'cotxe';
  };

  // Sincronizar múltiples vehículos
  const syncMultipleVehicles = async (vehicleIds: string[]): Promise<{
    successful: number;
    failed: number;
    errors: Array<{id: string, error: string}>;
  }> => {
    let successful = 0;
    let failed = 0;
    const errors: Array<{id: string, error: string}> = [];

    for (const vehicleId of vehicleIds) {
      try {
        const result = await syncVehicle(vehicleId);
        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push({ id: vehicleId, error: result.message });
        }
      } catch (error) {
        failed++;
        errors.push({ 
          id: vehicleId, 
          error: error instanceof Error ? error.message : 'Error desconocido' 
        });
      }
      
      // Pequeña pausa entre sincronizaciones para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { successful, failed, errors };
  };

  return {
    syncVehicle,
    syncMultipleVehicles,
    status,
    hasValidCredentials: () => getBuscoCredentials() !== null
  };
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxiosClient } from '../useAxiosClient';

interface VehicleFilters {
  page?: number;
  per_page?: number;
  orderby?: string;
  order?: string;
  'anunci-actiu'?: string | boolean;
  'tipus-vehicle'?: string;
  'estat-vehicle'?: string;
  'anunci-destacat'?: string | boolean;
  search?: string;
  venut?: string | boolean;
}

interface VehicleResponse {
  items: any[];
  total: number;
  pages: number;
}

export function useVehicles(filters: VehicleFilters = {}) {
  const axiosClient = useAxiosClient();

  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async (): Promise<VehicleResponse> => {
      const params = {
        page: 1,
        per_page: 20,
        orderby: 'date',
        order: 'DESC',
        ...filters,
      };

      const response = await axiosClient.get('/vehicles', { params });
      return response.data;
    },
    enabled: !!axiosClient,
  });
}

export function useVehicle(id: string) {
  const axiosClient = useAxiosClient();

  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await axiosClient.get(`/vehicles/id/${id}`);
      return response.data;
    },
    enabled: !!axiosClient && !!id,
  });
}

export function useUpdateVehicle() {
  const axiosClient = useAxiosClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axiosClient.put(`/vehicles/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Invalidar caché relacionado
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useDeleteVehicle() {
  const axiosClient = useAxiosClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/vehicles/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useToggleVehicleStatus() {
  const axiosClient = useAxiosClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const response = await axiosClient.patch(`/vehicles/${id}`, {
        'anunci-actiu': status
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useCreateVehicle() {
  const axiosClient = useAxiosClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleData: any) => {
      // Validar campos requeridos antes de enviar
      const requiredFields = ['titolAnunci', 'tipusVehicle', 'preu'];
      const missingFields = requiredFields.filter(field => !vehicleData[field] && vehicleData[field] !== 0);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Normalizar datos antes de enviar
      const normalizedData = {
        ...vehicleData,
        // Asegurar que preu sea un número float
        preu: parseFloat(vehicleData.preu) || 0.0,
        // Normalizar tipusVehicle a minúsculas
        tipusVehicle: vehicleData.tipusVehicle?.toLowerCase(),
        // Convertir booleanos
        anunciActiu: vehicleData.anunciActiu !== false,
        venut: vehicleData.venut === true,
        // Asegurar que anunciDestacat sea número
        anunciDestacat: parseInt(vehicleData.anunciDestacat) || 0,
      };

      console.log('📤 Sending normalized vehicle data:', JSON.stringify(normalizedData, null, 2));
      
      try {
        const response = await axiosClient.post('/vehicles', normalizedData);
        return response.data;
      } catch (error: any) {
        console.error('❌ Create vehicle error response:', error.response?.data);
        console.error('❌ Create vehicle error status:', error.response?.status);
        console.error('❌ Create vehicle full error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
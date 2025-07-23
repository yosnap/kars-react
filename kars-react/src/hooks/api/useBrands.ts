import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxiosClient } from '../useAxiosClient';

interface Brand {
  id: string;
  name: string;
  slug: string;
  vehicleTypes: string[];
  modelsCount?: number;
  _count?: {
    models: number;
  };
}

interface Model {
  id: string;
  name: string;
  slug: string;
  brandId: string;
}

export function useBrands(type: string = 'all') {
  const axiosClient = useAxiosClient();

  return useQuery({
    queryKey: ['brands', type],
    queryFn: async (): Promise<{ success: boolean; data: Brand[] }> => {
      const response = await axiosClient.get(`/admin/brands?type=${type}&per_page=100`);
      return response.data;
    },
    enabled: !!axiosClient,
  });
}

export function useModels(brandId: string) {
  const axiosClient = useAxiosClient();

  return useQuery({
    queryKey: ['models', brandId],
    queryFn: async (): Promise<{ success: boolean; data: Model[] }> => {
      const response = await axiosClient.get(`/admin/models?brandId=${brandId}&per_page=100`);
      return response.data;
    },
    enabled: !!axiosClient && !!brandId,
  });
}

export function useDeleteBrand() {
  const axiosClient = useAxiosClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string) => {
      const response = await axiosClient.delete(`/admin/brands/${brandId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

export function useDeleteModel() {
  const axiosClient = useAxiosClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelId: string) => {
      const response = await axiosClient.delete(`/admin/models/${modelId}`);
      return response.data;
    },
    onSuccess: (_, modelId) => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
}
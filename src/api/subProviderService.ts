import { apiClient } from './baseUrl';
import { errorHandler } from './errorHandler';
import type { SubProviderItem, CreateSubProviderPayload, UpdateSubProviderPayload } from '../types';

export const subProviderService = {
  getSubProviders: async (): Promise<SubProviderItem[]> => {
    try {
      const response = await apiClient.get('/provider/sub-providers');
      const list = response.data?.data;
      if (Array.isArray(list)) {
        return list.map((item: any) => ({
          ...item,
          id: item._id || item.id,
          permissions: item.permissions || {
            canCreateGym: false,
            canEditGym: true,
            canDeleteGym: false,
            canViewLeads: true,
            canManageLeads: true,
          },
        }));
      }
      return [];
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in getSubProviders:', msg);
      throw new Error(msg);
    }
  },

  createSubProvider: async (payload: CreateSubProviderPayload): Promise<SubProviderItem> => {
    try {
      const response = await apiClient.post('/provider/sub-providers', payload);
      const data = response.data?.data;
      return {
        ...data,
        id: data._id || data.id,
      };
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in createSubProvider:', msg);
      throw new Error(msg);
    }
  },

  updateSubProvider: async (
    id: string,
    payload: UpdateSubProviderPayload
  ): Promise<SubProviderItem> => {
    try {
      const response = await apiClient.patch(`/provider/sub-providers/${id}`, payload);
      const data = response.data?.data;
      return {
        ...data,
        id: data._id || data.id,
      };
    } catch (error) {
      const msg = errorHandler(error);
      console.error(`API Error in updateSubProvider(${id}):`, msg);
      throw new Error(msg);
    }
  },

  changePassword: async (id: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.patch(`/provider/sub-providers/${id}/password`, { newPassword });
    } catch (error) {
      const msg = errorHandler(error);
      console.error(`API Error in changePassword(${id}):`, msg);
      throw new Error(msg);
    }
  },

  deleteSubProvider: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/provider/sub-providers/${id}`);
    } catch (error) {
      const msg = errorHandler(error);
      console.error(`API Error in deleteSubProvider(${id}):`, msg);
      throw new Error(msg);
    }
  },
};


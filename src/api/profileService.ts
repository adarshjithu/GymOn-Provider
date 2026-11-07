import { apiClient } from './baseUrl';
import { errorHandler } from './errorHandler';
import type {
  ProviderProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from '../types';

export const profileService = {
  /**
   * Fetch current provider profile and stats from backend API
   */
  getProfile: async (): Promise<ProviderProfile> => {
    try {
      const response = await apiClient.get('/provider/profile');
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error('Invalid profile data returned from server');
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in getProfile:', msg);
      throw new Error(msg);
    }
  },

  /**
   * Update provider personal details (name, phone)
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<ProviderProfile> => {
    try {
      const response = await apiClient.patch('/provider/profile', payload);
      if (response.data?.data) {
        return response.data.data;
      }
      throw new Error('Failed to update profile on server');
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in updateProfile:', msg);
      throw new Error(msg);
    }
  },

  /**
   * Change provider password
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<string> => {
    try {
      const response = await apiClient.patch('/provider/password', payload);
      return response.data?.message || 'Password changed successfully';
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in changePassword:', msg);
      throw new Error(msg);
    }
  },
};


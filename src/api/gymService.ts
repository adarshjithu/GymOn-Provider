import { apiClient } from './baseUrl';
import { errorHandler } from './errorHandler';
import type { GymItem, UpdateGymPayload, CreateGymPayload } from '../types';

export const gymService = {
  /**
   * Fetch gyms belonging to the provider strictly from backend API
   */
  getProviderGyms: async (providerId?: string): Promise<GymItem[]> => {
    try {
      const response = await apiClient.get('/provider/gyms', {
        params: providerId ? { providerId } : {},
      });

      const rawGyms = response.data?.data;
      if (Array.isArray(rawGyms)) {
        return rawGyms.map((gym: any) => normalizeGym(gym));
      }

      return [];
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in getProviderGyms:', msg);
      throw new Error(msg);
    }
  },

  /**
   * Fetch gym details by slug strictly from backend API
   */
  getGymBySlug: async (slug: string): Promise<GymItem> => {
    try {
      const response = await apiClient.get(`/provider/gyms/slug/${slug}`);
      if (response.data?.data) {
        return normalizeGym(response.data.data);
      }
      throw new Error('Gym data not found in server response.');
    } catch (error) {
      const msg = errorHandler(error);
      console.error(`API Error in getGymBySlug(${slug}):`, msg);
      throw new Error(msg);
    }
  },

  /**
   * Update gym details strictly through the backend API
   */
  updateGym: async (identifier: string, payload: UpdateGymPayload): Promise<GymItem> => {
    try {
      const response = await apiClient.patch(`/provider/gyms/${encodeURIComponent(identifier)}`, payload);
      if (response.data?.data) {
        return normalizeGym(response.data.data);
      }
      throw new Error('Failed to update gym details.');
    } catch (error) {
      const msg = errorHandler(error);
      console.error(`API Error in updateGym(${identifier}):`, msg);
      throw new Error(msg);
    }
  },

  /**
   * Create and register a new gym
   */
  createGym: async (payload: CreateGymPayload): Promise<GymItem> => {
    try {
      const response = await apiClient.post('/provider/gyms', payload);
      if (response.data?.data) {
        return normalizeGym(response.data.data);
      }
      throw new Error('Failed to create gym.');
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in createGym:', msg);
      throw new Error(msg);
    }
  },

  /**
   * Upload image files directly to S3 bucket / DigitalOcean Spaces
   */
  uploadImages: async (files: File[]): Promise<string[]> => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await apiClient.post('/provider/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const urls = response.data?.urls || response.data?.data;
      if (Array.isArray(urls)) {
        return urls;
      }
      return [];
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in uploadImages:', msg);
      throw new Error(msg);
    }
  },

  /**
   * Update gym photos independently strictly through the backend API
   */
  updateGymPhotos: async (identifier: string, photos: string[]): Promise<GymItem> => {
    try {
      const response = await apiClient.patch(
        `/provider/gyms/${encodeURIComponent(identifier)}/photos`,
        { photos }
      );
      if (response.data?.data) {
        return normalizeGym(response.data.data);
      }
      throw new Error('Failed to update gym photos.');
    } catch (error) {
      const msg = errorHandler(error);
      console.error(`API Error in updateGymPhotos(${identifier}):`, msg);
      throw new Error(msg);
    }
  },
};

function normalizeGym(raw: any): GymItem {
  let displayStatus: GymItem['status'] = 'Live';
  if (raw.status === 'PENDING_APPROVAL' || raw.status === 'Pending') {
    displayStatus = 'Pending';
  } else if (raw.status === 'DRAFT' || raw.status === 'Draft') {
    displayStatus = 'Draft';
  } else if (raw.status === 'APPROVED' || raw.status === 'Live' || raw.isApproved) {
    displayStatus = 'Live';
  } else if (!raw.isActive || raw.status === 'REJECTED') {
    displayStatus = 'Inactive';
  }

  let formattedUpdated = 'Recently';
  if (raw.updatedAt) {
    try {
      const d = new Date(raw.updatedAt);
      formattedUpdated =
        d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
        ', ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      formattedUpdated = String(raw.updatedAt);
    }
  }

  return {
    _id: raw._id || raw.id,
    id: raw._id?.toString() || raw.id,
    provider: raw.provider,
    gymName: raw.gymName || 'Fitness Center',
    slug: raw.slug || (raw.gymName ? raw.gymName.toLowerCase().replace(/\s+/g, '-') : raw._id),
    address: raw.address || 'Address not listed',
    city: raw.city || 'City',
    gpsLocation: raw.gpsLocation,
    phoneNumber: raw.phoneNumber || '',
    dayPassPrice: typeof raw.dayPassPrice === 'number' ? raw.dayPassPrice : 0,
    monthlyMembershipPrice: raw.monthlyMembershipPrice || 0,
    threeMonthMembershipPrice: raw.threeMonthMembershipPrice || 0,
    description: raw.description,
    photos: Array.isArray(raw.photos) && raw.photos.length > 0 ? raw.photos : [],
    facilities: Array.isArray(raw.facilities) ? raw.facilities : [],
    openingHours: Array.isArray(raw.openingHours) ? raw.openingHours : [],
    holidayDates: raw.holidayDates,
    status: displayStatus,
    isApproved: raw.isApproved ?? true,
    isActive: raw.isActive ?? true,
    leadsCount: typeof raw.leadsCount === 'number' ? raw.leadsCount : 0,
    createdAt: raw.createdAt,
    updatedAt: formattedUpdated,
  };
}

import { apiClient } from './baseUrl';
import { errorHandler } from './errorHandler';
import type { CustomerLeadItem, LeadStatusType, PaginationMeta } from '../types';

export const leadService = {
  /**
   * Fetch customer leads strictly from backend API with server-side search and pagination
   */
  getLeads: async (params?: {
    gymId?: string;
    gymSlug?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ leads: CustomerLeadItem[]; pagination: PaginationMeta }> => {
    try {
      const response = await apiClient.get('/provider/leads', { params });
      const rawLeads = response.data?.data;
      const pagination: PaginationMeta = response.data?.pagination || {
        total: Array.isArray(rawLeads) ? rawLeads.length : 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      };

      const leads = Array.isArray(rawLeads) ? rawLeads.map((lead: any) => normalizeLead(lead)) : [];

      return {
        leads,
        pagination,
      };
    } catch (error) {
      const msg = errorHandler(error);
      console.error('API Error in getLeads:', msg);
      throw new Error(msg);
    }
  },

  /**
   * Fetch single customer lead details by ID strictly from backend API
   */
  getLeadById: async (leadId: string): Promise<CustomerLeadItem> => {
    try {
      const response = await apiClient.get(`/provider/leads/${leadId}`);
      if (response.data?.data) {
        return normalizeLead(response.data.data);
      }
      throw new Error('Customer lead not found in server response.');
    } catch (error) {
      const msg = errorHandler(error);
      console.error(`API Error in getLeadById(${leadId}):`, msg);
      throw new Error(msg);
    }
  },

  /**
   * Update lead status (NEW, CONTACTED, CLOSED) strictly via backend API
   */
  updateLeadStatus: async (leadId: string, status: LeadStatusType): Promise<CustomerLeadItem> => {
    try {
      const response = await apiClient.patch(`/provider/leads/${leadId}/status`, { status });
      if (response.data?.data) {
        return normalizeLead(response.data.data);
      }
      throw new Error('Failed to update lead status on server.');
    } catch (error) {
      const msg = errorHandler(error);
      console.error(`API Error in updateLeadStatus(${leadId}):`, msg);
      throw new Error(msg);
    }
  },
};

function normalizeLead(raw: any): CustomerLeadItem {
  const gymObj = raw.gym && typeof raw.gym === 'object' ? raw.gym : null;

  let formattedDate = raw.createdAt
    ? new Date(raw.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  return {
    _id: raw._id || raw.id,
    id: raw._id?.toString() || raw.id,
    customerName: raw.customerName || 'Customer',
    customerPhone: raw.customerPhone || 'N/A',
    customerEmail: raw.customerEmail || '',
    gym: gymObj,
    gymName: raw.gymName || gymObj?.gymName || 'Gym Partner',
    gymSlug: raw.gymSlug || gymObj?.slug || '',
    gymAddress: raw.gymAddress || gymObj?.address || '',
    gymCity: raw.gymCity || gymObj?.city || '',
    dayPassPrice: raw.dayPassPrice || gymObj?.dayPassPrice || 0,
    monthlyMembershipPrice: raw.monthlyMembershipPrice || gymObj?.monthlyMembershipPrice,
    threeMonthMembershipPrice: raw.threeMonthMembershipPrice || gymObj?.threeMonthMembershipPrice,
    provider: raw.provider,
    message: raw.message || '',
    source: raw.source,
    status: (raw.status || 'NEW').toUpperCase() as LeadStatusType,
    preferredDate: raw.preferredDate || formattedDate,
    preferredTime: raw.preferredTime || 'Flexible',
    numberOfPasses: raw.numberOfPasses || 1,
    notes: raw.notes || '',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt || formattedDate,
  };
}

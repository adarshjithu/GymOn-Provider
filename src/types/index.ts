export interface RequestLead {
  id: string;
  name: string;
  date: string;
  requestedTime: string;
}

export type TabType =
  | 'Dashboard'
  | 'My Gyms'
  | 'My Gym'
  | 'Customer Leads'
  | 'Profile'
  | 'Users & Access'
  | 'Help & Support'
  | 'Help'
  | 'Logout';

export interface SubProviderPermissions {
  canCreateGym: boolean;
  canEditGym: boolean;
  canDeleteGym: boolean;
  canViewLeads: boolean;
  canManageLeads: boolean;
}

export interface ProviderUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'provider' | 'sub_provider' | 'admin';
  parentProvider?: string;
  permissions?: SubProviderPermissions;
  hasAllGymsAccess?: boolean;
  assignedGyms?: any[];
  gymName?: string;
  isActive?: boolean;
}

export interface SubProviderItem {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'sub_provider';
  parentProvider: string;
  permissions: SubProviderPermissions;
  hasAllGymsAccess?: boolean;
  assignedGyms?: any[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubProviderPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  permissions?: Partial<SubProviderPermissions>;
  hasAllGymsAccess?: boolean;
  assignedGyms?: string[];
}

export interface UpdateSubProviderPayload {
  name?: string;
  phone?: string;
  isActive?: boolean;
  permissions?: Partial<SubProviderPermissions>;
  hasAllGymsAccess?: boolean;
  assignedGyms?: string[];
}

export interface ProviderProfile extends ProviderUser {
  createdAt?: string;
  updatedAt?: string;
  stats?: {
    totalGyms: number;
    totalLeads: number;
  };
}

export interface UpdateProfilePayload {
  name: string;
  phone: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: ProviderUser & {
    accessToken?: string;
    refreshToken?: string;
    provider?: ProviderUser;
  };
}

export interface IGPSLocation {
  latitude: number;
  longitude: number;
}

export interface IOpeningHour {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
  slotName?: string;
}

export type GymStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'DRAFT' | 'REJECTED' | 'Live' | 'Draft' | 'Inactive' | 'Pending';

export interface GymDescriptionTemplate {
  id: string;
  templateId: number;
  description: string;
}

export interface CreateGymPayload {
  gymName: string;
  address: string;
  city: string;
  phoneNumber: string;
  dayPassPrice: number;
  monthlyMembershipPrice?: number;
  threeMonthMembershipPrice?: number;
  description?: string;
  descriptionTemplateId?: number | string;
  facilities?: string[];
  photos?: string[];
  openingHours?: IOpeningHour[];
  gpsLocation?: IGPSLocation;
  providerId?: string;
  status?: string;
}

export interface GymItem {
  _id?: string;
  id?: string;
  provider?: string;
  gymName: string;
  slug: string;
  address: string;
  city: string;
  gpsLocation?: IGPSLocation;
  phoneNumber?: string;
  dayPassPrice: number;
  monthlyMembershipPrice?: number;
  threeMonthMembershipPrice?: number;
  description?: string;
  photos?: string[];
  facilities?: string[];
  openingHours?: IOpeningHour[];
  holidayDates?: (Date | string)[];
  status: GymStatus;
  isApproved?: boolean;
  isActive?: boolean;
  leadsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateGymPayload {
  gymName: string;
  address: string;
  city: string;
  phoneNumber: string;
  dayPassPrice: number;
  monthlyMembershipPrice?: number;
  threeMonthMembershipPrice?: number;
  description?: string;
  facilities?: string[];
  openingHours?: IOpeningHour[];
  gpsLocation?: IGPSLocation;
  status?: string;
}

export type LeadStatusType = 'NEW' | 'CONTACTED' | 'CLOSED';

export interface CustomerLeadItem {
  _id?: string;
  id?: string;
  gym?: any;
  gymName?: string;
  gymSlug?: string;
  gymAddress?: string;
  gymCity?: string;
  dayPassPrice?: number;
  monthlyMembershipPrice?: number;
  threeMonthMembershipPrice?: number;
  provider?: string;
  customerName: string;
  customerPhone: string;
  originalPhone?: string;
  editedPhone?: string;
  isPhoneEdited?: boolean;
  phoneEditedAt?: string;
  customerEmail?: string;
  message?: string;
  source?: string;
  status: LeadStatusType;
  preferredDate?: string;
  preferredTime?: string;
  numberOfPasses?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetLeadsResponse {
  leads: CustomerLeadItem[];
  pagination: PaginationMeta;
}

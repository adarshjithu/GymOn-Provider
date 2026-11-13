import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  ChevronDown,
  RefreshCw,
  Loader2,
  X,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { CustomerLeadItem, LeadStatusType, GymItem, PaginationMeta } from '../../types';
import { leadService } from '../../api/leadService';
import { gymService } from '../../api/gymService';
import { useAuth } from '../../context/AuthContext';
import { CustomerLeadsSkeleton, CustomerLeadsTableSkeleton } from '../skeletons';

interface CustomerLeadsPageProps {
  initialGymSlug?: string | null;
  onViewLead?: (leadId: string) => void;
  onNavigateGym?: (gymSlug: string) => void;
}

export function CustomerLeadsPage({
  initialGymSlug,
  onViewLead,
}: CustomerLeadsPageProps) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const gymFromUrl = searchParams.get('gym') || initialGymSlug || 'All';

  const [leads, setLeads] = useState<CustomerLeadItem[]>([]);
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedGym, setSelectedGym] = useState<string>(gymFromUrl);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Server-side Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Sync selected gym if url search param changes
  useEffect(() => {
    const urlGym = searchParams.get('gym') || initialGymSlug || 'All';
    setSelectedGym(urlGym);
    setCurrentPage(1);
  }, [searchParams, initialGymSlug]);

  // Debounce search query (350ms) to trigger server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page and update URL when gym filter changes
  const handleGymChange = (gym: string) => {
    setSelectedGym(gym);
    setCurrentPage(1);
    if (gym && gym !== 'All') {
      setSearchParams({ gym });
    } else {
      setSearchParams({});
    }
  };

  const handleLeadClick = (leadId: string) => {
    if (onViewLead) {
      onViewLead(leadId);
    } else {
      navigate(`/leads/${leadId}`);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  // Load gyms list for filter dropdown
  useEffect(() => {
    gymService
      .getProviderGyms(user?.id || user?._id)
      .then((data) => {
        let resolved = Array.isArray(data) ? data : [];
        if (
          user?.role === 'sub_provider' &&
          user?.hasAllGymsAccess === false &&
          Array.isArray(user?.assignedGyms)
        ) {
          const allowedIds = new Set(
            user.assignedGyms
              .map((g: any) => (typeof g === 'object' && g ? g._id || g.id : g))
              .filter(Boolean)
          );
          resolved = resolved.filter((g) => allowedIds.has(g._id || g.id));
        }
        setGyms(resolved);
      })
      .catch(() => {
        setGyms([]);
      });
  }, [user]);

  // Fetch leads strictly from server with search and pagination
  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await leadService.getLeads({
        gymSlug: selectedGym !== 'All' ? selectedGym : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });

      let fetchedLeads = Array.isArray(result.leads) ? result.leads : [];
      if (
        user?.role === 'sub_provider' &&
        user?.hasAllGymsAccess === false &&
        Array.isArray(user?.assignedGyms)
      ) {
        const allowedIds = new Set(
          user.assignedGyms
            .map((g: any) => (typeof g === 'object' && g ? g._id || g.id : g))
            .filter(Boolean)
        );
        fetchedLeads = fetchedLeads.filter((lead) => {
          const leadGymId = typeof lead.gym === 'object' && lead.gym ? (lead.gym as any)._id || (lead.gym as any).id : lead.gym;
          return allowedIds.has(leadGymId);
        });
      }

      setLeads(fetchedLeads);
      setPaginationMeta(result.pagination);
    } catch (err: any) {
      console.error('Error fetching customer leads:', err);
      setError(err?.message || 'Unable to connect to the backend server.');
      setLeads([]);
      setPaginationMeta({
        total: 0,
        page: 1,
        limit: itemsPerPage,
        totalPages: 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedGym, selectedStatus, debouncedSearch, currentPage, itemsPerPage]);

  // Stats calculation
  const totalCount = paginationMeta.total;
  const newCount = leads.filter((l) => l.status === 'NEW').length;
  const contactedCount = leads.filter((l) => l.status === 'CONTACTED').length;
  const closedCount = leads.filter((l) => l.status === 'CLOSED').length;

  const handleQuickStatusChange = async (leadId: string, newStatus: LeadStatusType, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await leadService.updateLeadStatus(leadId, newStatus);
      setLeads((prev) =>
        prev.map((item) => (item.id === leadId ? { ...item, status: updated.status } : item))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const getStatusBadge = (status: LeadStatusType) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span>New Lead</span>
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Contacted</span>
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Closed / Joined</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CL';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CL';
  };

  if (isLoading && leads.length === 0 && gyms.length === 0) {
    return <CustomerLeadsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS & BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00A389] shrink-0">
            <Users className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Customer Leads & Enquiries
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">
              Track customer visit requests, respond to day pass inquiries and manage follow-ups.
            </p>
          </div>
        </div>

        {/* Metric Cards Row: 2x2 grid on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-2.5 sm:gap-3 w-full xl:w-auto">
          {/* Total Leads */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:px-4 sm:py-3 flex items-center space-x-2.5 sm:space-x-3 w-full xl:w-auto min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                {isLoading && leads.length === 0 ? '-' : totalCount}
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-1 truncate">Total Leads</p>
              <p className="text-[10px] text-slate-400 truncate">All Gyms</p>
            </div>
          </div>

          {/* New Leads */}
          <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-2.5 sm:px-4 sm:py-3 flex items-center space-x-2.5 sm:space-x-3 w-full xl:w-auto min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                {isLoading && leads.length === 0 ? '-' : newCount}
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-1 truncate">New</p>
              <p className="text-[10px] text-slate-400 truncate">Needs Action</p>
            </div>
          </div>

          {/* Contacted */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2.5 sm:px-4 sm:py-3 flex items-center space-x-2.5 sm:space-x-3 w-full xl:w-auto min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                {isLoading && leads.length === 0 ? '-' : contactedCount}
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-1 truncate">Contacted</p>
              <p className="text-[10px] text-slate-400 truncate">In Follow-up</p>
            </div>
          </div>

          {/* Closed */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 sm:px-4 sm:py-3 flex items-center space-x-2.5 sm:space-x-3 w-full xl:w-auto min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                {isLoading && leads.length === 0 ? '-' : closedCount}
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-1 truncate">Closed</p>
              <p className="text-[10px] text-slate-400 truncate">Converted</p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE GYM FILTER NOTIFICATION */}
      {selectedGym !== 'All' && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-between text-xs text-teal-900 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-[#00A389] shrink-0" />
            <span>
              Filtered for gym:{' '}
              <strong className="font-bold">
                {gyms.find((g) => g.slug === selectedGym || g.id === selectedGym)?.gymName || selectedGym}
              </strong>
            </span>
          </div>
          <button
            onClick={() => handleGymChange('All')}
            className="flex items-center space-x-1 text-[#00A389] hover:text-[#008f78] font-bold cursor-pointer"
          >
            <span>Show all gyms</span>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Server-Side Search Box */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, message..."
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Gym Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedGym}
              onChange={(e) => handleGymChange(e.target.value)}
              aria-label="Filter by Gym"
              className="w-full appearance-none bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all cursor-pointer"
            >
              <option value="All">All Gyms (All Locations)</option>
              {gyms.map((gym) => (
                <option key={gym.id || gym.slug} value={gym.slug}>
                  {gym.gymName}
                </option>
              ))}
            </select>
            <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              aria-label="Filter by Lead Status"
              className="w-full appearance-none bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389] focus:bg-white transition-all cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="NEW">New Inquiries</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CLOSED">Closed / Converted</option>
            </select>
            <Filter className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. LEADS TABLE & SERVER-SIDE LIST */}
      {error ? (
        <div className="bg-white border border-rose-200/90 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <div className="h-14 w-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Server Offline or Connection Error</h3>
            <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto font-medium">
              {error}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Please ensure the backend server is running on port 5000 and try again.
            </p>
          </div>
          <button
            onClick={fetchLeads}
            className="px-5 py-2.5 rounded-xl bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : isLoading && leads.length === 0 ? (
        <CustomerLeadsTableSkeleton />
      ) : leads.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center space-y-4 shadow-xs">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No customer leads found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery.trim()
                ? `No leads matched your search for "${searchQuery}".`
                : 'No customer inquiries match your current filters.'}
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedGym('All');
              setSelectedStatus('All');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs relative">
          {/* Subtle loading overlay when refetching */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs z-10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-[#00A389] animate-spin" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Customer</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Customer Message</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Status</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const initials = getInitials(lead.customerName);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => handleLeadClick(lead.id!)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Customer Info (Avatar + Name + Phone/Email + Gym & Date Underneath) */}
                      <td className="px-3.5 sm:px-6 py-3.5 sm:py-4">
                        <div className="flex items-start space-x-3">
                          <div className="h-10 w-10 rounded-full bg-[#060E1E] text-[#00C49F] font-bold text-xs flex items-center justify-center shrink-0 border border-slate-800 mt-0.5">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 group-hover:text-[#00A389] transition-colors block text-sm">
                              {lead.customerName}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1 text-slate-400" />
                                <span>{lead.editedPhone || lead.customerPhone}</span>
                                {lead.editedPhone && lead.editedPhone !== (lead.originalPhone || lead.customerPhone) ? (
                                  <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Edited
                                  </span>
                                ) : null}
                              </span>
                              {lead.customerEmail && (
                                <>
                                  <span>&bull;</span>
                                  <span className="flex items-center truncate max-w-[180px]">
                                    <Mail className="h-3 w-3 mr-1 text-slate-400" />
                                    {lead.customerEmail}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Under user name: Gym Name badge & Date badge */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {/* Gym Name Badge */}
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-teal-50/80 text-[#007D69] font-bold text-xs border border-teal-200/80 shadow-2xs">
                                <Building2 className="h-3.5 w-3.5 text-[#00A389] shrink-0" />
                                <span className="truncate max-w-[200px]">{lead.gymName}</span>
                                {lead.dayPassPrice ? (
                                  <span className="text-[10px] text-teal-700/70 font-semibold ml-0.5">
                                    • ₹{lead.dayPassPrice}
                                  </span>
                                ) : null}
                              </span>

                              {/* Date Badge */}
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>{lead.preferredDate || 'Flexible'}</span>
                                {lead.preferredTime && (
                                  <span className="text-[10px] text-slate-500 font-normal ml-0.5">
                                    • {lead.preferredTime}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Customer Message */}
                      <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 max-w-md">
                        <p className="text-slate-700 line-clamp-2 text-xs leading-relaxed">
                          {lead.message || 'Customer requested day-pass assistance.'}
                        </p>
                      </td>

                      {/* Status Badge */}
                      <td className="px-3.5 sm:px-6 py-3.5 sm:py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Quick change buttons */}
                          {lead.status === 'NEW' && (
                            <button
                              onClick={(e) => handleQuickStatusChange(lead.id!, 'CONTACTED', e)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-semibold border border-amber-200 transition-colors"
                              title="Mark Contacted"
                            >
                              Mark Contacted
                            </button>
                          )}

                          {lead.status === 'CONTACTED' && (
                            <button
                              onClick={(e) => handleQuickStatusChange(lead.id!, 'CLOSED', e)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold border border-emerald-200 transition-colors"
                              title="Mark Closed / Converted"
                            >
                              Mark Closed
                            </button>
                          )}

                          <button
                            onClick={() => handleLeadClick(lead.id!)}
                            className="p-1.5 rounded-lg text-[#00A389] hover:bg-teal-50 font-bold flex items-center space-x-1 text-xs cursor-pointer transition-colors"
                          >
                            <span>Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Server-Side Pagination */}
          <div className="px-3.5 sm:px-6 py-3 sm:py-3.5 bg-[#F8FAFC] border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center space-x-1.5 text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-[#00A389]" />
                <span>
                  Showing{' '}
                  <strong className="font-bold text-slate-900">
                    {paginationMeta.total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                  </strong>{' '}
                  to{' '}
                  <strong className="font-bold text-slate-900">
                    {Math.min(currentPage * itemsPerPage, paginationMeta.total)}
                  </strong>{' '}
                  of{' '}
                  <strong className="font-bold text-slate-900">{paginationMeta.total}</strong> leads
                </span>
              </span>

              {/* Rows per page selector */}
              <div className="flex items-center space-x-1.5 pl-3 border-l border-slate-200">
                <span>Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389] cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <button
                onClick={fetchLeads}
                className="flex items-center space-x-1 text-slate-600 hover:text-[#00A389] transition-colors cursor-pointer ml-1"
                title="Refresh leads"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Pagination Controls */}
            {paginationMeta.totalPages > 1 && (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isLoading}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: paginationMeta.totalPages }, (_, i) => i + 1).map((pg) => {
                    if (
                      pg === 1 ||
                      pg === paginationMeta.totalPages ||
                      Math.abs(pg - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            currentPage === pg
                              ? 'bg-[#00A389] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    }
                    if (pg === 2 && currentPage > 3) {
                      return <span key={pg} className="px-1 text-slate-400 font-bold">...</span>;
                    }
                    if (pg === paginationMeta.totalPages - 1 && currentPage < paginationMeta.totalPages - 2) {
                      return <span key={pg} className="px-1 text-slate-400 font-bold">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                  disabled={currentPage >= paginationMeta.totalPages || isLoading}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  PauseCircle,
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Pencil,
  Eye,
  Users,
  MoreVertical,
  ChevronDown,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { GymItem } from '../../types';
import { gymService } from '../../api/gymService';
import { useAuth } from '../../context/AuthContext';
import { CreateGymModal } from './CreateGymModal';
import { MyGymsSkeleton, MyGymsCardsSkeleton } from '../skeletons';

interface MyGymsPageProps {
  onViewDetails?: (slug: string) => void;
  onAddNewGym?: () => void;
  onEditGym?: (gym: GymItem) => void;
  onViewGymLeads?: (gymSlug: string) => void;
}

export function MyGymsPage({ onViewDetails, onAddNewGym, onEditGym, onViewGymLeads }: MyGymsPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleViewGym = (slug: string) => {
    if (onViewDetails) onViewDetails(slug);
    else navigate(`/gyms/${slug}`);
  };

  const handleViewLeads = (gymSlug: string) => {
    if (onViewGymLeads) onViewGymLeads(gymSlug);
    else navigate(`/leads?gym=${encodeURIComponent(gymSlug)}`);
  };

  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Live' | 'Pending' | 'Draft' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'recently' | 'price-asc' | 'price-desc' | 'name'>('recently');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchGyms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await gymService.getProviderGyms(user?.id || user?._id);
      setGyms(data);
    } catch (err: any) {
      console.error('Failed to load gyms:', err);
      setError(err?.message || 'Unable to connect to the backend server.');
      setGyms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, [user]);

  // Compute Stats
  const totalGyms = gyms.length;
  const liveGyms = gyms.filter((g) => g.status === 'Live' || g.status === 'APPROVED').length;
  const pendingGyms = gyms.filter((g) => g.status === 'Pending' || g.status === 'PENDING_APPROVAL').length;
  const draftGyms = gyms.filter((g) => g.status === 'Draft' || g.status === 'DRAFT').length;
  const inactiveGyms = gyms.filter((g) => g.status === 'Inactive' || g.status === 'REJECTED').length;

  // Filter and Sort
  const filteredGyms = useMemo(() => {
    return gyms
      .filter((gym) => {
        // Status filter
        if (statusFilter !== 'All') {
          if (statusFilter === 'Live' && gym.status !== 'Live' && gym.status !== 'APPROVED') return false;
          if (statusFilter === 'Pending' && gym.status !== 'Pending' && gym.status !== 'PENDING_APPROVAL') return false;
          if (statusFilter === 'Draft' && gym.status !== 'Draft' && gym.status !== 'DRAFT') return false;
          if (statusFilter === 'Inactive' && gym.status !== 'Inactive' && gym.status !== 'REJECTED') return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = gym.gymName.toLowerCase().includes(q);
          const matchCity = gym.city?.toLowerCase().includes(q);
          const matchAddr = gym.address?.toLowerCase().includes(q);
          return matchName || matchCity || matchAddr;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.dayPassPrice - b.dayPassPrice;
        if (sortBy === 'price-desc') return b.dayPassPrice - a.dayPassPrice;
        if (sortBy === 'name') return a.gymName.localeCompare(b.gymName);
        return 0; // recently added (default)
      });
  }, [gyms, searchQuery, statusFilter, sortBy]);

  // Helpers for avatar color and initials
  const getInitials = (name?: string) => {
    if (!name) return 'GY';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'GY';
  };

  const getAvatarStyle = (name: string) => {
    if (name.toLowerCase().includes('muscle')) {
      return { bg: 'bg-[#0E1712]', text: 'text-[#A3E635]', ring: 'border-lime-500/20' };
    }
    if (name.toLowerCase().includes('power')) {
      return { bg: 'bg-[#1C1206]', text: 'text-[#F59E0B]', ring: 'border-amber-500/20' };
    }
    return { bg: 'bg-[#0A111F]', text: 'text-[#00C49F]', ring: 'border-teal-500/20' };
  };

  const isSubProvider = user?.role === 'sub_provider';
  const canCreateGym = !isSubProvider || user?.permissions?.canCreateGym !== false;
  const canEditGym = !isSubProvider || user?.permissions?.canEditGym !== false;

  const handleAddGymClick = () => {
    if (onAddNewGym) {
      onAddNewGym();
    } else {
      navigate('/gyms/new');
    }
  };

  const handleEditClick = (gym: GymItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEditGym) return;
    if (onEditGym) {
      onEditGym(gym);
    } else {
      navigate(`/gyms/${gym.slug}/edit`);
    }
  };

  if (isLoading && gyms.length === 0) {
    return <MyGymsSkeleton viewMode={viewMode} />;
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS & BANNER ROW */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-6">
        {/* Left: Banner Info */}
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00A389] shrink-0">
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Manage all your gyms in one place
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">
              Add, edit and manage your gym listings.
            </p>
          </div>
        </div>

        {/* Middle & Right: Stats Row + Add Gym Button */}
        <div className="flex flex-col sm:flex-row xl:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 justify-between xl:justify-end w-full xl:w-auto">
          {/* Stat Cards 2x2 on mobile, 4-col on tablet/desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex gap-2 sm:gap-3 w-full xl:w-auto">
            {/* Stat Card 1: Total Gyms */}
            <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-2.5 sm:px-4 sm:py-3 flex items-center space-x-2.5 sm:space-x-3 w-full xl:w-auto min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                  {isLoading ? '-' : totalGyms}
                </div>
                <p className="text-[11px] font-bold text-slate-700 mt-1 truncate">Total Gyms</p>
                <p className="text-[10px] text-slate-400 truncate">Registered</p>
              </div>
            </div>

            {/* Stat Card 2: Live */}
            <div className="bg-teal-50/40 border border-teal-100/80 rounded-xl p-2.5 sm:px-4 sm:py-3 flex items-center space-x-2.5 sm:space-x-3 w-full xl:w-auto min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-teal-100 text-[#00A389] flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                  {isLoading ? '-' : liveGyms}
                </div>
                <p className="text-[11px] font-bold text-slate-700 mt-1 truncate">Live</p>
                <p className="text-[10px] text-slate-400 truncate">Published</p>
              </div>
            </div>

            {/* Stat Card 3: Pending Approval */}
            <div className="bg-amber-50/50 border border-amber-200/90 rounded-xl p-2.5 sm:px-4 sm:py-3 flex items-center space-x-2.5 sm:space-x-3 w-full xl:w-auto min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-amber-700 leading-none truncate">
                  {isLoading ? '-' : pendingGyms}
                </div>
                <p className="text-[11px] font-bold text-slate-800 mt-1 truncate">Pending</p>
                <p className="text-[10px] text-amber-600 font-semibold truncate">Under Review</p>
              </div>
            </div>

            {/* Stat Card 4: Draft & Inactive */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:px-4 sm:py-3 flex items-center space-x-2.5 sm:space-x-3 w-full xl:w-auto min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <PauseCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-black text-slate-900 leading-none truncate">
                  {isLoading ? '-' : draftGyms + inactiveGyms}
                </div>
                <p className="text-[11px] font-bold text-slate-700 mt-1 truncate">Draft</p>
                <p className="text-[10px] text-slate-400 truncate">Offline</p>
              </div>
            </div>
          </div>

          {/* Add New Gym Button */}
          {canCreateGym ? (
            <button
              onClick={handleAddGymClick}
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#00A389] to-[#00C49F] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-[#00A389]/20 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Add New Gym</span>
            </button>
          ) : (
            <div
              className="px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold flex items-center justify-center space-x-1.5"
              title="Your account does not have permission to add new gyms"
            >
              <span>Creation Restricted</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. SEARCH, FILTER & VIEW CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 flex-1 max-w-xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gym by name..."
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A389] focus:ring-1 focus:ring-[#00A389] transition-all shadow-2xs"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative shrink-0 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter gyms by status"
              className="w-full sm:w-auto appearance-none bg-white border border-slate-200/90 rounded-xl pl-4 pr-9 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389] transition-all shadow-2xs cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Live">Live / Approved</option>
              <option value="Pending">Pending Approval</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Sort & Layout Mode */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort gyms"
              className="w-full md:w-auto appearance-none bg-white border border-slate-200/90 rounded-xl pl-4 pr-9 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#00A389] transition-all shadow-2xs cursor-pointer"
            >
              <option value="recently">Sort by: Recently Added</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Gym Name (A-Z)</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Layout Toggle Buttons */}
          <div className="flex items-center bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#00A389] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#00A389] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONTENT AREA: ERROR / LOADING / EMPTY / GRID / TABLE */}
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
            onClick={fetchGyms}
            className="px-5 py-2.5 rounded-xl bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : isLoading ? (
        <MyGymsCardsSkeleton viewMode={viewMode} />
      ) : filteredGyms.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center space-y-4 shadow-xs">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No gyms match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or status filter to see other registered gyms.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGyms.map((gym) => {
            const isLive = gym.status === 'Live' || gym.status === 'APPROVED';
            const isPending = gym.status === 'Pending' || gym.status === 'PENDING_APPROVAL';
            const avatarStyle = getAvatarStyle(gym.gymName);
            const initials = getInitials(gym.gymName);
            const coverPhoto =
              gym.photos && gym.photos[0]
                ? gym.photos[0]
                : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={gym.id || gym.slug}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Card Cover Image with Status Badge */}
                  <div
                    onClick={() => handleViewGym(gym.slug)}
                    className="relative h-44 w-full overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    <img
                      src={coverPhoto}
                      alt={gym.gymName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Status Pill Badge */}
                    <span
                      className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-md ${
                        isLive
                          ? 'bg-[#E6F9F2] text-[#00A389] border border-[#00A389]/30'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {isLive ? 'Live' : isPending ? 'Pending Approval' : 'Draft'}
                    </span>
                  </div>

                  {/* Card Header Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        {/* Circular Logo */}
                        <div
                          className={`h-11 w-11 rounded-full ${avatarStyle.bg} ${avatarStyle.text} border-2 ${avatarStyle.ring} font-black text-sm flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          {initials}
                        </div>

                        <div>
                          <button
                            onClick={() => handleViewGym(gym.slug)}
                            className="text-base font-bold text-slate-900 hover:text-[#00A389] transition-colors text-left line-clamp-1 cursor-pointer"
                          >
                            {gym.gymName}
                          </button>
                          <div className="flex items-center text-xs text-slate-500 font-medium mt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
                            <span className="truncate max-w-[170px]">{gym.city || gym.address}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3-dots more menu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewGym(gym.slug);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price Line */}
                    <div className="pt-1">
                      {gym.dayPassPrice > 0 ? (
                        <div className="text-sm font-black text-slate-900">
                          ₹{gym.dayPassPrice}
                          <span className="text-xs text-slate-500 font-medium ml-1">
                            / day pass
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium italic">
                          Not published yet
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons Row */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <button
                    onClick={(e) => handleEditClick(gym, e)}
                    className="flex items-center space-x-1.5 hover:text-[#00A389] transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleViewGym(gym.slug)}
                    className="flex items-center space-x-1.5 hover:text-[#00A389] transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewLeads(gym.slug);
                    }}
                    className="flex items-center space-x-1 hover:text-[#00A389] transition-colors cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5 text-slate-400 mr-0.5" />
                    <span>Leads</span>
                    <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#00A389] text-white text-[9px] font-bold flex items-center justify-center">
                      {gym.leadsCount ?? 0}
                    </span>
                  </button>

                  <button
                    onClick={() => handleViewGym(gym.slug)}
                    className="p-1 hover:text-[#00A389] text-slate-400 transition-colors cursor-pointer"
                    title="Details"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Gym Name</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Location</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Day Pass Price</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Status</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4">Last Updated</th>
                  <th className="px-3.5 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGyms.map((gym) => {
                  const isLive = gym.status === 'Live' || gym.status === 'APPROVED';
                  const isPending = gym.status === 'Pending' || gym.status === 'PENDING_APPROVAL';
                  const avatarStyle = getAvatarStyle(gym.gymName);
                  const initials = getInitials(gym.gymName);

                  return (
                    <tr
                      key={gym.id || gym.slug}
                      onClick={() => handleViewGym(gym.slug)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Name & Avatar */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-9 w-9 rounded-full ${avatarStyle.bg} ${avatarStyle.text} font-bold text-xs flex items-center justify-center shrink-0 border ${avatarStyle.ring}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-[#00A389] transition-colors">
                              {gym.gymName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-slate-600 font-medium">
                        {gym.city || gym.address}
                      </td>

                      {/* Day Pass Price */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-bold text-slate-900">
                        {gym.dayPassPrice > 0 ? `₹${gym.dayPassPrice}` : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                            isLive
                              ? 'bg-[#E6F9F2] text-[#00A389]'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-[#FEF6E7] text-[#D97706]'
                          }`}
                        >
                          {isLive ? 'Live' : isPending ? 'Pending Approval' : 'Draft'}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-slate-500 font-medium text-[11px]">
                        {gym.updatedAt || 'Recently'}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                        <div
                          className="flex items-center justify-end space-x-3 text-slate-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleViewGym(gym.slug)}
                            className="hover:text-[#00A389] transition-colors p-1 cursor-pointer"
                            title="Preview Gym Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewLeads(gym.slug)}
                            className="hover:text-[#00A389] transition-colors p-1 cursor-pointer flex items-center space-x-1"
                            title="View Leads"
                          >
                            <Users className="h-4 w-4" />
                            <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#00A389] text-white text-[9px] font-bold flex items-center justify-center">
                              {gym.leadsCount ?? 0}
                            </span>
                          </button>
                          <button
                            onClick={(e) => handleEditClick(gym, e)}
                            className="hover:text-[#00A389] transition-colors p-1 cursor-pointer"
                            title="Edit Gym"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewGym(gym.slug)}
                            className="hover:text-slate-700 transition-colors p-1 cursor-pointer"
                            title="More Options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#00A389]" />
              <span>
                Showing {filteredGyms.length} of {gyms.length} gyms
              </span>
            </div>
            <button
              onClick={fetchGyms}
              className="flex items-center space-x-1 text-slate-600 hover:text-[#00A389] transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh list</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Gym Modal */}
      <CreateGymModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        providerId={user?.id || user?._id}
        onGymCreated={(newGym) => {
          setGyms((prev) => [newGym, ...prev]);
          setSuccessBanner(`Gym "${newGym.gymName}" has been registered and submitted for admin review!`);
        }}
      />
    </div>
  );
}


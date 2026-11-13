import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  MapPin,
  Plus,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Phone,
  Calendar,
  AlertCircle,
  RefreshCw,
  Dumbbell,
  Check,
} from 'lucide-react';
import type { GymItem, CustomerLeadItem, LeadStatusType, TabType } from '../../types';
import { gymService } from '../../api/gymService';
import { leadService } from '../../api/leadService';
import { useAuth } from '../../context/AuthContext';
import { DashboardSkeleton } from '../skeletons/DashboardSkeleton';
import { InfoBanner } from './InfoBanner';
import { calculateNearbyAveragePrices } from '../../utils/geoUtils';

interface DashboardPageProps {
  onNavigate?: (tab: TabType) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [platformGyms, setPlatformGyms] = useState<GymItem[]>([]);
  const [leads, setLeads] = useState<CustomerLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Dashboard Data (Gyms, Leads & All Platform Gyms for Nearby 3km Average)
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [gymsData, leadsData, allGymsData] = await Promise.all([
        gymService.getProviderGyms(user?.id || user?._id).catch((err) => {
          console.error('Error loading provider gyms:', err);
          return [] as GymItem[];
        }),
        leadService.getLeads({ limit: 100 }).catch((err) => {
          console.error('Error loading provider leads:', err);
          return { leads: [] as CustomerLeadItem[] };
        }),
        gymService.getAllPlatformGyms().catch((err) => {
          console.error('Error loading platform gyms:', err);
          return [] as GymItem[];
        }),
      ]);

      let resolvedGyms = Array.isArray(gymsData) ? gymsData : [];
      let resolvedLeads = Array.isArray(leadsData?.leads) ? leadsData.leads : [];

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
        resolvedGyms = resolvedGyms.filter((g) => allowedIds.has(g._id || g.id));
        resolvedLeads = resolvedLeads.filter((l) => {
          const leadGymId = typeof l.gym === 'object' && l.gym ? (l.gym as any)._id || (l.gym as any).id : l.gym;
          return allowedIds.has(leadGymId);
        });
      }

      setGyms(resolvedGyms);
      setLeads(resolvedLeads);
      setPlatformGyms(Array.isArray(allGymsData) ? allGymsData : []);
    } catch (err: any) {
      console.error('Dashboard load failed:', err);
      setErrorMessage(err?.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Current Month Helper
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isCreatedThisMonth = (dateStr?: string | Date) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  // 1. Calculate Average Day Pass Price across provider's gyms or platform
  const avgMarketPrice = useMemo(() => {
    const validPrices = gyms
      .map((g) => Number(g.dayPassPrice))
      .filter((p) => !isNaN(p) && p > 0);
    if (validPrices.length === 0) return 150;
    return Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length);
  }, [gyms]);

  // Helper to compute nearby 3 km average price for a specific gym
  const getGymNearbyAvgPrice = (gym: GymItem) => {
    const lat = gym.gpsLocation?.latitude;
    const lng = gym.gpsLocation?.longitude;
    const pool = platformGyms.length > 0 ? platformGyms : gyms;
    const stats = calculateNearbyAveragePrices(pool, lat, lng, 3);
    return stats ? stats.dayPass : (gym.dayPassPrice || avgMarketPrice);
  };

  // 2. This Month Total Leads (Cumulative across all gyms)
  const thisMonthLeads = useMemo(() => {
    return leads.filter((l) => isCreatedThisMonth(l.createdAt));
  }, [leads, currentMonth, currentYear]);

  const thisMonthTotalLeadsCount = thisMonthLeads.length;

  // 3. This Month Total Revenue (Cumulative from CLOSED / converted leads only)
  const thisMonthRevenue = useMemo(() => {
    const closedLeads = thisMonthLeads.filter(
      (l) => l.status === 'CLOSED'
    );

    return closedLeads.reduce((total, lead) => {
      const price = Number(lead.dayPassPrice) || 0;
      const passes = Number(lead.numberOfPasses) || 1;
      return total + price * passes;
    }, 0);
  }, [thisMonthLeads]);

  // 4. Latest Customer Leads (Sorted by latest first)
  const latestLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 8); // Top 8 most recent leads
  }, [leads]);

  // 5. Handle Status Toggle on Lead Action Button
  const handleToggleLeadStatus = async (lead: CustomerLeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const leadId = lead.id || lead._id;
    if (!leadId) return;

    // Cycle status: NEW -> CONTACTED -> CLOSED -> NEW
    let nextStatus: LeadStatusType = 'CONTACTED';
    if (lead.status === 'NEW') nextStatus = 'CONTACTED';
    else if (lead.status === 'CONTACTED') nextStatus = 'CLOSED';
    else if (lead.status === 'CLOSED') nextStatus = 'NEW';

    try {
      setIsUpdatingStatus(leadId);
      const updated = await leadService.updateLeadStatus(leadId, nextStatus);

      // Optimistically update local leads list
      setLeads((prev) =>
        prev.map((item) => {
          const itemId = item.id || item._id;
          if (itemId === leadId) {
            return {
              ...item,
              status: updated.status,
            };
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Failed to update lead status:', err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleNavigateTab = (tab: TabType, path: string) => {
    navigate(path);
    if (onNavigate) onNavigate(tab);
  };

  const primaryGym = gyms[0];
  const primaryGymName = primaryGym?.gymName || user?.gymName || 'Iron Fitness';
  const userName = user?.name ? user.name.split(' ')[0] : 'Provider';
  const isSubProvider = user?.role === 'sub_provider';
  const canCreateGym = !isSubProvider || user?.permissions?.canCreateGym !== false;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-2.5 py-1 bg-white border border-rose-200 rounded-lg text-rose-700 hover:bg-rose-100/60 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP WELCOME & CUMULATIVE MONTHLY STATS BANNER               */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5">
        {/* Left: User Welcome */}
        <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-[#060E1E] to-[#122342] border-2 border-slate-800 flex flex-col items-center justify-center text-white shrink-0 p-1.5 shadow-md">
            <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 text-[#00C49F] mb-0.5" />
            <span className="text-[7px] font-black tracking-tighter uppercase leading-none truncate max-w-[48px]">
              {primaryGymName.split(' ')[0] || 'GYM'}
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 truncate">
              <span>Welcome back, {userName}!</span>
              <span className="shrink-0">👋</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 truncate">
              Here's what's happening with your gym today.
            </p>
          </div>
        </div>

        {/* Center / Right: Cumulative Monthly Metrics */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full xl:w-auto">
          {/* Metric 1: This Month Total Revenue (Cumulative, Closed Leads Only) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border border-emerald-200/80 flex-1 xl:w-64 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-emerald-900">
                This month total revenue
              </span>
              <div className="h-6 w-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight">
                ₹{thisMonthRevenue.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-emerald-700/90 font-medium mt-1 leading-tight">
              Revenue is calculated only with closed (converted) leads.
            </p>
          </div>

          {/* Metric 2: This Month Total Lead (Cumulative) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-sky-50/90 to-blue-50/60 border border-sky-200/80 flex-1 xl:w-56 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-sky-900">
                This month total lead
              </span>
              <div className="h-6 w-6 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-1.5">
              <span className="text-xl sm:text-2xl font-black text-sky-900 tracking-tight">
                {thisMonthTotalLeadsCount}
              </span>
              <span className="text-xs font-bold text-sky-700 ml-1.5">
                lead{thisMonthTotalLeadsCount !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-[10px] text-sky-700/90 font-medium mt-1 leading-tight">
              Cumulative leads across all facilities.
            </p>
          </div>

          {/* Gym Live Status & Public Listing Shortcut */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-200/80 sm:pl-4 shrink-0">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{primaryGym ? `${primaryGym.gymName.split(' ')[0]} is LIVE` : 'Platform LIVE'}</span>
            </div>

            <button
              onClick={() => handleNavigateTab('My Gyms', '/gyms')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center space-x-1 cursor-pointer shrink-0"
              title="View public gym listing"
            >
              <span>View Public Listing</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN WORKSPACE GRID: MY GYMS (LEFT) + RECENT LEADS (RIGHT)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ------------------------------------------------------------ */}
        {/* LEFT COLUMN: PROVIDER'S GYMS GRID (lg:col-span-7 xl:col-span-8) */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00A389]">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  My Gyms
                </h3>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                  Overview of your active fitness centers
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ml-1">
                {gyms.length}
              </span>
            </div>

            {canCreateGym && (
              <button
                onClick={() => handleNavigateTab('My Gyms', '/gyms/new')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#00A389] hover:bg-[#008f78] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Gym</span>
              </button>
            )}
          </div>

          {/* Gym Cards Grid */}
          {gyms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gyms.map((gym) => {
                const gymSlug = gym.slug || gym.gymName.toLowerCase().replace(/\s+/g, '-');
                const gymId = gym._id || gym.id;

                // Leads count for this gym this month
                const gymThisMonthLeadsCount = thisMonthLeads.filter((l) => {
                  const leadGymId = typeof l.gym === 'object' ? l.gym?._id || l.gym?.id : l.gym;
                  return (
                    leadGymId === gymId ||
                    l.gymSlug === gym.slug ||
                    (l.gymName && gym.gymName && l.gymName.toLowerCase() === gym.gymName.toLowerCase())
                  );
                }).length;

                const isLive = gym.status === 'Live' || gym.status === 'APPROVED';
                const isPending = gym.status === 'Pending' || gym.status === 'PENDING_APPROVAL';

                return (
                  <div
                    key={gymId || gymSlug}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* Gym Header: Name, Location & Status */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() => handleNavigateTab('My Gyms', `/gyms/${gymSlug}`)}
                            className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#00A389] transition-colors truncate cursor-pointer"
                            title={gym.gymName}
                          >
                            {gym.gymName}
                          </h4>
                          <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium mt-1 truncate">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{gym.city || gym.address || 'Location Available'}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`shrink-0 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isPending
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isLive ? 'bg-emerald-500 animate-pulse' : isPending ? 'bg-amber-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isLive ? 'Live' : isPending ? 'Pending' : 'Draft'}</span>
                        </span>
                      </div>

                      {/* Data Grid: Price, Average Price, This Month Leads */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {/* Price Box */}
                        <div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-xl">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Price
                          </span>
                          <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                            ₹{gym.dayPassPrice || 0}{' '}
                            <span className="text-[10px] font-normal text-slate-500">/ day pass</span>
                          </span>
                        </div>

                        {/* Average Price Box */}
                        <div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-xl">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Average price
                          </span>
                          <span
                            className="text-xs font-bold text-[#00A389] mt-0.5 block"
                            title="Average price of gyms within 3 km"
                          >
                            ₹{getGymNearbyAvgPrice(gym)}{' '}
                            <span className="text-[10px] font-normal text-slate-500">avg (3 km)</span>
                          </span>
                        </div>
                      </div>

                      {/* This Month Total Lead Box */}
                      <div className="mt-2 p-2.5 bg-teal-50/50 border border-teal-100/70 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                            This month total lead
                          </span>
                          <span className="text-xs font-black text-teal-900">
                            {gymThisMonthLeadsCount} lead{gymThisMonthLeadsCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <Users className="h-4 w-4 text-[#00A389] shrink-0 opacity-80" />
                      </div>
                    </div>

                    {/* Card Footer: View Leads Button */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() =>
                          handleNavigateTab(
                            'Customer Leads',
                            `/leads?gym=${encodeURIComponent(gym.slug || gym.gymName)}`
                          )
                        }
                        className="w-full py-2.5 px-4 bg-[#00A389] hover:bg-[#008f78] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>View Leads</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200/80 rounded-2xl space-y-3">
              <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Gyms Registered Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your gym facility to start getting discovered by customers and receiving pass bookings.
              </p>
              <button
                onClick={() => handleNavigateTab('My Gyms', '/gyms/new')}
                className="px-4 py-2 bg-[#00A389] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#008f78] transition-colors cursor-pointer"
              >
                + Add First Gym
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT COLUMN: RECENT CUSTOMER LEADS (lg:col-span-5 xl:col-span-4) */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-[#00A389]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Customer Leads
                </h3>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
                Latest customer details, display first
              </p>
            </div>

            <button
              onClick={() => handleNavigateTab('Customer Leads', '/leads')}
              className="text-xs font-bold text-[#00A389] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Leads Feed (Display First / Sorted Descending) */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-0.5">
            {latestLeads.length > 0 ? (
              latestLeads.map((lead) => {
                const leadId = lead.id || lead._id || '';
                const isClosed = lead.status === 'CLOSED';
                const isContacted = lead.status === 'CONTACTED';
                const isBusy = isUpdatingStatus === leadId;

                const formattedDate = lead.createdAt
                  ? new Date(lead.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : lead.preferredDate || 'Recent';

                return (
                  <div
                    key={leadId}
                    onClick={() => handleNavigateTab('Customer Leads', `/leads/${leadId}`)}
                    className="p-3.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/70 rounded-xl transition-all cursor-pointer space-y-2 group"
                  >
                    {/* Top Row: Customer Name & Action Button */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-slate-200/80 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {lead.customerName ? lead.customerName[0]?.toUpperCase() : 'C'}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#00A389] transition-colors">
                          {lead.customerName}
                        </h4>
                      </div>

                      {/* Action Button: Status Tag & Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLeadStatus(lead, e)}
                        disabled={isBusy}
                        className={`shrink-0 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center space-x-1 ${
                          isClosed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : isContacted
                            ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                            : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                        }`}
                        title="Click to cycle status: New -> Contacted -> Closed"
                      >
                        {isBusy ? (
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                        ) : isClosed ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : null}
                        <span className="uppercase">
                          {isClosed ? 'closed' : isContacted ? 'contacted' : 'new'}
                        </span>
                      </button>
                    </div>

                    {/* Middle: Assigned Gym Name & Date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <div className="flex items-center space-x-1 text-slate-600 font-medium truncate max-w-[65%]">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{lead.gymName || 'Gym Facility'}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-slate-400 shrink-0">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Bottom: Contact Info & Pass Price */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      {lead.customerPhone ? (
                        <a
                          href={`tel:${lead.customerPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center space-x-1 text-slate-600 hover:text-[#00A389] transition-colors"
                        >
                          <Phone className="h-2.5 w-2.5" />
                          <span>{lead.customerPhone}</span>
                        </a>
                      ) : (
                        <span>Enquiry</span>
                      )}

                      <span className="font-semibold text-slate-600">
                        {lead.dayPassPrice ? `₹${lead.dayPassPrice} pass` : 'General Enquiry'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <Users className="h-8 w-8 mx-auto opacity-30 text-slate-400" />
                <p className="font-semibold text-slate-600">No leads received yet</p>
                <p className="text-[11px] text-slate-400">
                  New customer inquiries and day pass requests will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Information Tip Banner */}
      <InfoBanner />
    </div>
  );
}

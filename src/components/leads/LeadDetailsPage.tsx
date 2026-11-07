import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Building2,
  Calendar,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  User,
  ShieldCheck,
} from 'lucide-react';
import type { CustomerLeadItem, LeadStatusType } from '../../types';
import { leadService } from '../../api/leadService';
import { LeadDetailsSkeleton } from '../skeletons';

interface LeadDetailsPageProps {
  leadId?: string;
  onBack?: () => void;
  onNavigateGym?: (gymSlug: string) => void;
}

export function LeadDetailsPage({ leadId, onBack, onNavigateGym }: LeadDetailsPageProps) {
  const { leadId: urlLeadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const currentLeadId = leadId || urlLeadId || '';

  const [lead, setLead] = useState<CustomerLeadItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/leads');
  };

  const handleNavigateGym = (targetSlug: string) => {
    if (onNavigateGym) onNavigateGym(targetSlug);
    else navigate(`/gyms/${targetSlug}`);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchLead = async () => {
      if (!currentLeadId) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await leadService.getLeadById(currentLeadId);
        if (isMounted) setLead(data);
      } catch (err: any) {
        if (isMounted) setError(err?.message || 'Failed to load lead details.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLead();
    return () => {
      isMounted = false;
    };
  }, [currentLeadId]);

  const handleStatusChange = async (newStatus: LeadStatusType) => {
    if (!lead || lead.status === newStatus) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await leadService.updateLeadStatus(lead.id!, newStatus);
      setLead((prev) => (prev ? { ...prev, status: updated.status } : null));
    } catch (err) {
      console.error('Failed to change status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <LeadDetailsSkeleton />;
  }

  if (error || !lead) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-4 shadow-xs">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Lead Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{error || 'Could not locate the requested customer lead.'}</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-xl bg-[#00A389] text-white text-xs font-bold hover:bg-[#00917a] transition-colors"
        >
          Return to Customer Leads
        </button>
      </div>
    );
  }

  const cleanPhone = (lead.customerPhone || '').replace(/[^0-9]/g, '');
  const initials = lead.customerName
    ? lead.customerName
        .trim()
        .split(/\s+/)
        .map((w) => w[0] || '')
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CL'
    : 'CL';

  return (
    <div className="space-y-6">
      {/* 1. TOP NAVIGATION & BACK BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Customer Leads</span>
        </button>

        {/* Action Shortcuts */}
        <div className="flex items-center space-x-2.5">
          <a
            href={`tel:${lead.customerPhone}`}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
          >
            <Phone className="h-3.5 w-3.5 text-[#00A389]" />
            <span>Call Customer</span>
          </a>

          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. CUSTOMER LEAD HEADER BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-[#060E1E] border border-slate-800 text-[#00C49F] font-black text-xl flex items-center justify-center shadow-md shrink-0">
            {initials}
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {lead.customerName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
              <span className="flex items-center">
                <Building2 className="h-3.5 w-3.5 text-[#00A389] mr-1" />
                {lead.gymName}
              </span>
              <span>&bull;</span>
              <span className="flex items-center">
                <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1" />
                Requested: {lead.preferredDate || 'Flexible date'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Control Switcher */}
        <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Lead Status {isUpdatingStatus && <span className="text-[#00A389] text-[10px]">(Saving...)</span>}
          </p>
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => handleStatusChange('NEW')}
              disabled={isUpdatingStatus}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lead.status === 'NEW'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New
            </button>
            <button
              onClick={() => handleStatusChange('CONTACTED')}
              disabled={isUpdatingStatus}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lead.status === 'CONTACTED'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contacted
            </button>
            <button
              onClick={() => handleStatusChange('CLOSED')}
              disabled={isUpdatingStatus}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lead.status === 'CLOSED'
                  ? 'bg-[#00A389] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* 3. DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Message, Inquiry Details, Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Message Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-[#00A389]" />
              <span>Customer Message & Inquiry</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-700 text-xs leading-relaxed italic">
              "{lead.message || 'No written message provided by customer.'}"
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Preferred Date</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{lead.preferredDate || 'Anytime'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Preferred Time</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{lead.preferredTime || 'Flexible'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Passes Requested</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{lead.numberOfPasses || 1} Pass(es)</span>
              </div>
            </div>
          </div>

          {/* Follow-up Notes & Activity */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#00A389]" />
              <span>Follow-up & Communication History</span>
            </h3>

            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 text-xs text-teal-900 space-y-1">
              <div className="flex items-center justify-between font-bold text-[11px] text-teal-800">
                <span>Status Update</span>
                <span>{lead.updatedAt || 'Recent'}</span>
              </div>
              <p className="text-slate-700">
                {lead.notes || 'Lead received and awaiting response. Reach out via WhatsApp or phone call.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Contact Info & Associated Gym */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="h-4 w-4 text-[#00A389]" />
              <span>Customer Contact</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Phone Number</span>
                <a
                  href={`tel:${lead.customerPhone}`}
                  className="font-bold text-[#00A389] hover:underline text-sm block mt-0.5"
                >
                  {lead.customerPhone}
                </a>
              </div>

              {lead.customerEmail && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">Email Address</span>
                  <a
                    href={`mailto:${lead.customerEmail}`}
                    className="font-medium text-slate-700 hover:text-[#00A389] block mt-0.5"
                  >
                    {lead.customerEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Associated Gym Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-[#00A389]" />
              <span>Target Gym Listing</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="text-sm font-black text-slate-900">{lead.gymName}</h4>
                <p className="text-slate-500 mt-0.5">{lead.gymCity || lead.gymAddress}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Day Pass</span>
                  <p className="text-sm font-black text-slate-900">
                    {lead.dayPassPrice ? `₹${lead.dayPassPrice}` : 'Unpriced'}
                  </p>
                </div>
                {lead.monthlyMembershipPrice ? (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Monthly</span>
                    <p className="text-sm font-black text-slate-900">₹{lead.monthlyMembershipPrice}</p>
                  </div>
                ) : null}
                {lead.threeMonthMembershipPrice ? (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">3 Months</span>
                    <p className="text-sm font-black text-teal-700">₹{lead.threeMonthMembershipPrice}</p>
                  </div>
                ) : null}
              </div>

              {lead.gymSlug && (
                <button
                  onClick={() => handleNavigateGym(lead.gymSlug!)}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <span>View Gym Details</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

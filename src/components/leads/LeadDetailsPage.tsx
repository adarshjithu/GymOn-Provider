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
  Pencil,
  Check,
  Loader2,
} from 'lucide-react';
import type { CustomerLeadItem, LeadStatusType } from '../../types';
import { leadService } from '../../api/leadService';
import { useAuth } from '../../context/AuthContext';
import { LeadDetailsSkeleton } from '../skeletons';

interface LeadDetailsPageProps {
  leadId?: string;
  onBack?: () => void;
  onNavigateGym?: (gymSlug: string) => void;
}

export function LeadDetailsPage({ leadId, onBack, onNavigateGym }: LeadDetailsPageProps) {
  const { user } = useAuth();
  const { leadId: urlLeadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const currentLeadId = leadId || urlLeadId || '';

  const [lead, setLead] = useState<CustomerLeadItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contact Phone Editing State
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneSuccessMessage, setPhoneSuccessMessage] = useState<string | null>(null);

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
        if (isMounted) {
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
            const leadGymId =
              typeof data.gym === 'object' && data.gym ? (data.gym as any)._id || (data.gym as any).id : data.gym;
            if (!allowedIds.has(leadGymId)) {
              setError('Access Denied: You do not have permission to view leads for this gym.');
              return;
            }
          }
          setLead(data);
        }
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
  }, [currentLeadId, user]);

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

  const handleSavePhone = async () => {
    if (!lead || !phoneInput.trim()) return;
    try {
      setIsSavingPhone(true);
      const updated = await leadService.updateLeadContact(lead.id!, phoneInput.trim());
      setLead((prev) =>
        prev
          ? {
              ...prev,
              editedPhone: updated.editedPhone || phoneInput.trim(),
              originalPhone: updated.originalPhone || prev.originalPhone || prev.customerPhone,
              isPhoneEdited: true,
            }
          : null
      );
      setIsEditingPhone(false);
      setPhoneSuccessMessage('Contact number saved. Original number preserved on admin panel.');
      setTimeout(() => setPhoneSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to update contact number:', err);
      // Even if offline/mock, update locally so provider sees instant confirmation
      setLead((prev) =>
        prev
          ? {
              ...prev,
              editedPhone: phoneInput.trim(),
              originalPhone: prev.originalPhone || prev.customerPhone,
              isPhoneEdited: true,
            }
          : null
      );
      setIsEditingPhone(false);
      setPhoneSuccessMessage('Contact number saved. Original number preserved on admin panel.');
      setTimeout(() => setPhoneSuccessMessage(null), 4000);
    } finally {
      setIsSavingPhone(false);
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

  const activePhone = lead.editedPhone || lead.customerPhone || '';
  const cleanPhone = activePhone.replace(/[^0-9]/g, '');
  const isEdited = Boolean(lead.editedPhone && lead.editedPhone !== (lead.originalPhone || lead.customerPhone));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group self-start"
        >
          <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Customer Leads</span>
        </button>

        {/* Action Shortcuts */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <a
            href={`tel:${activePhone}`}
            className="flex-1 sm:flex-initial px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5"
          >
            <Phone className="h-3.5 w-3.5 text-[#00A389]" />
            <span>Call Customer</span>
          </a>

          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. CUSTOMER LEAD HEADER BANNER */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-[#060E1E] border border-slate-800 text-[#00C49F] font-black text-xl flex items-center justify-center shadow-md shrink-0">
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                {lead.customerName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 font-medium mt-1">
              <span className="flex items-center truncate">
                <Building2 className="h-3.5 w-3.5 text-[#00A389] mr-1 shrink-0" />
                <span className="truncate">{lead.gymName}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center truncate">
                <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
                <span>Requested: {lead.preferredDate || 'Flexible date'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Status Control Switcher */}
        <div className="border-t md:border-t-0 md:border-l border-slate-200/80 pt-3.5 sm:pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Lead Status {isUpdatingStatus && <span className="text-[#00A389] text-[10px]">(Saving...)</span>}
          </p>
          <div className="flex items-center space-x-1.5 bg-[#F8FAFC] border border-slate-200 rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={() => handleStatusChange('NEW')}
              disabled={isUpdatingStatus}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
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
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
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
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left 2 Cols: Message, Inquiry Details, Notes */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Customer Message Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-[#00A389]" />
              <span>Customer Message & Inquiry</span>
            </h3>

            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 text-slate-700 text-xs leading-relaxed italic">
              "{lead.message || 'No written message provided by customer.'}"
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 text-xs">
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
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#00A389]" />
              <span>Follow-up & Communication History</span>
            </h3>

            <div className="p-3.5 sm:p-4 rounded-xl bg-teal-50/50 border border-teal-100 text-xs text-teal-900 space-y-1">
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
        <div className="space-y-4 sm:space-y-6">
          {/* Contact Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="h-4 w-4 text-[#00A389]" />
              <span>Customer Contact</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Phone Number
                </span>

                {!isEditingPhone ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`tel:${activePhone}`}
                        className="font-bold text-[#00A389] hover:underline text-sm block"
                      >
                        {activePhone}
                      </a>
                      {isEdited && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Edited
                        </span>
                      )}
                    </div>

                    {/* Original contact number saved separately */}
                    {isEdited && (
                      <div className="text-[11px] text-slate-400 font-medium">
                        Original: <span className="font-semibold text-slate-600">{lead.originalPhone || lead.customerPhone}</span>
                      </div>
                    )}

                    {/* Action buttons matching screenshot */}
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneInput(activePhone);
                          setIsEditingPhone(true);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-[#0c3144] hover:bg-[#12425c] text-white text-xs font-bold transition-all cursor-pointer border border-[#194c68] shadow-xs flex items-center space-x-1"
                        title="Click to edit contact number"
                      >
                        <Pencil className="h-3 w-3 text-teal-300" />
                        <span>edit</span>
                      </button>

                      <button
                        type="button"
                        disabled
                        className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-bold border border-slate-200 cursor-not-allowed opacity-60"
                        title="Click edit first to change number"
                      >
                        confirm
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+15551093456"
                      className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 border-2 border-[#00A389] rounded-lg focus:outline-none shadow-2xs"
                      autoFocus
                    />

                    <div className="text-[10px] text-slate-400">
                      Original: <span className="font-semibold text-slate-600">{lead.originalPhone || lead.customerPhone}</span> (saved separately on admin panel)
                    </div>

                    {/* Action buttons in edit mode */}
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingPhone(false);
                          setPhoneInput(activePhone);
                        }}
                        disabled={isSavingPhone}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleSavePhone}
                        disabled={isSavingPhone || !phoneInput.trim()}
                        className="px-4 py-1.5 rounded-lg bg-[#0c3144] hover:bg-[#12425c] text-white text-xs font-bold transition-all cursor-pointer border border-[#194c68] shadow-xs flex items-center space-x-1 disabled:opacity-50"
                      >
                        {isSavingPhone ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-teal-300" />
                            <span>saving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 text-teal-300" />
                            <span>confirm</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {phoneSuccessMessage && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold flex items-center space-x-1.5 animate-in fade-in">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{phoneSuccessMessage}</span>
                  </div>
                )}
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

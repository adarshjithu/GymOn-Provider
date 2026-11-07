import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Eye,
  EyeOff,
  Save,
  Copy,
  Check,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../api/profileService';
import { gymService } from '../../api/gymService';
import type { ProviderProfile, GymItem } from '../../types';
import { ProfileSkeleton } from '../skeletons';

interface ProfilePageProps {
  onLogout?: () => void;
  onNavigateGym?: (slug: string) => void;
  onNavigateGyms?: () => void;
}

export function ProfilePage({ onLogout, onNavigateGym, onNavigateGyms }: ProfilePageProps) {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleNavigateGym = (slug: string) => {
    if (onNavigateGym) onNavigateGym(slug);
    else navigate(`/gyms/${slug}`);
  };

  const handleNavigateGyms = () => {
    if (onNavigateGyms) onNavigateGyms();
    else navigate('/gyms');
  };

  // Profile data & loading states
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit Profile Form State
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);

  // Copy ID State
  const [copiedId, setCopiedId] = useState<boolean>(false);

  // Fetch provider profile and gyms from live API
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);

      // Fetch profile & gyms in parallel
      const [profileData, gymsData] = await Promise.all([
        profileService.getProfile(),
        gymService.getProviderGyms().catch(() => []),
      ]);

      setProfile(profileData);
      setGyms(gymsData);
      setName(profileData.name || '');
      setPhone(profileData.phone || '');
    } catch (err: any) {
      console.error('Failed to load profile from backend:', err);
      setFetchError(err?.message || 'Unable to connect to the backend server.');
      // Initialize with session user if available
      if (authUser) {
        setName(authUser.name || '');
        setPhone(authUser.phone || '');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    if (!name.trim()) {
      setProfileErrorMsg('Name cannot be empty.');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const updated = await profileService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));
      updateUser({
        ...(authUser || {}),
        name: updated.name,
        phone: updated.phone,
        email: updated.email || authUser?.email || '',
      });

      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg(null);
    setPassErrorMsg(null);

    if (!currentPassword) {
      setPassErrorMsg('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPassErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassErrorMsg('New password and confirmation do not match.');
      return;
    }

    try {
      setIsChangingPass(true);
      const msg = await profileService.changePassword({
        currentPassword,
        newPassword,
      });

      setPassSuccessMsg(msg || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccessMsg(null), 4000);
    } catch (err: any) {
      setPassErrorMsg(err?.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Copy Provider ID helper
  const handleCopyId = () => {
    const idToCopy = profile?.id || profile?._id || authUser?.id || authUser?._id;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Computed display values
  const displayName = profile?.name || authUser?.name || 'Provider';
  const displayEmail = profile?.email || authUser?.email || 'provider@gymon.com';
  const displayPhone = profile?.phone || authUser?.phone || '+91 98765 43210';
  const displayGymCount = profile?.stats?.totalGyms ?? gyms.length;
  const displayLeadsCount = profile?.stats?.totalLeads ?? 0;
  const providerId = profile?.id || profile?._id || authUser?.id || authUser?._id || 'N/A';

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'IF';

  const formattedJoinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'September 2026';

  if (isLoading && !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. TOP SUMMARY BANNER CARD */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background gradient accent */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-teal-50/60 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-5">
            {/* Big Avatar */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-[#00A389] to-[#00C49F] text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-md shadow-[#00C49F]/25 shrink-0 border-2 border-white">
              {initials}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                  {displayName}
                </h2>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verified Provider</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-slate-500">
                <span className="flex items-center space-x-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{displayEmail}</span>
                </span>
                <span className="flex items-center space-x-1.5 truncate">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{displayPhone}</span>
                </span>
                <span className="flex items-center space-x-1.5 truncate">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Partner since {formattedJoinDate}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0 pt-2 sm:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center w-full sm:min-w-[110px]">
              <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {isLoading ? '-' : displayGymCount}
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 mt-0.5">My Gyms</p>
            </div>

            <div className="bg-teal-50/50 border border-teal-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center w-full sm:min-w-[110px]">
              <div className="text-lg sm:text-xl font-black text-[#00A389] leading-tight">
                {isLoading ? '-' : displayLeadsCount}
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-teal-800 mt-0.5">Total Leads</p>
            </div>
          </div>
        </div>
      </div>

      {/* SERVER ERROR BANNER */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Could not sync latest stats with server. Live updates might require running the backend.
            </span>
          </div>
          <button
            onClick={loadProfileData}
            className="flex items-center space-x-1 font-bold text-[#00A389] hover:underline cursor-pointer ml-3"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 2. MAIN GRID: PROFILE FORM & PASSWORD FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* PERSONAL DETAILS CARD */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-[#00A389] flex items-center justify-center shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
              <p className="text-xs text-slate-500">Update your public name and direct contact phone.</p>
            </div>
          </div>

          {/* Success Message */}
          {profileSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Error Message */}
          {profileErrorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Email Address (Read-only credential) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Email Address
                </label>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Primary & Locked
                </span>
              </div>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={displayEmail}
                  disabled
                  className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-500 font-medium cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used to log into GYMON Provider Portal. Contact support to change your account email.
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Account Role / Access */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Account Role
              </label>
              <div className="relative">
                <ShieldCheck className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value="Gym Provider / Business Owner"
                  disabled
                  className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-600 font-medium cursor-not-allowed select-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00A389] hover:bg-[#00917a] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SECURITY & PASSWORD CARD */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Security & Password</h3>
              <p className="text-xs text-slate-500">Manage your password to keep your portal secure.</p>
            </div>
          </div>

          {/* Success Message */}
          {passSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{passSuccessMsg}</span>
            </div>
          )}

          {/* Error Message */}
          {passErrorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{passErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                minLength={6}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#00A389] focus:bg-white transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isChangingPass ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. REGISTERED GYMS SECTION */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 text-[#00A389] flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Gyms</h3>
              <p className="text-xs text-slate-500">
                Gym locations operated under this provider account.
              </p>
            </div>
          </div>

          <button
            onClick={handleNavigateGyms}
            className="text-xs font-bold text-[#00A389] hover:underline cursor-pointer"
          >
            View All Gyms →
          </button>
        </div>

        {gyms.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No gyms registered under this account yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gyms.map((gym) => (
              <div
                key={gym.id || gym.slug}
                onClick={() => handleNavigateGym(gym.slug)}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-teal-50/40 hover:border-[#00A389]/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 group-hover:text-[#00A389] transition-colors text-xs">
                      {gym.gymName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {gym.status || 'Live'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{gym.address}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    ₹{gym.dayPassPrice} / pass
                  </span>
                  <span className="text-[#00A389] font-bold group-hover:translate-x-0.5 transition-transform">
                    Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ACCOUNT METADATA & DANGER ZONE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-900">Provider Account ID</p>
          <div className="flex items-center space-x-2">
            <code className="text-[11px] font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 border border-slate-200">
              {providerId}
            </code>
            <button
              onClick={handleCopyId}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Copy ID"
            >
              {copiedId ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            {copiedId && (
              <span className="text-[10px] font-bold text-emerald-600 animate-fadeIn">
                Copied!
              </span>
            )}
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out of Portal</span>
          </button>
        )}
      </div>
    </div>
  );
}
